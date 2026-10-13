from rest_framework import serializers
from .models import Bus, BusRoute, BusCamera, BusLocationHistory

class BusRouteSerializer(serializers.ModelSerializer):
    bus_count = serializers.IntegerField(source='buses.count', read_only=True)

    class Meta:
        model = BusRoute
        fields = ['id', 'route_number', 'route_name', 'start_location', 'end_location', 'status', 'waypoints', 'bus_count']


class BusCameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusCamera
        fields = ['id', 'camera_id', 'camera_type', 'status', 'last_frame', 'resolution', 'fps', 'last_seen']


class BusSerializer(serializers.ModelSerializer):
    route_name = serializers.CharField(source='route.route_name', read_only=True, default='')
    route_number = serializers.CharField(source='route.route_number', read_only=True, default='')
    gps = serializers.SerializerMethodField()
    cameras = serializers.SerializerMethodField()
    location = serializers.CharField(source='current_location_name', required=False)
    aiStatus = serializers.CharField(source='ai_status', required=False)
    lastUpdate = serializers.SerializerMethodField()

    class Meta:
        model = Bus
        fields = [
            'id', 'bus_id', 'registration_number', 'route', 'route_name', 'route_number',
            'status', 'latitude', 'longitude', 'gps', 'speed', 'heading',
            'last_seen', 'ai_status', 'aiStatus', 'current_location_name', 'location',
            'cameras', 'lastUpdate', 'created_at', 'updated_at'
        ]

    def get_gps(self, obj):
        return [obj.latitude, obj.longitude]

    def get_cameras(self, obj):
        if obj.cameras_status:
            return obj.cameras_status
        # Fallback to related camera records
        cams = {c.camera_type.lower(): (c.status == 'ACTIVE') for c in obj.cameras.all()}
        return {
            'front': cams.get('front', True),
            'rear': cams.get('rear', True),
            'left': cams.get('left', True),
            'right': cams.get('right', True),
            'passenger': cams.get('passenger', True),
        }

    def get_lastUpdate(self, obj):
        from django.utils import timezone
        diff = timezone.now() - obj.last_seen
        seconds = int(diff.total_seconds())
        if seconds < 60:
            return f"{max(1, seconds)} sec ago"
        elif seconds < 3600:
            return f"{seconds // 60} min ago"
        return f"{seconds // 3600} hr ago"


class LocationUpdateSerializer(serializers.Serializer):
    latitude = serializers.FloatField(required=True)
    longitude = serializers.FloatField(required=True)
    speed = serializers.FloatField(required=False, default=0.0)
    heading = serializers.FloatField(required=False, default=0.0)
    location_name = serializers.CharField(required=False, allow_blank=True, default='')


class BusLocationHistorySerializer(serializers.ModelSerializer):
    gps = serializers.SerializerMethodField()

    class Meta:
        model = BusLocationHistory
        fields = ['id', 'bus', 'latitude', 'longitude', 'gps', 'speed', 'heading', 'timestamp']

    def get_gps(self, obj):
        return [obj.latitude, obj.longitude]
