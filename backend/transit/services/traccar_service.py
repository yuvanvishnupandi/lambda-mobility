import json
import math
import time
import queue
import threading
from datetime import datetime
from django.utils import timezone
from typing import Dict, Any, List, Optional, Tuple

from ..models import Vehicle, VehiclePosition, Stop, Route, TransportAgency, DataSource
try:
    from fleet.models import Bus
except ImportError:
    Bus = None


class TraccarService:
    """
    Core Traccar Integration Engine for Lambda.
    Handles:
    1. OsmAnd / Traccar Client Protocol (Direct GPS packet ingestion from phone/device).
    2. Traccar Server Forwarding Webhooks (JSON payload ingestion).
    3. Vehicle & Battery Telemetry Synchronization across Transit & Fleet models.
    4. Real-time In-Memory Broadcaster for Server-Sent Events (SSE) and WebSockets.
    5. Built-in GPS Route Simulation Engine for Gandhinagar Electric Buses & Ahmedabad Fleet.
    """

    # In-memory broadcast queue list for active SSE clients
    _subscribers: List[queue.Queue] = []
    _subscribers_lock = threading.Lock()

    # Packet history for live inspector (most recent 50 packets)
    _packet_history: List[Dict[str, Any]] = []
    _history_lock = threading.Lock()

    # Simulation state
    _simulation_active: bool = False
    _simulation_thread: Optional[threading.Thread] = None
    _sim_speed_multiplier: float = 1.0
    _sim_route_indices: Dict[str, int] = {}

    # Preloaded high-resolution GPS waypoints for live route playback
    # Gandhinagar E-1 Route (Gandhinagar Railway Station <-> Mahatma Mandir)
    ROUTE_E1_WAYPOINTS = [
        (23.2345, 72.6482, "Gandhinagar Railway Station"),
        (23.2310, 72.6465, "Sector 14 Cross Roads"),
        (23.2275, 72.6440, "Sector 13 Central"),
        (23.2230, 72.6410, "Sector 12 / 13 Junction"),
        (23.2185, 72.6385, "Sector 11 Pathikashram Hub"),
        (23.2156, 72.6369, "Sector 10 Government Complex"),
        (23.2120, 72.6340, "Sector 9 Secretariat North"),
        (23.2085, 72.6315, "Sector 1 Central Vista Gate"),
        (23.2040, 72.6280, "Swarvim Sankul Secretariat"),
        (23.1995, 72.6250, "Kh-0 Concourse Interchange"),
        (23.1950, 72.6220, "Mahatma Mandir Convention Hall"),
        (23.1925, 72.6200, "Mahatma Mandir Grand Concourse Terminal")
    ]

    # Gandhinagar E-2 Route (Akshardham <-> GIFT City Multi-Services SEZ)
    ROUTE_E2_WAYPOINTS = [
        (23.2280, 72.6740, "Akshardham Temple Main Concourse"),
        (23.2250, 72.6700, "Sector 20 Cultural Grounds"),
        (23.2210, 72.6640, "Sector 21 GGTSL Central Electric Depot"),
        (23.2160, 72.6580, "Sector 22 Market Hub"),
        (23.2100, 72.6500, "Sector 16 / 17 Cross"),
        (23.2020, 72.6550, "Indroda Nature Park Concourse"),
        (23.1920, 72.6620, "Infocity IT Hub Gandhinagar"),
        (23.1850, 72.6680, "Kudasan Cross Roads"),
        (23.1780, 72.6740, "Bhaijipura Junction"),
        (23.1680, 72.6800, "GIFT City Gate 1 North Entry"),
        (23.1620, 72.6840, "GIFT Diamond Tower Central Loop"),
        (23.1580, 72.6870, "GIFT City Multi-Services SEZ Terminal")
    ]

    # SG Highway Ahmedabad Route (Visat <-> ISKCON Cross Roads)
    ROUTE_SG_WAYPOINTS = [
        (23.1150, 72.5800, "Visat Gandhinagar Highway"),
        (23.1050, 72.5650, "Chandkheda Ring Road Junction"),
        (23.0900, 72.5450, "Gota Cross Roads Flyover"),
        (23.0780, 72.5350, "Sola Civil Hospital Junction"),
        (23.0650, 72.5250, "Science City Road Intersection"),
        (23.0550, 72.5180, "Thaltej Cross Roads / Metro"),
        (23.0450, 72.5120, "Pakwan Cross Roads"),
        (23.0300, 72.5070, "ISKCON Cross Roads BRTS Hub")
    ]

    @classmethod
    def calculate_bearing(cls, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate compass bearing (0-360 deg) between two coordinates."""
        d_lon = math.radians(lon2 - lon1)
        y = math.sin(d_lon) * math.cos(math.radians(lat2))
        x = math.cos(math.radians(lat1)) * math.sin(math.radians(lat2)) - \
            math.sin(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.cos(d_lon)
        bearing = (math.degrees(math.atan2(y, x)) + 360) % 360
        return round(bearing, 1)

    @classmethod
    def find_nearest_stop(cls, lat: float, lon: float) -> Optional[Stop]:
        """Find the closest transit stop to the given coordinates."""
        closest_stop = None
        min_dist = float('inf')
        for stop in Stop.objects.all():
            dist = math.hypot(stop.latitude - lat, stop.longitude - lon)
            if dist < min_dist:
                min_dist = dist
                closest_stop = stop
        return closest_stop

    @classmethod
    def ingest_osmand_packet(cls, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingest direct GPS fix from Traccar Client phone app or OsmAnd protocol.
        Accepted query/body fields:
        - id / uniqueId / device (e.g. 'GGTSL-EB-101', 'BUS-078')
        - lat / latitude (float)
        - lon / longitude (float)
        - speed (km/h or knots)
        - bearing / heading / course (degrees)
        - batt / battery / batteryLevel (percentage 0-100)
        - timestamp / time (epoch seconds or ISO timestamp)
        - altitude (meters)
        """
        device_id = str(params.get('id') or params.get('uniqueId') or params.get('device') or 'GGTSL-EB-101').strip()
        
        try:
            latitude = float(params.get('lat') or params.get('latitude'))
            longitude = float(params.get('lon') or params.get('longitude'))
        except (ValueError, TypeError):
            raise ValueError("Invalid or missing 'lat' and 'lon' coordinates in GPS packet.")

        raw_speed = params.get('speed')
        speed_kmh = float(raw_speed) if raw_speed is not None else 28.0
        # If speed comes in knots from standard OsmAnd protocol, check if conversion is needed or assume km/h
        if 'speed_unit' in params and params['speed_unit'] == 'knots':
            speed_kmh = round(speed_kmh * 1.852, 1)

        bearing = float(params.get('bearing') or params.get('heading') or params.get('course') or 0.0)
        
        # Battery percentage
        batt_val = params.get('batt') or params.get('battery') or params.get('batteryLevel')
        battery_pct = int(float(batt_val)) if batt_val is not None else None

        now = timezone.now()
        timestamp_str = now.isoformat()

        # Update or find matching Vehicle in Transit system
        vehicle = Vehicle.objects.filter(vehicle_id__iexact=device_id).first()
        if not vehicle:
            # Fallback: check registration or create on-the-fly for GGTSL electric fleet
            vehicle = Vehicle.objects.filter(registration__iexact=device_id).first()
            if not vehicle:
                agency = TransportAgency.objects.filter(code='GGTSL').first() or TransportAgency.objects.first()
                mode = 'GANDHINAGAR_ELECTRIC_BUS' if 'EB' in device_id or 'GGTSL' in device_id else 'BUS'
                route = Route.objects.filter(mode=mode, is_active=True).first()
                vehicle = Vehicle.objects.create(
                    vehicle_id=device_id,
                    registration=f"GJ-18-EV-{device_id.split('-')[-1]}",
                    fleet_number=device_id,
                    agency=agency,
                    operator="Gandhinagar Greenline Transport Service Limited (GGTSL)" if mode == 'GANDHINAGAR_ELECTRIC_BUS' else "Ahmedabad Municipal Transport",
                    mode=mode,
                    vehicle_type='9M_ELECTRIC_AC' if mode == 'GANDHINAGAR_ELECTRIC_BUS' else 'BRTS_BUS',
                    current_route=route,
                    capacity=45,
                    is_electric=True if mode == 'GANDHINAGAR_ELECTRIC_BUS' else False,
                    battery_status=battery_pct or 85,
                    charging_status='DISCHARGING' if speed_kmh > 0 else 'STANDBY',
                    air_conditioned=True,
                    is_active=True
                )

        # Update Vehicle battery status if provided
        if battery_pct is not None:
            vehicle.battery_status = battery_pct
            if battery_pct < 20:
                vehicle.charging_status = 'CHARGING'
            elif speed_kmh > 0:
                vehicle.charging_status = 'DISCHARGING'
            vehicle.save(update_fields=['battery_status', 'charging_status'])

        # Nearest stop calculation
        nearest_stop = cls.find_nearest_stop(latitude, longitude)
        location_name = params.get('location_name') or (f"Near {nearest_stop.name}" if nearest_stop else "Gandhinagar Transit Corridor")

        # Update or create VehiclePosition
        vp, created = VehiclePosition.objects.update_or_create(
            vehicle=vehicle,
            defaults={
                'latitude': latitude,
                'longitude': longitude,
                'speed_kmh': speed_kmh,
                'heading': bearing,
                'current_location_name': location_name,
                'next_stop': nearest_stop,
                'eta_next_stop_seconds': 120 if speed_kmh > 15 else 300,
                'delay_minutes': 0,
                'status': 'ON_TIME',
                'telemetry_type': 'REAL_TIME',
                'is_live': True,
                'data_source': 'TRACCAR_GPS_FEED',
                'last_updated': now
            }
        )

        # Also sync to Fleet Bus model if applicable
        if Bus:
            try:
                fleet_bus = Bus.objects.filter(bus_id__iexact=device_id).first()
                if fleet_bus:
                    fleet_bus.current_latitude = latitude
                    fleet_bus.current_longitude = longitude
                    fleet_bus.speed = speed_kmh
                    fleet_bus.heading = bearing
                    fleet_bus.current_location_name = location_name
                    fleet_bus.status = 'ONLINE'
                    fleet_bus.last_heartbeat = now
                    fleet_bus.save(update_fields=['current_latitude', 'current_longitude', 'speed', 'heading', 'current_location_name', 'status', 'last_heartbeat'])
            except Exception:
                pass

        # Update PM-eBus Sewa / DataSource freshness
        ds = DataSource.objects.filter(provider_type='GANDHINAGAR_E_BUS').first()
        if ds:
            ds.last_sync = now
            ds.last_updated_feed = now
            ds.status = 'OPERATIONAL'
            ds.save(update_fields=['last_sync', 'last_updated_feed', 'status'])

        packet_event = {
            'type': 'VEHICLE_POSITION_UPDATE',
            'protocol': 'TRACCAR_CLIENT_OSMAND',
            'vehicle_id': vehicle.vehicle_id,
            'registration': vehicle.registration,
            'fleet_number': vehicle.fleet_number,
            'operator': vehicle.operator or vehicle.agency.name,
            'mode': vehicle.mode,
            'vehicle_type': vehicle.vehicle_type,
            'is_electric': vehicle.is_electric,
            'battery_soc_pct': vehicle.battery_status or 85,
            'charging_status': vehicle.charging_status,
            'latitude': latitude,
            'longitude': longitude,
            'speed_kmh': speed_kmh,
            'heading': bearing,
            'location_name': location_name,
            'next_stop_name': nearest_stop.name if nearest_stop else None,
            'next_stop_id': nearest_stop.stop_id if nearest_stop else None,
            'route_number': vehicle.current_route.route_number if vehicle.current_route else 'E-1',
            'route_name': vehicle.current_route.route_name if vehicle.current_route else 'Gandhinagar Express',
            'route_color': vehicle.current_route.color if vehicle.current_route else '#059669',
            'status': vp.status,
            'telemetry_type': 'REAL_TIME',
            'data_source': 'TRACCAR_GPS_FEED',
            'provenance': 'REAL_TIME',
            'timestamp': timestamp_str,
            'received_at': now.strftime("%H:%M:%S")
        }

        # Log to recent packet inspector
        with cls._history_lock:
            cls._packet_history.insert(0, packet_event)
            if len(cls._packet_history) > 50:
                cls._packet_history = cls._packet_history[:50]

        # Broadcast event to all active SSE subscribers
        cls._broadcast_event(packet_event)

        return packet_event

    @classmethod
    def ingest_traccar_webhook(cls, payload: Any) -> List[Dict[str, Any]]:
        """
        Ingest Traccar Server forwarding webhook (JSON array or single object).
        Format:
        {
          "device": {"id": 1, "uniqueId": "GGTSL-EB-101", "name": "Bus E-101"},
          "position": {"latitude": 23.2156, "longitude": 72.6369, "speed": 34.5, "course": 180, "attributes": {"batteryLevel": 88}}
        }
        """
        if isinstance(payload, str):
            payload = json.loads(payload)

        items = payload if isinstance(payload, list) else [payload]
        results = []

        for item in items:
            if not isinstance(item, dict):
                continue
            
            # Position details
            pos = item.get('position', item)
            dev = item.get('device', {})

            device_id = dev.get('uniqueId') or dev.get('name') or item.get('deviceId') or item.get('id') or 'GGTSL-EB-101'
            lat = pos.get('latitude') or pos.get('lat')
            lon = pos.get('longitude') or pos.get('lon')

            if lat is None or lon is None:
                continue

            speed = pos.get('speed', 28.0)
            course = pos.get('course') or pos.get('bearing') or 0.0
            
            # Attributes inside Traccar
            attrs = pos.get('attributes', {})
            battery = attrs.get('batteryLevel') or attrs.get('battery') or item.get('batt')

            normalized = {
                'id': str(device_id),
                'lat': lat,
                'lon': lon,
                'speed': speed,
                'bearing': course,
                'batt': battery,
                'timestamp': pos.get('fixTime') or pos.get('deviceTime') or timezone.now().isoformat()
            }

            try:
                res = cls.ingest_osmand_packet(normalized)
                results.append(res)
            except Exception as e:
                continue

        return results

    @classmethod
    def _broadcast_event(cls, event: Dict[str, Any]):
        """Push a message to all connected SSE clients."""
        msg = f"event: vehicle_update\ndata: {json.dumps(event)}\n\n"
        with cls._subscribers_lock:
            dead_queues = []
            for q in cls._subscribers:
                try:
                    q.put_nowait(msg)
                except queue.Full:
                    dead_queues.append(q)
            for q in dead_queues:
                if q in cls._subscribers:
                    cls._subscribers.remove(q)

    @classmethod
    def register_subscriber(cls) -> queue.Queue:
        """Register a new SSE client queue."""
        q = queue.Queue(maxsize=100)
        with cls._subscribers_lock:
            cls._subscribers.append(q)
        return q

    @classmethod
    def unregister_subscriber(cls, q: queue.Queue):
        """Unregister an SSE client queue on disconnect."""
        with cls._subscribers_lock:
            if q in cls._subscribers:
                cls._subscribers.remove(q)

    @classmethod
    def get_packet_history(cls, limit: int = 20) -> List[Dict[str, Any]]:
        """Return recently received GPS packets."""
        with cls._history_lock:
            return cls._packet_history[:limit]

    @classmethod
    def get_status(cls) -> Dict[str, Any]:
        """Return telemetry health, connected devices, and simulator status."""
        active_vehicles = VehiclePosition.objects.filter(is_live=True).count()
        total_positions = VehiclePosition.objects.count()
        
        with cls._subscribers_lock:
            subscribers_count = len(cls._subscribers)
        
        with cls._history_lock:
            last_packet = cls._packet_history[0] if cls._packet_history else None

        return {
            'status': 'OPERATIONAL',
            'service_name': 'Lambda Traccar GPS Ingestion Pipeline',
            'traccar_protocol_supported': ['OsmAnd HTTP Client', 'Traccar Server Webhook v1/v2', 'NMEA Telemetry'],
            'client_ingest_url': '/api/traccar/client/',
            'webhook_ingest_url': '/api/traccar/webhook/',
            'live_stream_url': '/api/traccar/live-stream/',
            'active_sse_subscribers': subscribers_count,
            'active_live_vehicles': active_vehicles,
            'total_vehicles_monitored': total_positions,
            'simulation_running': cls._simulation_active,
            'simulation_speed': cls._sim_speed_multiplier,
            'last_packet_received': last_packet['timestamp'] if last_packet else None,
            'last_packet_device': last_packet['vehicle_id'] if last_packet else None
        }

    # =========================================================================
    # LIVE GPS ROUTE SIMULATION ENGINE
    # =========================================================================

    @classmethod
    def start_simulation(cls, speed_multiplier: float = 1.0) -> Dict[str, Any]:
        """Start the built-in GPS route simulator in a background thread."""
        cls._sim_speed_multiplier = max(0.2, min(speed_multiplier, 10.0))
        if cls._simulation_active:
            return {'status': 'ALREADY_RUNNING', 'speed_multiplier': cls._sim_speed_multiplier}

        cls._simulation_active = True
        cls._simulation_thread = threading.Thread(target=cls._run_simulation_loop, daemon=True)
        cls._simulation_thread.start()

        return {
            'status': 'STARTED',
            'message': 'Live GPS route simulation started',
            'speed_multiplier': cls._sim_speed_multiplier,
            'active_simulated_routes': ['GGTSL-EB-101 (Route E-1)', 'GGTSL-EB-102 (Route E-2)', 'BUS-078 (SG Highway)']
        }

    @classmethod
    def stop_simulation(cls) -> Dict[str, Any]:
        """Stop the background GPS simulation."""
        cls._simulation_active = False
        return {'status': 'STOPPED', 'message': 'Live GPS route simulation paused'}

    @classmethod
    def step_simulation(cls) -> List[Dict[str, Any]]:
        """Advance all simulated vehicles by one GPS step immediately."""
        updates = []
        # Simulate E-1 Bus
        updates.append(cls._advance_vehicle('GGTSL-EB-101', cls.ROUTE_E1_WAYPOINTS, base_battery=92))
        # Simulate E-2 Bus
        updates.append(cls._advance_vehicle('GGTSL-EB-102', cls.ROUTE_E2_WAYPOINTS, base_battery=84))
        # Simulate SG Highway Bus
        updates.append(cls._advance_vehicle('BUS-078', cls.ROUTE_SG_WAYPOINTS, base_battery=76))
        return updates

    @classmethod
    def _run_simulation_loop(cls):
        """Background thread executing smooth waypoint progression."""
        while cls._simulation_active:
            try:
                cls.step_simulation()
            except Exception as e:
                pass
            
            # Sleep interval adjusted by speed multiplier (default: 3 seconds per step)
            sleep_time = max(0.5, 3.0 / cls._sim_speed_multiplier)
            time.sleep(sleep_time)

    @classmethod
    def _advance_vehicle(cls, vehicle_id: str, waypoints: List[Tuple[float, float, str]], base_battery: int = 85) -> Dict[str, Any]:
        """Advance a single vehicle along its waypoint loop with realistic physics."""
        idx = cls._sim_route_indices.get(vehicle_id, 0)
        curr_wp = waypoints[idx]
        next_idx = (idx + 1) % len(waypoints)
        next_wp = waypoints[next_idx]

        bearing = cls.calculate_bearing(curr_wp[0], curr_wp[1], next_wp[0], next_wp[1])
        speed = round(28.0 + (math.sin(idx) * 8.0), 1) # Speed varies between 20 and 36 km/h
        battery = max(15, base_battery - (idx % 12))

        cls._sim_route_indices[vehicle_id] = next_idx

        # Ingest as OsmAnd packet
        return cls.ingest_osmand_packet({
            'id': vehicle_id,
            'lat': curr_wp[0],
            'lon': curr_wp[1],
            'speed': speed,
            'bearing': bearing,
            'batt': battery,
            'location_name': curr_wp[2]
        })
