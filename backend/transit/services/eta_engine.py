import math
from datetime import datetime, timedelta
from django.utils import timezone
from typing import List, Dict, Any, Optional
from ..models import Stop, RouteStop, Route, VehiclePosition

class ETAEngine:
    """Computes real-time ETAs and next departure boards for stops and stations."""

    @classmethod
    def get_stop_departures(cls, stop_id: str, limit: int = 8) -> Dict[str, Any]:
        stop = Stop.objects.filter(stop_id=stop_id).first()
        if not stop:
            return {'stop': None, 'departures': []}

        route_stops = RouteStop.objects.filter(stop=stop).select_related('route', 'route__agency')
        departures = []
        now = timezone.localtime(timezone.now())

        for rs in route_stops:
            route = rs.route
            if not route.is_active:
                continue

            # Check if there is a live vehicle approaching this stop on this route
            live_vp = VehiclePosition.objects.filter(
                vehicle__current_route=route,
                next_stop=stop
            ).select_related('vehicle').first()

            if live_vp:
                # Live vehicle prediction
                eta_secs = live_vp.eta_next_stop_seconds
                eta_mins = max(1, math.ceil(eta_secs / 60))
                dep_time = now + timedelta(seconds=eta_secs)
                departures.append({
                    'route_id': route.route_id,
                    'route_number': route.route_number,
                    'route_name': route.route_name,
                    'mode': route.mode,
                    'color': route.color,
                    'destination': route.route_name.split('↔')[-1].strip() if '↔' in route.route_name else route.route_name,
                    'eta_minutes': eta_mins,
                    'departure_time': dep_time.strftime('%I:%M %p'),
                    'is_live': live_vp.is_live,
                    'data_source': live_vp.data_source,
                    'status': 'LIVE' if live_vp.is_live else 'ESTIMATED',
                    'delay_minutes': live_vp.delay_minutes,
                    'vehicle_id': live_vp.vehicle.vehicle_id,
                })

            # Calculate regular scheduled departures based on headway
            headway = route.headway_peak_mins if (7 <= now.hour <= 11 or 17 <= now.hour <= 21) else route.headway_offpeak_mins
            for i in range(1, 4):
                sched_mins = i * headway
                sched_dep_time = now + timedelta(minutes=sched_mins)
                departures.append({
                    'route_id': route.route_id,
                    'route_number': route.route_number,
                    'route_name': route.route_name,
                    'mode': route.mode,
                    'color': route.color,
                    'destination': route.route_name.split('↔')[-1].strip() if '↔' in route.route_name else route.route_name,
                    'eta_minutes': sched_mins,
                    'departure_time': sched_dep_time.strftime('%I:%M %p'),
                    'is_live': False,
                    'data_source': 'TIMETABLE_SCHEDULE',
                    'status': 'SCHEDULED',
                    'delay_minutes': 0,
                    'vehicle_id': None,
                })

        # Sort by eta_minutes
        departures.sort(key=lambda x: x['eta_minutes'])
        # Deduplicate per route by taking closest
        seen_routes = set()
        deduped = []
        for dep in departures:
            key = (dep['route_id'], dep['eta_minutes'])
            if key not in seen_routes:
                seen_routes.add(key)
                deduped.append(dep)

        return {
            'stop': {
                'stop_id': stop.stop_id,
                'name': stop.name,
                'name_gu': stop.name_gu,
                'mode': stop.mode,
                'is_interchange': stop.is_interchange,
                'platform_info': stop.platform_info,
                'wheelchair_accessible': stop.wheelchair_accessible,
                'latitude': stop.latitude,
                'longitude': stop.longitude,
            },
            'departures': deduped[:limit],
            'generated_at': now.isoformat(),
        }
