from django.utils import timezone
from .models import TrackedVehicle, VehicleDetection, ANPRDetection

class VehicleTrackingService:
    @staticmethod
    def record_sighting(registration_number, vehicle_type='SUV', vehicle_color='White',
                        confidence=0.95, bus=None, latitude=12.8231, longitude=80.0444,
                        direction='Northbound', frame_reference=None, location_name='GST Road (NH 45)'):
        clean_reg = registration_number.replace(' ', '').upper()

        vehicle, created = TrackedVehicle.objects.get_or_create(
            registration_number=clean_reg,
            defaults={
                'vehicle_type': vehicle_type,
                'vehicle_color': vehicle_color,
                'confidence': confidence,
                'first_seen': timezone.now(),
                'last_seen': timezone.now()
            }
        )
        if not created:
            vehicle.last_seen = timezone.now()
            vehicle.confidence = max(vehicle.confidence, confidence)
            vehicle.save()

        # Record vehicle detection
        det = VehicleDetection.objects.create(
            vehicle=vehicle,
            bus=bus,
            latitude=latitude,
            longitude=longitude,
            timestamp=timezone.now(),
            direction=direction,
            confidence=confidence,
            frame_reference=frame_reference,
            location_name=location_name
        )

        # Record ANPR
        anpr = ANPRDetection.objects.create(
            vehicle=vehicle,
            registration_number=clean_reg,
            confidence=confidence,
            bus=bus,
            latitude=latitude,
            longitude=longitude,
            timestamp=timezone.now(),
            image_reference=frame_reference,
            location_name=location_name
        )

        return vehicle, det, anpr

    @staticmethod
    def get_vehicle_route(vehicle):
        detections = vehicle.detections.order_by('timestamp')
        coordinates = [[d.latitude, d.longitude] for d in detections]
        sightings = []
        for d in detections:
            sightings.append({
                "id": d.id,
                "latitude": d.latitude,
                "longitude": d.longitude,
                "gps": [d.latitude, d.longitude],
                "location": d.location_name,
                "timestamp": d.timestamp.isoformat(),
                "bus_id": d.bus.bus_id if d.bus else 'Static Camera',
                "direction": d.direction,
                "confidence": round(d.confidence, 3),
                "frame": d.frame_reference
            })
        return {
            "vehicle": {
                "id": vehicle.id,
                "registration": vehicle.registration_number,
                "type": vehicle.vehicle_type,
                "color": vehicle.vehicle_color,
                "confidence": round(vehicle.confidence, 3),
                "first_seen": vehicle.first_seen.isoformat(),
                "last_seen": vehicle.last_seen.isoformat()
            },
            "coordinates": coordinates,
            "sightings": sightings
        }
