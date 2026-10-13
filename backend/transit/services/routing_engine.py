import math
from datetime import datetime, timedelta
from django.utils import timezone
from typing import List, Dict, Any, Optional, Tuple

from ..models import Stop, Route, RouteStop, Transfer, VehiclePosition, ServiceAlert
from .geocoding_service import GeocodingService
from .fare_engine import FareEngine

class MultimodalRoutingEngine:
    """
    Ahmedabad + Gandhinagar + GIFT City Unified Multimodal Routing Engine.
    Combines:
    - GMRC Metro (Phase 1 Blue/Red Lines + Phase 2 Gandhinagar Extension + GIFT City Branch)
    - Janmarg BRTS Busway Network
    - AMTS Municipal Feeder Bus Lines
    - Indian Railways Intercity Suburban Corridor (Kalupur ↔ Sabarmati ↔ Gandhinagar Capital)
    - Gandhinagar Local Buses, GSRTC Intercity, and GIFT City Electric Shuttles
    - Pedestrian Walking Links

    Optimizes across 7 categories:
    1. FASTEST
    2. CHEAPEST
    3. LEAST WALKING
    4. FEWEST TRANSFERS
    5. MOST RELIABLE
    6. MINIMUM WAIT
    7. ACCESSIBLE
    """

    @classmethod
    def plan_journey(
        cls,
        from_name: str,
        to_name: str,
        from_lat: Optional[float] = None,
        from_lng: Optional[float] = None,
        to_lat: Optional[float] = None,
        to_lng: Optional[float] = None,
        departure_time_str: str = 'now',
        arrive_by_str: Optional[str] = None,
        preference: str = 'fastest',
        modes: Optional[List[str]] = None,
        wheelchair_accessible: bool = False,
        max_walking_mins: int = 25,
    ) -> Dict[str, Any]:
        now = timezone.localtime(timezone.now())

        # Resolve Origin and Destination
        start_name, start_lat, start_lng = GeocodingService.resolve_location(from_name, from_lat, from_lng)
        dest_name, dest_lat, dest_lng = GeocodingService.resolve_location(to_name, to_lat, to_lng)

        # Base departure time
        if arrive_by_str:
            try:
                t_parts = [int(p) for p in arrive_by_str.split(':')]
                target_arrival = now.replace(hour=t_parts[0], minute=t_parts[1], second=0)
                if target_arrival < now:
                    target_arrival += timedelta(days=1)
            except Exception:
                target_arrival = now + timedelta(minutes=50)
            base_dep_time = target_arrival - timedelta(minutes=50)
        else:
            base_dep_time = now

        allowed_modes = modes or ['METRO', 'BRTS', 'AMTS', 'GANDHINAGAR_ELECTRIC_BUS', 'RAIL', 'BUS', 'WALK']

        # Find nearby candidate stops (expanded radius for cross-city hubs)
        origin_stops = GeocodingService.find_nearby_stops(start_lat, start_lng, radius_km=4.5, limit=12)
        dest_stops = GeocodingService.find_nearby_stops(dest_lat, dest_lng, radius_km=4.5, limit=12)

        if wheelchair_accessible:
            origin_stops = [s for s in origin_stops if s.get('wheelchair_accessible', True)]
            dest_stops = [s for s in dest_stops if s.get('wheelchair_accessible', True)]

        # Find transit candidate combinations
        candidate_routes = cls._find_transit_combinations(
            origin_stops, dest_stops,
            start_name, start_lat, start_lng,
            dest_name, dest_lat, dest_lng,
            base_dep_time, allowed_modes, wheelchair_accessible
        )

        if not candidate_routes:
            dist_km = GeocodingService.haversine_distance_km(start_lat, start_lng, dest_lat, dest_lng)
            walk_mins = max(3, math.ceil((dist_km / 4.5) * 60))
            candidate_routes = [cls._build_pure_walk_route(
                start_name, start_lat, start_lng,
                dest_name, dest_lat, dest_lng,
                dist_km, walk_mins, base_dep_time
            )]

        # Evaluate delays & dynamic alternative callouts
        delay_callout = cls._evaluate_delay_rerouting(candidate_routes)

        # Categorize into the 7 optimization options
        categorized_routes = cls._rank_and_categorize_routes(candidate_routes, preference)

        # Leave-By calculation
        leave_by_summary = None
        if arrive_by_str:
            best_route = categorized_routes[0]
            safety_buffer_mins = 10
            rec_dep = target_arrival - timedelta(minutes=best_route['duration_minutes'] + safety_buffer_mins)
            leave_by_summary = {
                'target_arrival_time': target_arrival.strftime('%I:%M %p'),
                'recommended_departure_time': rec_dep.strftime('%I:%M %p'),
                'expected_arrival_time': (rec_dep + timedelta(minutes=best_route['duration_minutes'])).strftime('%I:%M %p'),
                'safety_buffer_minutes': safety_buffer_mins,
            }

        return {
            'origin': {
                'name': start_name,
                'latitude': start_lat,
                'longitude': start_lng,
            },
            'destination': {
                'name': dest_name,
                'latitude': dest_lat,
                'longitude': dest_lng,
            },
            'departure_time': base_dep_time.strftime('%I:%M %p'),
            'requested_preference': preference,
            'allowed_modes': allowed_modes,
            'wheelchair_accessible': wheelchair_accessible,
            'leave_by_summary': leave_by_summary,
            'delay_alert_callout': delay_callout,
            'routes': categorized_routes,
            'total_options': len(categorized_routes),
        }

    @classmethod
    def _find_transit_combinations(
        cls,
        origin_stops: List[Dict[str, Any]],
        dest_stops: List[Dict[str, Any]],
        start_name: str, start_lat: float, start_lng: float,
        dest_name: str, dest_lat: float, dest_lng: float,
        dep_time: datetime,
        allowed_modes: List[str],
        wheelchair_accessible: bool
    ) -> List[Dict[str, Any]]:
        routes = []

        # 1. Direct Single-Line Transit Routes (best boarding/alighting pair per route)
        best_direct_by_route: Dict[str, Dict[str, Any]] = {}
        for o_stop in origin_stops:
            o_stop_id = o_stop['stop_id']
            o_rs_list = RouteStop.objects.filter(stop__stop_id=o_stop_id).select_related('route', 'stop')

            for o_rs in o_rs_list:
                route = o_rs.route
                if not route.is_active or route.mode not in allowed_modes:
                    continue

                for d_stop in dest_stops:
                    d_stop_id = d_stop['stop_id']
                    if o_stop_id == d_stop_id:
                        continue

                    d_rs = RouteStop.objects.filter(route=route, stop__stop_id=d_stop_id).exclude(sequence=o_rs.sequence).select_related('stop').first()
                    if d_rs:
                        walk_total = o_stop['walking_time_mins'] + d_stop['walking_time_mins']
                        stops_count = abs(d_rs.sequence - o_rs.sequence)
                        # Avoid taking a 1-stop trip that leaves user with excessive walking
                        if stops_count <= 2 and walk_total > 20:
                            continue

                        r_obj = cls._build_direct_journey(
                            start_name, start_lat, start_lng,
                            o_stop, o_rs,
                            dest_name, dest_lat, dest_lng,
                            d_stop, d_rs,
                            route, dep_time
                        )

                        # Keep the best boarding/alighting station pair for this specific route (minimize duration & walking)
                        prev_best = best_direct_by_route.get(route.route_id)
                        if not prev_best or r_obj['duration_minutes'] < prev_best['duration_minutes']:
                            best_direct_by_route[route.route_id] = r_obj

        routes.extend(best_direct_by_route.values())

        # 2a. Direct Common-Stop Transfer Interchange (e.g. Motera Stadium, Old High Court, GNLU, Tapovan, Infocity)
        best_transfers_by_pair: Dict[Tuple[str, str, Any], Dict[str, Any]] = {}
        for o_stop in origin_stops:
            o_rs_list = RouteStop.objects.filter(stop__stop_id=o_stop['stop_id']).select_related('route')
            for o_rs in o_rs_list:
                r1 = o_rs.route
                if not r1.is_active or r1.mode not in allowed_modes:
                    continue

                r1_stops = RouteStop.objects.filter(route=r1).exclude(sequence=o_rs.sequence).select_related('stop')
                r1_stop_map = {rs.stop.stop_id: rs for rs in r1_stops}

                for d_stop in dest_stops:
                    d_rs_list = RouteStop.objects.filter(stop__stop_id=d_stop['stop_id']).select_related('route')
                    for d_rs in d_rs_list:
                        r2 = d_rs.route
                        if not r2.is_active or r2.mode not in allowed_modes or r1.route_id == r2.route_id:
                            continue

                        r2_stops = RouteStop.objects.filter(route=r2).exclude(sequence=d_rs.sequence).select_related('stop')
                        for t2_rs in r2_stops:
                            common_id = t2_rs.stop.stop_id
                            if common_id in r1_stop_map:
                                t1_rs = r1_stop_map[common_id]
                                common_stop = t1_rs.stop
                                virtual_transfer = Transfer(
                                    from_stop=common_stop,
                                    to_stop=common_stop,
                                    transfer_type='INTERCHANGE',
                                    walking_distance_m=40,
                                    walking_time_mins=1.0,
                                    transfer_penalty_mins=2.0,
                                    instructions=f"Transfer at {common_stop.name} concourse from {r1.route_number} to {r2.route_number}",
                                    from_platform=common_stop.platform_info or 'Platform 1',
                                    to_platform=common_stop.platform_info or 'Platform 2',
                                    stand_number='',
                                    transfer_buffer_mins=4.0,
                                    is_step_free=common_stop.wheelchair_accessible
                                )
                                r_obj = cls._build_transfer_journey(
                                    start_name, start_lat, start_lng,
                                    o_stop, o_rs,
                                    virtual_transfer, t1_rs, t2_rs,
                                    dest_name, dest_lat, dest_lng,
                                    d_stop, d_rs,
                                    r1, r2, dep_time
                                )
                                pair_key = (r1.route_id, r2.route_id, common_id)
                                prev_t = best_transfers_by_pair.get(pair_key)
                                if not prev_t or r_obj['duration_minutes'] < prev_t['duration_minutes']:
                                    best_transfers_by_pair[pair_key] = r_obj

        # 2b. Explicit Cross-Station Walking Transfers (e.g. Bus Stand <-> Metro Station)
        transfers = Transfer.objects.all().select_related('from_stop', 'to_stop')
        for transfer in transfers:
            if wheelchair_accessible and not transfer.is_step_free:
                continue

            for o_stop in origin_stops:
                o_rs_list = RouteStop.objects.filter(stop__stop_id=o_stop['stop_id']).select_related('route')
                for o_rs in o_rs_list:
                    r1 = o_rs.route
                    if not r1.is_active or r1.mode not in allowed_modes:
                        continue

                    t_from_rs = RouteStop.objects.filter(route=r1, stop=transfer.from_stop).exclude(sequence=o_rs.sequence).first()
                    if not t_from_rs:
                        continue

                    for d_stop in dest_stops:
                        d_rs_list = RouteStop.objects.filter(stop__stop_id=d_stop['stop_id']).select_related('route')
                        for d_rs in d_rs_list:
                            r2 = d_rs.route
                            if not r2.is_active or r2.mode not in allowed_modes or r1.route_id == r2.route_id:
                                continue

                            t_to_rs = RouteStop.objects.filter(route=r2, stop=transfer.to_stop).exclude(sequence=d_rs.sequence).first()
                            if t_to_rs:
                                r_obj = cls._build_transfer_journey(
                                    start_name, start_lat, start_lng,
                                    o_stop, o_rs,
                                    transfer, t_from_rs, t_to_rs,
                                    dest_name, dest_lat, dest_lng,
                                    d_stop, d_rs,
                                    r1, r2, dep_time
                                )
                                pair_key = (r1.route_id, r2.route_id, transfer.id)
                                prev_t = best_transfers_by_pair.get(pair_key)
                                if not prev_t or r_obj['duration_minutes'] < prev_t['duration_minutes']:
                                    best_transfers_by_pair[pair_key] = r_obj

        routes.extend(best_transfers_by_pair.values())
        return routes

    @classmethod
    def _build_direct_journey(
        cls,
        start_name: str, start_lat: float, start_lng: float,
        o_stop: Dict[str, Any], o_rs: RouteStop,
        dest_name: str, dest_lat: float, dest_lng: float,
        d_stop: Dict[str, Any], d_rs: RouteStop,
        route: Route,
        dep_time: datetime
    ) -> Dict[str, Any]:
        walk1_mins = o_stop['walking_time_mins']
        walk1_dist_km = o_stop['distance_km']

        headway = route.headway_peak_mins if (7 <= dep_time.hour <= 11 or 17 <= dep_time.hour <= 21) else route.headway_offpeak_mins
        wait_mins = max(2, math.ceil(headway / 2.0))

        live_vp = VehiclePosition.objects.filter(vehicle__current_route=route).select_related('vehicle').first()
        delay_mins = live_vp.delay_minutes if live_vp else 0
        is_live = live_vp.is_live if live_vp else False

        stops_count = abs(d_rs.sequence - o_rs.sequence)
        speed_factor = 2.0 if route.mode == 'METRO' else (2.5 if route.mode == 'BRTS' else (2.0 if route.mode == 'GANDHINAGAR_ELECTRIC_BUS' else (1.8 if route.mode == 'RAIL' else 3.0)))
        in_transit_mins = max(2.0, stops_count * speed_factor)
        transit_dist_km = max(0.5, abs(d_rs.distance_from_start_km - o_rs.distance_from_start_km))

        walk2_mins = d_stop['walking_time_mins']
        walk2_dist_km = d_stop['distance_km']

        total_walk_mins = walk1_mins + walk2_mins
        total_duration = total_walk_mins + wait_mins + in_transit_mins + delay_mins
        total_dist_km = walk1_dist_km + transit_dist_km + walk2_dist_km
        total_walk_dist_km = round(walk1_dist_km + walk2_dist_km, 2)

        arr_time = dep_time + timedelta(minutes=total_duration)

        steps = []
        cur_t = dep_time

        # 1. Walk to First Stop
        steps.append({
            'step_type': 'WALK',
            'mode': 'WALK',
            'title': f"Walk to {o_stop['name']}",
            'instructions': f"Walk {int(walk1_dist_km * 1000)}m to {o_stop['name']}",
            'from_name': start_name,
            'to_name': o_stop['name'],
            'duration_mins': walk1_mins,
            'distance_km': walk1_dist_km,
            'departure_time': cur_t.strftime('%I:%M %p'),
            'arrival_time': (cur_t + timedelta(minutes=walk1_mins)).strftime('%I:%M %p'),
            'coordinates': [[start_lat, start_lng], [o_stop['latitude'], o_stop['longitude']]],
            'is_transfer': False,
        })
        cur_t += timedelta(minutes=walk1_mins + wait_mins)

        # 2. Transit Ride
        transit_arr = cur_t + timedelta(minutes=in_transit_mins + delay_mins)
        coords = cls._get_route_coordinates(route, o_rs.sequence, d_rs.sequence)

        mode_display = 'Gandhinagar Electric Bus' if route.mode == 'GANDHINAGAR_ELECTRIC_BUS' else route.mode
        steps.append({
            'step_type': 'TRANSIT',
            'mode': route.mode,
            'agency_code': route.agency.code,
            'agency_name': route.agency.name,
            'route_id': route.route_id,
            'route_number': route.route_number,
            'route_name': route.route_name,
            'route_color': route.color,
            'title': f"Board {mode_display} {route.route_number}",
            'instructions': f"Take {mode_display} {route.route_number} from {o_stop['name']} toward {d_stop['name']} ({stops_count} stops)",
            'from_name': o_stop['name'],
            'from_stop_id': o_stop['stop_id'],
            'to_name': d_stop['name'],
            'to_stop_id': d_stop['stop_id'],
            'platform_info': o_stop.get('platform_info', ''),
            'stops_count': stops_count,
            'duration_mins': in_transit_mins,
            'waiting_mins': wait_mins,
            'distance_km': round(transit_dist_km, 1),
            'fare': int(FareEngine.calculate_leg_fare(route.mode, transit_dist_km)),
            'fare_currency': '₹',
            'departure_time': cur_t.strftime('%I:%M %p'),
            'arrival_time': transit_arr.strftime('%I:%M %p'),
            'coordinates': coords,
            'is_transfer': False,
            'is_step_free': o_stop.get('wheelchair_accessible', True) and d_stop.get('wheelchair_accessible', True),
            'vehicle': {
                'vehicle_id': live_vp.vehicle.vehicle_id,
                'registration': live_vp.vehicle.registration,
                'fleet_number': live_vp.vehicle.fleet_number,
                'operator': live_vp.vehicle.operator or live_vp.vehicle.agency.name,
                'vehicle_type': live_vp.vehicle.vehicle_type,
                'is_electric': live_vp.vehicle.is_electric,
                'battery_status': live_vp.vehicle.battery_status,
                'charging_status': live_vp.vehicle.charging_status,
                'speed_kmh': live_vp.speed_kmh,
                'status': live_vp.status,
                'telemetry_type': live_vp.telemetry_type,
                'delay_minutes': delay_mins,
                'is_live': is_live,
                'data_source': live_vp.data_source,
                'current_location_name': live_vp.current_location_name,
            } if live_vp else None,
        })
        cur_t = transit_arr

        # 3. Walk to Destination
        steps.append({
            'step_type': 'WALK',
            'mode': 'WALK',
            'title': f"Walk to {dest_name}",
            'instructions': f"Walk {int(walk2_dist_km * 1000)}m to arrive at {dest_name}",
            'from_name': d_stop['name'],
            'to_name': dest_name,
            'duration_mins': walk2_mins,
            'distance_km': walk2_dist_km,
            'departure_time': cur_t.strftime('%I:%M %p'),
            'arrival_time': arr_time.strftime('%I:%M %p'),
            'coordinates': [[d_stop['latitude'], d_stop['longitude']], [dest_lat, dest_lng]],
            'is_transfer': False,
        })

        fare_calc = FareEngine.calculate_journey_fare(steps)

        # Build Why Recommended bullet points
        why_points = [
            f"Direct single-ride {mode_display} connection with 0 transfers",
            f"Next vehicle departing in ~{wait_mins} min",
            f"High punctuality with {int(route.reliability_score * 100)}% reliability score",
        ]
        if route.is_electric:
            why_points.append("100% Zero-Emission PM-eBus Sewa AC Electric Bus")
        if route.mode in ['METRO', 'BRTS', 'RAIL']:
            why_points.append("Dedicated corridor bypassing arterial road traffic")

        return {
            'route_key': f"{route.route_id}_direct_{o_stop['stop_id']}_{d_stop['stop_id']}",
            'type': f"DIRECT_{route.mode}",
            'summary_title': f"Direct {mode_display} ({route.route_number})",
            'modes': ['WALK', route.mode],
            'primary_mode': route.mode,
            'duration_minutes': int(total_duration),
            'walking_minutes': int(total_walk_mins),
            'waiting_minutes': int(wait_mins),
            'transfers': 0,
            'fare': fare_calc['total_fare'],
            'fare_currency': '₹',
            'fare_breakdown': fare_calc['breakdown'],
            'departure_time': dep_time.strftime('%I:%M %p'),
            'arrival_time': arr_time.strftime('%I:%M %p'),
            'total_distance_km': round(total_dist_km, 1),
            'walking_distance_km': total_walk_dist_km,
            'reliability_score': route.reliability_score,
            'is_live': is_live,
            'delay_minutes': delay_mins,
            'why_recommended': why_points,
            'steps': steps,
            'polyline': [c for s in steps for c in s.get('coordinates', [])],
        }

    @classmethod
    def _build_transfer_journey(
        cls,
        start_name: str, start_lat: float, start_lng: float,
        o_stop: Dict[str, Any], o_rs: RouteStop,
        transfer: Transfer, t_from_rs: RouteStop, t_to_rs: RouteStop,
        dest_name: str, dest_lat: float, dest_lng: float,
        d_stop: Dict[str, Any], d_rs: RouteStop,
        r1: Route, r2: Route,
        dep_time: datetime
    ) -> Dict[str, Any]:
        # Leg 1: Walk to origin stop
        walk1_mins = o_stop['walking_time_mins']
        walk1_dist_km = o_stop['distance_km']

        hw1 = r1.headway_peak_mins if (7 <= dep_time.hour <= 11 or 17 <= dep_time.hour <= 21) else r1.headway_offpeak_mins
        wait1_mins = max(2, math.ceil(hw1 / 2.0))

        stops1_count = abs(t_from_rs.sequence - o_rs.sequence)
        speed1 = 2.0 if r1.mode == 'METRO' else (2.5 if r1.mode == 'BRTS' else (2.0 if r1.mode == 'GANDHINAGAR_ELECTRIC_BUS' else (1.8 if r1.mode == 'RAIL' else 3.0)))
        in_transit1_mins = max(2.0, stops1_count * speed1)
        dist1_km = max(0.5, abs(t_from_rs.distance_from_start_km - o_rs.distance_from_start_km))

        # Transfer Node
        transfer_walk_mins = transfer.walking_time_mins
        hw2 = r2.headway_peak_mins if (7 <= dep_time.hour <= 11 or 17 <= dep_time.hour <= 21) else r2.headway_offpeak_mins
        wait2_mins = max(2, math.ceil(hw2 / 2.0))

        # Transfer intelligence calculation & Transfer Risk
        transfer_window_mins = max(3.0, math.ceil(transfer_walk_mins + transfer.transfer_buffer_mins + wait2_mins))
        available_connection_mins = wait2_mins + transfer_walk_mins
        is_tight = transfer_walk_mins >= (available_connection_mins - 1.0)
        transfer_risk = 'HIGH_RISK' if is_tight else ('MODERATE' if transfer_walk_mins >= (available_connection_mins - 2.5) else 'SAFE')

        # Leg 2
        stops2_count = abs(d_rs.sequence - t_to_rs.sequence)
        speed2 = 2.0 if r2.mode == 'METRO' else (2.5 if r2.mode == 'BRTS' else (2.0 if r2.mode == 'GANDHINAGAR_ELECTRIC_BUS' else (1.8 if r2.mode == 'RAIL' else 3.0)))
        in_transit2_mins = max(2.0, stops2_count * speed2)
        dist2_km = max(0.5, abs(d_rs.distance_from_start_km - t_to_rs.distance_from_start_km))

        walk2_mins = d_stop['walking_time_mins']
        walk2_dist_km = d_stop['distance_km']

        total_walk_mins = walk1_mins + transfer_walk_mins + walk2_mins
        total_wait_mins = wait1_mins + wait2_mins
        total_duration = total_walk_mins + total_wait_mins + in_transit1_mins + in_transit2_mins
        total_dist_km = walk1_dist_km + dist1_km + (transfer.walking_distance_m / 1000.0) + dist2_km + walk2_dist_km
        total_walk_dist_km = round(walk1_dist_km + (transfer.walking_distance_m / 1000.0) + walk2_dist_km, 2)

        arr_time = dep_time + timedelta(minutes=total_duration)

        steps = []
        cur_t = dep_time

        # 1. Walk to First Stop
        steps.append({
            'step_type': 'WALK',
            'mode': 'WALK',
            'title': f"Walk to {o_stop['name']}",
            'instructions': f"Walk {int(walk1_dist_km * 1000)}m to {o_stop['name']}",
            'from_name': start_name,
            'to_name': o_stop['name'],
            'duration_mins': walk1_mins,
            'distance_km': walk1_dist_km,
            'departure_time': cur_t.strftime('%I:%M %p'),
            'arrival_time': (cur_t + timedelta(minutes=walk1_mins)).strftime('%I:%M %p'),
            'coordinates': [[start_lat, start_lng], [o_stop['latitude'], o_stop['longitude']]],
            'is_transfer': False,
        })
        cur_t += timedelta(minutes=walk1_mins + wait1_mins)

        # 2. First Transit Leg
        t1_arr = cur_t + timedelta(minutes=in_transit1_mins)
        coords1 = cls._get_route_coordinates(r1, o_rs.sequence, t_from_rs.sequence)
        m1_display = 'Gandhinagar Electric Bus' if r1.mode == 'GANDHINAGAR_ELECTRIC_BUS' else r1.mode
        steps.append({
            'step_type': 'TRANSIT',
            'mode': r1.mode,
            'agency_code': r1.agency.code,
            'agency_name': r1.agency.name,
            'route_id': r1.route_id,
            'route_number': r1.route_number,
            'route_name': r1.route_name,
            'route_color': r1.color,
            'title': f"Board {m1_display} {r1.route_number}",
            'instructions': f"Take {m1_display} {r1.route_number} to {transfer.from_stop.name} ({stops1_count} stops)",
            'from_name': o_stop['name'],
            'from_stop_id': o_stop['stop_id'],
            'to_name': transfer.from_stop.name,
            'to_stop_id': transfer.from_stop.stop_id,
            'platform_info': o_stop.get('platform_info', ''),
            'stops_count': stops1_count,
            'duration_mins': in_transit1_mins,
            'waiting_mins': wait1_mins,
            'distance_km': dist1_km,
            'fare': int(FareEngine.calculate_leg_fare(r1.mode, dist1_km)),
            'fare_currency': '₹',
            'departure_time': cur_t.strftime('%I:%M %p'),
            'arrival_time': t1_arr.strftime('%I:%M %p'),
            'coordinates': coords1,
            'is_transfer': False,
        })
        cur_t = t1_arr

        # 3. Transfer Step
        t_arr = cur_t + timedelta(minutes=transfer_walk_mins)
        b2_time = t_arr + timedelta(minutes=wait2_mins)
        safe_dep = b2_time + timedelta(minutes=hw2)
        tight_warning = (
            f"🔴 HIGH RISK TRANSFER: Walking requires ~{int(transfer_walk_mins)} min with only {int(available_connection_mins)} min window before next departure. If delayed, recommended safe departure is {safe_dep.strftime('%I:%M %p')} (Route {r2.route_number})."
            if is_tight else None
        )

        steps.append({
            'step_type': 'TRANSFER',
            'mode': 'WALK',
            'title': f"Transfer to {r2.route_number} at {transfer.from_stop.name}",
            'instructions': transfer.instructions or f"Transfer from {transfer.from_stop.name} to {transfer.to_stop.name} ({int(transfer.walking_distance_m)}m walk)",
            'from_name': transfer.from_stop.name,
            'to_name': transfer.to_stop.name,
            'duration_mins': transfer_walk_mins,
            'distance_km': round(transfer.walking_distance_m / 1000.0, 2),
            'departure_time': cur_t.strftime('%I:%M %p'),
            'arrival_time': t_arr.strftime('%I:%M %p'),
            'coordinates': [[transfer.from_stop.latitude, transfer.from_stop.longitude], [transfer.to_stop.latitude, transfer.to_stop.longitude]],
            'is_transfer': True,
            'is_step_free': transfer.is_step_free,
            'from_platform': transfer.from_platform,
            'to_platform': transfer.to_platform,
            'stand_number': transfer.stand_number,
            'transfer_window_mins': int(transfer_window_mins),
            'transfer_message': f"YOU HAVE {int(transfer_window_mins)} MINUTES TO TRANSFER",
            'is_tight': is_tight,
            'transfer_risk': transfer_risk,
            'tight_transfer_warning': tight_warning,
            'protection_status': 'TIGHT' if is_tight else 'GUARANTEED',
        })
        cur_t = b2_time

        # 4. Second Transit Leg
        a2_time = b2_time + timedelta(minutes=in_transit2_mins)
        coords2 = cls._get_route_coordinates(r2, t_to_rs.sequence, d_rs.sequence)
        m2_display = 'Gandhinagar Electric Bus' if r2.mode == 'GANDHINAGAR_ELECTRIC_BUS' else r2.mode
        steps.append({
            'step_type': 'TRANSIT',
            'mode': r2.mode,
            'agency_code': r2.agency.code,
            'agency_name': r2.agency.name,
            'route_id': r2.route_id,
            'route_number': r2.route_number,
            'route_name': r2.route_name,
            'route_color': r2.color,
            'title': f"Board {m2_display} {r2.route_number}",
            'instructions': f"Take {m2_display} {r2.route_number} to {d_stop['name']} ({stops2_count} stops)",
            'from_name': transfer.to_stop.name,
            'from_stop_id': transfer.to_stop.stop_id,
            'to_name': d_stop['name'],
            'to_stop_id': d_stop['stop_id'],
            'platform_info': transfer.to_stop.platform_info,
            'stops_count': stops2_count,
            'duration_mins': in_transit2_mins,
            'waiting_mins': wait2_mins,
            'distance_km': dist2_km,
            'fare': int(FareEngine.calculate_leg_fare(r2.mode, dist2_km)),
            'fare_currency': '₹',
            'departure_time': b2_time.strftime('%I:%M %p'),
            'arrival_time': a2_time.strftime('%I:%M %p'),
            'coordinates': coords2,
            'is_transfer': False,
        })
        cur_t = a2_time

        # 5. Walk to Destination
        steps.append({
            'step_type': 'WALK',
            'mode': 'WALK',
            'title': f"Walk to {dest_name}",
            'instructions': f"Walk {int(walk2_dist_km * 1000)}m to arrive at {dest_name}",
            'from_name': d_stop['name'],
            'to_name': dest_name,
            'duration_mins': walk2_mins,
            'distance_km': walk2_dist_km,
            'departure_time': cur_t.strftime('%I:%M %p'),
            'arrival_time': arr_time.strftime('%I:%M %p'),
            'coordinates': [[d_stop['latitude'], d_stop['longitude']], [dest_lat, dest_lng]],
            'is_transfer': False,
        })

        fare_calc = FareEngine.calculate_journey_fare(steps)

        comb_modes = ['WALK']
        if r1.mode not in comb_modes:
            comb_modes.append(r1.mode)
        if r2.mode not in comb_modes:
            comb_modes.append(r2.mode)

        avg_reliability = round((r1.reliability_score + r2.reliability_score) / 2.0, 2)

        m1_short = 'Electric Bus' if r1.mode == 'GANDHINAGAR_ELECTRIC_BUS' else r1.mode
        m2_short = 'Electric Bus' if r2.mode == 'GANDHINAGAR_ELECTRIC_BUS' else r2.mode

        why_points = [
            f"Seamless multimodal interchange combining {m1_short} and {m2_short}",
            f"Interchange at {transfer.from_stop.name}",
            f"Total transfer window: {int(transfer_window_mins)} min",
        ]
        if r1.is_electric or r2.is_electric:
            why_points.append("Includes zero-emission Gandhinagar PM-eBus Sewa electric connection")

        return {
            'route_key': f"{r1.route_id}_{r2.route_id}_transfer",
            'type': f"MULTIMODAL_{r1.mode}_{r2.mode}",
            'summary_title': f"{m1_short} + {m2_short}",
            'modes': comb_modes,
            'primary_mode': r1.mode,
            'duration_minutes': int(total_duration),
            'walking_minutes': int(total_walk_mins),
            'waiting_minutes': int(total_wait_mins),
            'transfers': 1,
            'fare': fare_calc['total_fare'],
            'fare_currency': '₹',
            'fare_breakdown': fare_calc['breakdown'],
            'departure_time': dep_time.strftime('%I:%M %p'),
            'arrival_time': arr_time.strftime('%I:%M %p'),
            'total_distance_km': round(total_dist_km, 1),
            'walking_distance_km': total_walk_dist_km,
            'reliability_score': avg_reliability,
            'is_live': False,
            'delay_minutes': 0,
            'why_recommended': why_points,
            'steps': steps,
            'polyline': [c for s in steps for c in s.get('coordinates', [])],
        }

    @classmethod
    def _build_pure_walk_route(
        cls,
        start_name: str, start_lat: float, start_lng: float,
        dest_name: str, dest_lat: float, dest_lng: float,
        dist_km: float, walk_mins: int, dep_time: datetime
    ) -> Dict[str, Any]:
        arr_time = dep_time + timedelta(minutes=walk_mins)
        step = {
            'step_type': 'WALK',
            'mode': 'WALK',
            'title': f"Direct Walk to {dest_name}",
            'instructions': f"Walk {int(dist_km * 1000)}m to {dest_name}",
            'from_name': start_name,
            'to_name': dest_name,
            'duration_mins': walk_mins,
            'distance_km': round(dist_km, 2),
            'departure_time': dep_time.strftime('%I:%M %p'),
            'arrival_time': arr_time.strftime('%I:%M %p'),
            'coordinates': [[start_lat, start_lng], [dest_lat, dest_lng]],
            'is_transfer': False,
        }
        return {
            'route_key': 'pure_walk',
            'type': 'WALK_DIRECT',
            'summary_title': 'Direct Walking',
            'modes': ['WALK'],
            'primary_mode': 'WALK',
            'duration_minutes': walk_mins,
            'walking_minutes': walk_mins,
            'waiting_minutes': 0,
            'transfers': 0,
            'fare': 0,
            'fare_currency': '₹',
            'fare_breakdown': [],
            'departure_time': dep_time.strftime('%I:%M %p'),
            'arrival_time': arr_time.strftime('%I:%M %p'),
            'total_distance_km': round(dist_km, 2),
            'walking_distance_km': round(dist_km, 2),
            'reliability_score': 0.99,
            'is_live': False,
            'delay_minutes': 0,
            'why_recommended': ["Zero fares", "No waiting or transfer dependencies"],
            'steps': [step],
            'polyline': [[start_lat, start_lng], [dest_lat, dest_lng]],
        }

    @classmethod
    def _evaluate_delay_rerouting(cls, routes: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        delayed_routes = [r for r in routes if r.get('delay_minutes', 0) >= 8]
        if not delayed_routes:
            return None

        delayed_r = delayed_routes[0]
        on_time_routes = [r for r in routes if r.get('delay_minutes', 0) < 5]
        if not on_time_routes:
            return None

        fastest_alt = min(on_time_routes, key=lambda x: x['duration_minutes'])
        time_saved = delayed_r['duration_minutes'] - fastest_alt['duration_minutes']

        return {
            'affected_mode': delayed_r['primary_mode'],
            'delayed_route_title': delayed_r['summary_title'],
            'delay_minutes': delayed_r['delay_minutes'],
            'recommended_alternative_title': fastest_alt['summary_title'],
            'time_saved_minutes': max(1, time_saved),
            'alert_message': f"Smart Connection Protection: Original route ({delayed_r['summary_title']}) is delayed by {delayed_r['delay_minutes']} min. We recommended a faster connection via {fastest_alt['summary_title']} saving ~{max(1, time_saved)} min.",
        }

    @classmethod
    def _filter_unreasonable_and_dominated_routes(cls, routes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not routes:
            return []

        fastest_duration = min(r['duration_minutes'] for r in routes)
        min_walk = min(r['walking_minutes'] for r in routes)

        # 1. Filter out extreme outliers & unfeasible walks
        valid = []
        for r in routes:
            dur = r['duration_minutes']
            walk = r['walking_minutes']

            if r['type'] != 'WALK_DIRECT':
                # Skip if total duration exceeds 2.2x fastest and requires > 20 min walk
                if dur > max(65, fastest_duration * 2.2) and walk > 20:
                    continue
                # Skip if walking is excessive (> 35 min) when there is an option with <= 10 min walking
                if walk > 35 and min_walk <= 10:
                    continue
                # Skip excessive transfers (> 2 transfers)
                if r.get('transfers', 0) > 2:
                    continue

            valid.append(r)

        if not valid:
            valid = routes

        # 2. Deduplicate identical transit itineraries
        by_sig = {}
        for r in valid:
            sig = tuple((s.get('mode'), s.get('route_number'), s.get('from_name'), s.get('to_name'))
                        for s in r.get('steps', []) if s.get('step_type') == 'TRANSIT')
            if not sig:
                sig = (r.get('summary_title'), r.get('duration_minutes'))
            if sig not in by_sig or r['duration_minutes'] < by_sig[sig]['duration_minutes']:
                by_sig[sig] = r

        deduped = list(by_sig.values())

        # 3. Preserve Mode & Multi-modal Diversity
        by_profile = {}
        for r in deduped:
            prof = (r.get('type'), r.get('primary_mode'))
            if prof not in by_profile:
                by_profile[prof] = []
            by_profile[prof].append(r)

        diverse_candidates = []
        for prof, r_list in by_profile.items():
            r_list.sort(key=lambda x: (x['duration_minutes'], x['fare']))
            # Within the same profile, drop strictly dominated routes
            kept = []
            for r in r_list:
                is_dom = False
                for other in r_list:
                    if other is r:
                        continue
                    if (other['duration_minutes'] <= r['duration_minutes'] and
                        other['walking_minutes'] <= r['walking_minutes'] and
                        other['transfers'] <= r['transfers'] and
                        other['fare'] <= r['fare'] and
                        (other['duration_minutes'] < r['duration_minutes'] or
                         other['walking_minutes'] < r['walking_minutes'] or
                         other['fare'] < r['fare'])):
                        is_dom = True
                        break
                if not is_dom:
                    kept.append(r)
            diverse_candidates.extend(kept[:2])

        return diverse_candidates if diverse_candidates else deduped

    @classmethod
    def _rank_and_categorize_routes(cls, routes: List[Dict[str, Any]], user_pref: str) -> List[Dict[str, Any]]:
        if not routes:
            return []

        # Filter out unreasonable & duplicate routes while preserving diversity
        filtered_routes = cls._filter_unreasonable_and_dominated_routes(routes)
        if not filtered_routes:
            filtered_routes = routes

        # Allocate distinct category badges across candidate options
        assigned_badges = {}

        # 1. Fastest option
        fastest_r = min(filtered_routes, key=lambda x: x['duration_minutes'])
        assigned_badges[id(fastest_r)] = ('FASTEST', 'bg-amber-500 text-white')

        # 2. Minimum Waiting option (minimize user waiting time)
        rem_wait = [r for r in filtered_routes if id(r) not in assigned_badges]
        if rem_wait:
            min_wait_r = min(rem_wait, key=lambda x: (x['waiting_minutes'], x['duration_minutes']))
            assigned_badges[id(min_wait_r)] = ('MINIMUM WAIT', 'bg-teal-600 text-white')

        # 3. Cheapest option (assign to different route if available)
        rem_cheapest = [r for r in filtered_routes if id(r) not in assigned_badges]
        if rem_cheapest:
            cheapest_r = min(rem_cheapest, key=lambda x: (x['fare'], x['duration_minutes']))
            assigned_badges[id(cheapest_r)] = ('CHEAPEST', 'bg-emerald-600 text-white')

        # 4. Least Walking option (assign to different route if available)
        rem_walk = [r for r in filtered_routes if id(r) not in assigned_badges]
        if rem_walk:
            least_walk_r = min(rem_walk, key=lambda x: (x['walking_minutes'], x['duration_minutes']))
            assigned_badges[id(least_walk_r)] = ('LEAST WALKING', 'bg-blue-600 text-white')

        # 5. Fewest Transfers option (assign to different route if available)
        rem_trans = [r for r in filtered_routes if id(r) not in assigned_badges]
        if rem_trans:
            fewest_trans_r = min(rem_trans, key=lambda x: (x['transfers'], x['duration_minutes']))
            assigned_badges[id(fewest_trans_r)] = ('FEWEST TRANSFERS', 'bg-purple-600 text-white')

        # 6. Most Reliable option (assign to different route if available)
        rem_rel = [r for r in filtered_routes if id(r) not in assigned_badges]
        if rem_rel:
            most_rel_r = max(rem_rel, key=lambda x: (x['reliability_score'], -x['duration_minutes']))
            assigned_badges[id(most_rel_r)] = ('MOST RELIABLE', 'bg-indigo-600 text-white')

        output = []
        seen_keys = set()
        for r in filtered_routes:
            r_copy = dict(r)
            if id(r) in assigned_badges:
                badge, color = assigned_badges[id(r)]
            else:
                modes = r_copy.get('modes', [])
                if 'GANDHINAGAR_ELECTRIC_BUS' in modes:
                    badge, color = 'ELECTRIC BUS', 'bg-emerald-600 text-white'
                elif 'BRTS' in modes:
                    badge, color = 'BRTS BUSWAY', 'bg-orange-600 text-white'
                elif 'RAIL' in modes:
                    badge, color = 'SUBURBAN RAIL', 'bg-purple-700 text-white'
                elif 'AMTS' in modes:
                    badge, color = 'CITY FEEDER', 'bg-emerald-700 text-white'
                elif r_copy.get('transfers', 0) > 0:
                    badge, color = 'MULTIMODAL', 'bg-indigo-600 text-white'
                else:
                    badge, color = 'ALTERNATIVE', 'bg-slate-600 text-white'

            r_copy['category_badge'] = badge
            r_copy['tag_label'] = badge
            r_copy['badge_color'] = color

            k = (r_copy['summary_title'], r_copy['duration_minutes'], r_copy['fare'])
            if k not in seen_keys:
                seen_keys.add(k)
                output.append(r_copy)

        # Sort according to user preference (top matching option at index 0)
        if user_pref == 'cheapest':
            output.sort(key=lambda x: (x['fare'], x['duration_minutes']))
        elif user_pref == 'least_walking':
            output.sort(key=lambda x: (x['walking_minutes'], x['duration_minutes']))
        elif user_pref == 'fewest_transfers':
            output.sort(key=lambda x: (x['transfers'], x['duration_minutes']))
        elif user_pref == 'most_reliable':
            output.sort(key=lambda x: (-x['reliability_score'], x['duration_minutes']))
        elif user_pref == 'minimum_wait' or user_pref == 'minimize_waiting':
            output.sort(key=lambda x: (x['waiting_minutes'], x['duration_minutes']))
        else: # fastest default
            output.sort(key=lambda x: x['duration_minutes'])

        return output

    @classmethod
    def _get_route_coordinates(cls, route: Route, seq1: int, seq2: int) -> List[List[float]]:
        min_seq = min(seq1, seq2)
        max_seq = max(seq1, seq2)
        route_stops = RouteStop.objects.filter(
            route=route,
            sequence__gte=min_seq,
            sequence__lte=max_seq
        ).select_related('stop').order_by('sequence')

        coords = [[rs.stop.latitude, rs.stop.longitude] for rs in route_stops]
        if seq1 > seq2:
            coords.reverse()
        return coords
