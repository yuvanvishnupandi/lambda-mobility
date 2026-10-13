from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Alert

class AlertService:
    @staticmethod
    def create_alert(alert_type, severity, title, message, location,
                     bus=None, incident=None, latitude=23.0225, longitude=72.5714, confidence=0.95):
        alert = Alert.objects.create(
            alert_type=alert_type,
            severity=severity,
            title=title,
            message=message,
            location=location,
            bus=bus,
            incident=incident,
            latitude=latitude,
            longitude=longitude,
            confidence=confidence,
            is_read=False
        )

        # Broadcast via Channel Layer
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                event_data = {
                    "type": "alert_event",
                    "event": "NEW_ALERT",
                    "data": {
                        "id": alert.id,
                        "severity": alert.severity.lower(),
                        "type": alert.alert_type,
                        "title": alert.title,
                        "message": alert.message,
                        "location": alert.location,
                        "bus": bus.bus_id if bus else '',
                        "busId": bus.bus_id if bus else '',
                        "confidence": round(alert.confidence, 3),
                        "gps": [latitude, longitude],
                        "timestamp": "Just now",
                    }
                }
                async_to_sync(channel_layer.group_send)("alert_updates", event_data)
                async_to_sync(channel_layer.group_send)("dashboard_updates", event_data)
        except Exception:
            pass

        return alert

    @staticmethod
    def mark_read(alert):
        alert.is_read = True
        alert.save(update_fields=['is_read'])
        return alert

    @staticmethod
    def acknowledge(alert):
        alert.acknowledged = True
        alert.acknowledged_at = timezone.now()
        alert.is_read = True
        alert.save(update_fields=['acknowledged', 'acknowledged_at', 'is_read'])
        return alert
