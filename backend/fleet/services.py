from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Bus, BusLocationHistory, BusCamera

class FleetService:
    @staticmethod
    def update_bus_location(bus, latitude, longitude, speed=0.0, heading=0.0, location_name=None):
        bus.latitude = latitude
        bus.longitude = longitude
        bus.speed = speed
        bus.heading = heading
        bus.last_seen = timezone.now()
        if location_name:
            bus.current_location_name = location_name
        bus.save(update_fields=['latitude', 'longitude', 'speed', 'heading', 'last_seen', 'current_location_name', 'updated_at'])

        # Record history
        history = BusLocationHistory.objects.create(
            bus=bus,
            latitude=latitude,
            longitude=longitude,
            speed=speed,
            heading=heading,
            timestamp=bus.last_seen
        )

        # Broadcast real-time location update event
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    "fleet_updates",
                    {
                        "type": "fleet_event",
                        "event": "BUS_LOCATION_UPDATED",
                        "data": {
                            "bus_id": bus.bus_id,
                            "registration_number": bus.registration_number,
                            "latitude": bus.latitude,
                            "longitude": bus.longitude,
                            "gps": [bus.latitude, bus.longitude],
                            "speed": bus.speed,
                            "heading": bus.heading,
                            "location": bus.current_location_name,
                            "status": bus.status.lower(),
                        }
                    }
                )
        except Exception:
            pass

        return history

    @staticmethod
    def update_heartbeat(bus, camera_status=None, ai_status=None):
        bus.last_seen = timezone.now()
        if ai_status:
            bus.ai_status = ai_status
        if camera_status:
            bus.cameras_status = camera_status
            # Also update camera records
            for cam_name, is_active in camera_status.items():
                BusCamera.objects.update_or_create(
                    bus=bus,
                    camera_type=cam_name.upper(),
                    defaults={
                        'status': 'ACTIVE' if is_active else 'INACTIVE',
                        'last_seen': timezone.now()
                    }
                )
        bus.save(update_fields=['last_seen', 'ai_status', 'cameras_status', 'updated_at'])
        return bus
