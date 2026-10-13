from rest_framework import serializers
from .models import Incident
from fleet.serializers import BusSerializer

class IncidentSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='incident_type', read_only=True)
    busId = serializers.CharField(source='bus.bus_id', read_only=True, default='')
    time = serializers.SerializerMethodField()
    gps = serializers.SerializerMethodField()
    vehicleInfo = serializers.JSONField(source='vehicle_info', read_only=True)

    class Meta:
        model = Incident
        fields = [
            'id', 'incident_id', 'incident_type', 'type', 'severity',
            'bus', 'busId', 'location', 'latitude', 'longitude', 'gps',
            'timestamp', 'time', 'confidence', 'status', 'description',
            'assigned_to', 'assigned_team', 'resolved_at', 'vehicleInfo',
            'vehicle_info', 'evidence_frame', 'timeline', 'created_at', 'updated_at'
        ]

    def get_time(self, obj):
        from django.utils import timezone
        diff = timezone.now() - obj.timestamp
        seconds = int(diff.total_seconds())
        if seconds < 60:
            return f"{max(1, seconds)} sec ago"
        elif seconds < 3600:
            return f"{seconds // 60} min ago"
        return obj.timestamp.strftime('%H:%M')

    def get_gps(self, obj):
        return [obj.latitude, obj.longitude]


class IncidentDetailSerializer(IncidentSerializer):
    bus_details = BusSerializer(source='bus', read_only=True)

    class Meta(IncidentSerializer.Meta):
        fields = IncidentSerializer.Meta.fields + ['bus_details', 'resolution_notes']


class IncidentCreateSerializer(serializers.ModelSerializer):
    bus_id = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = Incident
        fields = [
            'incident_type', 'severity', 'bus_id', 'location',
            'latitude', 'longitude', 'confidence', 'description',
            'vehicle_info', 'evidence_frame'
        ]

    def create(self, validated_data):
        bus_id = validated_data.pop('bus_id', None)
        if bus_id:
            from fleet.models import Bus
            try:
                validated_data['bus'] = Bus.objects.get(bus_id=bus_id)
            except Bus.DoesNotExist:
                pass
        return super().create(validated_data)


class IncidentResolveSerializer(serializers.Serializer):
    resolution_notes = serializers.CharField(required=False, allow_blank=True, default='Incident resolved by operator.')
    status = serializers.ChoiceField(choices=['RESOLVED', 'DISMISSED'], default='RESOLVED')
