from rest_framework import serializers
from .models import TrackedVehicle, VehicleDetection, ANPRDetection

class VehicleDetectionSerializer(serializers.ModelSerializer):
    bus_id = serializers.CharField(source='bus.bus_id', read_only=True, default='')
    gps = serializers.SerializerMethodField()

    class Meta:
        model = VehicleDetection
        fields = [
            'id', 'vehicle', 'bus', 'bus_id', 'latitude', 'longitude',
            'gps', 'timestamp', 'direction', 'speed_estimate', 'confidence',
            'frame_reference', 'location_name', 'created_at'
        ]

    def get_gps(self, obj):
        return [obj.latitude, obj.longitude]


class ANPRDetectionSerializer(serializers.ModelSerializer):
    bus_id = serializers.CharField(source='bus.bus_id', read_only=True, default='')
    gps = serializers.SerializerMethodField()

    class Meta:
        model = ANPRDetection
        fields = [
            'id', 'vehicle', 'registration_number', 'confidence', 'bus',
            'bus_id', 'latitude', 'longitude', 'gps', 'timestamp',
            'image_reference', 'location_name', 'created_at'
        ]

    def get_gps(self, obj):
        return [obj.latitude, obj.longitude]


class TrackedVehicleSerializer(serializers.ModelSerializer):
    detections_count = serializers.IntegerField(source='detections.count', read_only=True)
    latest_detection = serializers.SerializerMethodField()

    class Meta:
        model = TrackedVehicle
        fields = [
            'id', 'registration_number', 'vehicle_type', 'vehicle_color',
            'confidence', 'first_seen', 'last_seen', 'flagged_for_incident',
            'detections_count', 'latest_detection', 'created_at', 'updated_at'
        ]

    def get_latest_detection(self, obj):
        det = obj.detections.first()
        if det:
            return {
                'location': det.location_name,
                'gps': [det.latitude, det.longitude],
                'timestamp': det.timestamp.isoformat(),
                'bus_id': det.bus.bus_id if det.bus else ''
            }
        return None
