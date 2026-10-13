from rest_framework import serializers
from .models import Detection
from fleet.models import Bus

class DetectionSerializer(serializers.ModelSerializer):
    busId = serializers.CharField(source='bus.bus_id', read_only=True)
    bus_id = serializers.CharField(source='bus.bus_id', read_only=True)
    type = serializers.CharField(source='detection_type', read_only=True)
    location = serializers.CharField(source='location_name', read_only=True)
    gps = serializers.SerializerMethodField()

    class Meta:
        model = Detection
        fields = [
            'id', 'detection_id', 'bus', 'bus_id', 'busId',
            'detection_type', 'type', 'confidence', 'severity',
            'latitude', 'longitude', 'gps', 'location', 'location_name',
            'timestamp', 'frame_reference', 'status', 'metadata', 'created_at'
        ]

    def get_gps(self, obj):
        return [obj.latitude, obj.longitude]


class DetectionCreateSerializer(serializers.Serializer):
    bus_id = serializers.CharField(required=True)
    detection_type = serializers.ChoiceField(choices=Detection.DETECTION_TYPE_CHOICES, required=True)
    confidence = serializers.FloatField(required=True, min_value=0.0, max_value=1.0)
    latitude = serializers.FloatField(required=True)
    longitude = serializers.FloatField(required=True)
    timestamp = serializers.DateTimeField(required=False)
    frame_reference = serializers.CharField(required=False, allow_blank=True, default='')
    metadata = serializers.DictField(required=False, default=dict)
