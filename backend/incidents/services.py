from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Incident
from vehicles.services import VehicleTrackingService
from notifications.services import AlertService

class IncidentService:
    @staticmethod
    def process_hit_and_run_detection(bus, latitude, longitude, vehicle_registration='TN19AZ4821',
                                     vehicle_type='White SUV', vehicle_color='White',
                                     location_name='GST Road (NH 45) Near Potheri SRM',
                                     frame_reference=None):
        """
        Hit-and-Run simulated pipeline:
        1. Incident detected
        2. Vehicle detected
        3. Vehicle tracked
        4. ANPR processed
        5. Registration extracted
        6. Confidence calculated (96.4%)
        7. Incident created
        8. Alert generated
        """
        now = timezone.now()
        anpr_confidence = 0.964

        # Steps 2, 3, 4, 5, 6: Track vehicle & simulate ANPR
        vehicle, v_det, anpr = VehicleTrackingService.record_sighting(
            registration_number=vehicle_registration,
            vehicle_type=vehicle_type,
            vehicle_color=vehicle_color,
            confidence=anpr_confidence,
            bus=bus,
            latitude=latitude,
            longitude=longitude,
            direction='Northbound towards Tambaram',
            frame_reference=frame_reference or 'evidence_frame_hr_01.jpg',
            location_name=location_name
        )
        vehicle.flagged_for_incident = True
        vehicle.save()

        # Step 7: Create incident with timeline & vehicle metadata
        timeline = [
            {"time": now.strftime('%H:%M:%S'), "title": "Impact Detected", "desc": f"Mobile sensor {bus.bus_id} registered lateral impact event"},
            {"time": now.strftime('%H:%M:%S'), "title": "Vehicle Tracked", "desc": f"Edge camera tracked escaping {vehicle_color} {vehicle_type}"},
            {"time": now.strftime('%H:%M:%S'), "title": "ANPR Extracted", "desc": f"License plate recognized as {vehicle.registration_number} (Confidence: 96.4%)"},
            {"time": now.strftime('%H:%M:%S'), "title": "Critical Dispatch Alert", "desc": "Notified Chengalpattu Highway Patrol & Control Room"}
        ]

        vehicle_info = {
            "registration": vehicle.registration_number,
            "type": vehicle.vehicle_type,
            "color": vehicle.vehicle_color,
            "direction": "Northbound",
            "confidence": anpr_confidence,
            "last_sighting": location_name
        }

        incident = Incident.objects.create(
            incident_type='HIT_AND_RUN',
            severity='CRITICAL',
            bus=bus,
            location=location_name,
            latitude=latitude,
            longitude=longitude,
            timestamp=now,
            confidence=anpr_confidence,
            status='OPEN',
            description=f"Hit-and-run incident involving {vehicle_color} {vehicle_type} (Plate: {vehicle.registration_number}). Captured by {bus.bus_id} on {location_name}.",
            tracked_vehicle=vehicle,
            vehicle_info=vehicle_info,
            evidence_frame=frame_reference or 'evidence_frame_hr_01.jpg',
            timeline=timeline,
            assigned_team='Chengalpattu Highway Patrol & Traffic Response Unit 4'
        )

        # Step 8: Generate Critical Alert
        alert = AlertService.create_alert(
            alert_type='HIT_AND_RUN',
            severity='CRITICAL',
            title='Critical Hit-and-Run Detected',
            message=f"Hit-and-run detected by {bus.bus_id} on {location_name}. Suspect Vehicle: {vehicle.registration_number} ({anpr_confidence*100:.1f}% confidence)",
            location=location_name,
            bus=bus,
            incident=incident,
            latitude=latitude,
            longitude=longitude
        )

        # Broadcast WebSocket event
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    "dashboard_updates",
                    {
                        "type": "dashboard_event",
                        "event": "NEW_INCIDENT",
                        "data": {
                            "id": incident.incident_id,
                            "type": incident.incident_type,
                            "severity": incident.severity.lower(),
                            "location": incident.location,
                            "busId": bus.bus_id,
                            "confidence": incident.confidence,
                            "time": "Just now",
                            "gps": [latitude, longitude],
                            "vehicleInfo": vehicle_info
                        }
                    }
                )
        except Exception:
            pass

        return incident

    @staticmethod
    def record_incident_from_detection(detection):
        incident_type = 'HIT_AND_RUN' if detection.detection_type == 'HIT_AND_RUN' else 'RASH_DRIVING'
        if detection.detection_type in ['PEDESTRIAN', 'SCHOOL_CHILD']:
            incident_type = 'PEDESTRIAN_RISK'

        incident = Incident.objects.create(
            incident_type=incident_type,
            severity=detection.severity,
            bus=detection.bus,
            location=detection.location_name,
            latitude=detection.latitude,
            longitude=detection.longitude,
            timestamp=detection.timestamp,
            confidence=detection.confidence,
            status='OPEN',
            description=f"Automated AI detection {detection.detection_id} flagged as incident on {detection.location_name}.",
            evidence_frame=detection.frame_reference,
            timeline=[
                {"time": detection.timestamp.strftime('%H:%M:%S'), "title": "Detected", "desc": f"Detected by mobile sensing unit {detection.bus.bus_id}"}
            ]
        )
        return incident

    @staticmethod
    def resolve_incident(incident, resolution_notes='Resolved by operator'):
        incident.status = 'RESOLVED'
        incident.resolved_at = timezone.now()
        incident.resolution_notes = resolution_notes

        timeline = incident.timeline or []
        timeline.append({
            "time": incident.resolved_at.strftime('%H:%M:%S'),
            "title": "Incident Resolved",
            "desc": resolution_notes
        })
        incident.timeline = timeline
        incident.save(update_fields=['status', 'resolved_at', 'resolution_notes', 'timeline', 'updated_at'])
        return incident
