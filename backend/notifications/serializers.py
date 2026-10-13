from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='alert_type', read_only=True)
    busId = serializers.CharField(source='bus.bus_id', read_only=True, default='')
    bus_id = serializers.CharField(source='bus.bus_id', read_only=True, default='')
    incident_id = serializers.CharField(source='incident.incident_id', read_only=True, default=None)
    timestamp = serializers.SerializerMethodField()
    gps = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = [
            'id', 'alert_type', 'type', 'severity', 'title', 'message',
            'location', 'bus', 'busId', 'bus_id', 'incident', 'incident_id',
            'confidence', 'latitude', 'longitude', 'gps', 'timestamp',
            'is_read', 'acknowledged', 'acknowledged_at', 'created_at'
        ]

    def get_timestamp(self, obj):
        from django.utils import timezone
        diff = timezone.now() - obj.created_at
        seconds = int(diff.total_seconds())
        if seconds < 60:
            return f"{max(1, seconds)} sec ago"
        elif seconds < 3600:
            return f"{seconds // 60} min ago"
        return obj.created_at.strftime('%H:%M')

    def get_gps(self, obj):
        return [obj.latitude, obj.longitude]
