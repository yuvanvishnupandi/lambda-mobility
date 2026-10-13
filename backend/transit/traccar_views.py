import json
import time
from django.http import StreamingHttpResponse
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .services.traccar_service import TraccarService
from .models import Vehicle, VehiclePosition


class TraccarClientIngestView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    Direct GPS ingestion endpoint for Traccar Client mobile apps (Android / iOS) & OsmAnd protocol.
    Supports both HTTP GET and HTTP POST with query parameters or JSON body.
    
    Standard parameters:
    - id / uniqueId / device: Vehicle Identifier (e.g. GGTSL-EB-101)
    - lat / latitude: GPS Latitude
    - lon / longitude: GPS Longitude
    - speed: Speed in km/h or knots
    - bearing / heading / course: Compass direction in degrees (0-360)
    - batt / battery / batteryLevel: Battery percentage (0-100%)
    - timestamp / time: Epoch timestamp or ISO datetime
    """
    @extend_schema(
        parameters=[
            OpenApiParameter(name='id', description='Vehicle Device ID (e.g. GGTSL-EB-101 or BUS-078)', required=True, type=OpenApiTypes.STR),
            OpenApiParameter(name='lat', description='GPS Latitude', required=True, type=OpenApiTypes.FLOAT),
            OpenApiParameter(name='lon', description='GPS Longitude', required=True, type=OpenApiTypes.FLOAT),
            OpenApiParameter(name='speed', description='Current speed in km/h', required=False, type=OpenApiTypes.FLOAT),
            OpenApiParameter(name='bearing', description='Heading in degrees (0-360)', required=False, type=OpenApiTypes.FLOAT),
            OpenApiParameter(name='batt', description='Battery charge % (0-100)', required=False, type=OpenApiTypes.INT),
            OpenApiParameter(name='timestamp', description='Timestamp', required=False, type=OpenApiTypes.STR),
        ]
    )
    def get(self, request):
        params = request.query_params.dict()
        try:
            event = TraccarService.ingest_osmand_packet(params)
            return Response({
                'status': 'OK',
                'message': 'GPS position ingested successfully',
                'event': event
            }, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f"Failed to ingest GPS packet: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        params = {}
        if request.data:
            params.update(request.data)
        if request.query_params:
            params.update(request.query_params.dict())

        try:
            event = TraccarService.ingest_osmand_packet(params)
            return Response({
                'status': 'OK',
                'message': 'GPS position ingested successfully',
                'event': event
            }, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f"Failed to ingest GPS packet: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TraccarWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    Traccar Server Forwarding Webhook.
    Receives JSON forwarding payload from a Traccar Server instance (positions array or device/position object).
    """
    def post(self, request):
        try:
            results = TraccarService.ingest_traccar_webhook(request.data)
            return Response({
                'status': 'OK',
                'processed_count': len(results),
                'events': results
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"Webhook error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class TraccarLiveStreamView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    Server-Sent Events (SSE) Real-Time Telemetry Stream.
    Pushes instantaneous GPS vehicle position updates, headings, and battery states to connected browsers.
    Content-Type: text/event-stream
    """
    def get(self, request):
        def event_stream():
            q = TraccarService.register_subscriber()
            try:
                # Send initial snapshot of all active vehicles immediately on connection
                positions = VehiclePosition.objects.filter(is_live=True).select_related('vehicle', 'next_stop', 'vehicle__current_route')
                initial_vehicles = []
                for vp in positions:
                    v = vp.vehicle
                    initial_vehicles.append({
                        'vehicle_id': v.vehicle_id,
                        'registration': v.registration,
                        'mode': v.mode,
                        'is_electric': v.is_electric,
                        'battery_soc_pct': v.battery_status or 85,
                        'charging_status': v.charging_status,
                        'latitude': vp.latitude,
                        'longitude': vp.longitude,
                        'speed_kmh': vp.speed_kmh,
                        'heading': vp.heading,
                        'location_name': vp.current_location_name,
                        'route_number': v.current_route.route_number if v.current_route else 'E-1',
                        'data_source': vp.data_source,
                        'status': vp.status,
                    })

                init_msg = f"event: initial_snapshot\ndata: {json.dumps({'vehicles': initial_vehicles})}\n\n"
                yield init_msg

                # Heartbeat counter
                last_heartbeat = time.time()

                while True:
                    try:
                        # Wait up to 1 second for a queued message
                        msg = q.get(timeout=1.0)
                        yield msg
                    except Exception:
                        # Send SSE comment heartbeat every 15s to keep connection alive
                        if time.time() - last_heartbeat > 15:
                            yield ": heartbeat\n\n"
                            last_heartbeat = time.time()
            finally:
                TraccarService.unregister_subscriber(q)

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no' # Disable NGINX buffering
        return response


class TraccarSimulatorView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    Control panel for the built-in GPS Route Simulation Engine.
    Actions:
    - action='start': Start continuous route playback (optional: speed_multiplier=1.0 - 5.0)
    - action='stop': Pause continuous simulation
    - action='step': Advance simulation by 1 waypoint step immediately
    """
    def post(self, request):
        action = request.data.get('action', 'step').lower()
        speed = float(request.data.get('speed', 1.0))

        if action == 'start':
            res = TraccarService.start_simulation(speed_multiplier=speed)
            return Response(res, status=status.HTTP_200_OK)
        elif action == 'stop':
            res = TraccarService.stop_simulation()
            return Response(res, status=status.HTTP_200_OK)
        elif action == 'step':
            updates = TraccarService.step_simulation()
            return Response({
                'status': 'OK',
                'action': 'step',
                'updated_vehicles': len(updates),
                'events': updates
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': f"Unknown action '{action}'. Valid actions: start, stop, step"}, status=status.HTTP_400_BAD_REQUEST)


class TraccarStatusView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    Returns Traccar server ingestion status, connected clients, packet history, and simulator state.
    """
    def get(self, request):
        status_info = TraccarService.get_status()
        status_info['recent_packets'] = TraccarService.get_packet_history(limit=20)
        return Response(status_info, status=status.HTTP_200_OK)
