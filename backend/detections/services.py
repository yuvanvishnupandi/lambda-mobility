from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Detection
from fleet.models import Bus

class DetectionService:
    @staticmethod
    def process_detection(bus, detection_type, confidence, latitude, longitude,
                          timestamp=None, frame_reference=None, metadata=None):
        if not timestamp:
            timestamp = timezone.now()
        if metadata is None:
            metadata = {}

        severity = metadata.get('severity', 'MEDIUM').upper()
        road_name = metadata.get('road', metadata.get('location', bus.current_location_name or 'Ahmedabad Urban Road'))

        detection = Detection.objects.create(
            bus=bus,
            detection_type=detection_type,
            confidence=confidence,
            severity=severity,
            latitude=latitude,
            longitude=longitude,
            timestamp=timestamp,
            frame_reference=frame_reference,
            metadata=metadata,
            location_name=road_name,
            status='NEW'
        )

        # Handle Road Hazards (POTHOLE, ROAD_DAMAGE, WATERLOGGING, MISSING_DIVIDER, MISSING_ZEBRA_CROSSING)
        road_hazard_types = ['POTHOLE', 'ROAD_DAMAGE', 'WATERLOGGING', 'MISSING_DIVIDER', 'MISSING_ZEBRA_CROSSING']
        if detection_type in road_hazard_types:
            from roads.services import RoadService
            RoadService.record_hazard_from_detection(detection, road_name)

        # Handle Incidents (HIT_AND_RUN, RASH_DRIVING, PEDESTRIAN, SCHOOL_CHILD)
        incident_types = ['HIT_AND_RUN', 'RASH_DRIVING', 'PEDESTRIAN', 'SCHOOL_CHILD']
        if detection_type in incident_types or severity == 'CRITICAL':
            from incidents.services import IncidentService
            IncidentService.record_incident_from_detection(detection)

        # Generate Alert if severity is HIGH or CRITICAL
        if severity in ['HIGH', 'CRITICAL']:
            from notifications.services import AlertService
            AlertService.create_alert(
                alert_type=detection_type,
                severity=severity,
                title=f"{detection_type.replace('_', ' ').title()} Detected",
                message=f"{detection_type.replace('_', ' ').title()} detected by {bus.bus_id} at {road_name} (Confidence: {confidence*100:.1f}%)",
                location=road_name,
                bus=bus,
                latitude=latitude,
                longitude=longitude
            )

        # Broadcast via WebSocket channel
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    "dashboard_updates",
                    {
                        "type": "dashboard_event",
                        "event": "NEW_DETECTION",
                        "data": {
                            "id": detection.detection_id,
                            "type": detection.detection_type,
                            "confidence": round(detection.confidence, 3),
                            "severity": detection.severity.lower(),
                            "bus_id": bus.bus_id,
                            "busId": bus.bus_id,
                            "location": road_name,
                            "gps": [latitude, longitude],
                            "timestamp": detection.timestamp.isoformat(),
                        }
                    }
                )
        except Exception:
            pass

        return detection
