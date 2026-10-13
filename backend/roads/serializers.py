from rest_framework import serializers
from .models import RoadHazard, RoadSegment, MaintenanceTask

class RoadHazardSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='hazard_type', read_only=True)
    location = serializers.CharField(source='road_name', read_only=True)
    busId = serializers.CharField(source='detected_by_bus.bus_id', read_only=True, default='BUS-104')
    timestamp = serializers.DateTimeField(source='last_detected', read_only=True)
    gps = serializers.SerializerMethodField()

    class Meta:
        model = RoadHazard
        fields = [
            'id', 'road_name', 'hazard_type', 'type', 'location',
            'severity', 'confidence', 'latitude', 'longitude', 'gps',
            'detected_by_bus', 'busId', 'first_detected', 'last_detected',
            'timestamp', 'occurrence_count', 'status', 'maintenance_priority',
            'description', 'created_at', 'updated_at'
        ]

    def get_gps(self, obj):
        return [obj.latitude, obj.longitude]


class RoadSegmentSerializer(serializers.ModelSerializer):
    start_gps = serializers.SerializerMethodField()
    end_gps = serializers.SerializerMethodField()

    class Meta:
        model = RoadSegment
        fields = [
            'id', 'road_name', 'segment_code', 'start_latitude', 'start_longitude',
            'end_latitude', 'end_longitude', 'start_gps', 'end_gps',
            'condition_score', 'is_critical', 'last_surveyed'
        ]

    def get_start_gps(self, obj):
        return [obj.start_latitude, obj.start_longitude]

    def get_end_gps(self, obj):
        return [obj.end_latitude, obj.end_longitude]


class MaintenanceTaskSerializer(serializers.ModelSerializer):
    hazard = RoadHazardSerializer(read_only=True)

    class Meta:
        model = MaintenanceTask
        fields = ['id', 'task_number', 'hazard', 'assigned_team', 'scheduled_date', 'status', 'notes', 'created_at']


class RoadSummarySerializer(serializers.Serializer):
    roads_scanned = serializers.IntegerField()
    hazards_detected = serializers.IntegerField()
    critical_segments = serializers.IntegerField()
    maintenance_priority = serializers.IntegerField()
