from rest_framework import serializers
from .models import TrafficObservation

class TrafficObservationSerializer(serializers.ModelSerializer):
    bus_id = serializers.CharField(source='bus.bus_id', read_only=True, default='')
    time = serializers.SerializerMethodField()
    gps = serializers.SerializerMethodField()

    class Meta:
        model = TrafficObservation
        fields = [
            'id', 'bus', 'bus_id', 'location', 'latitude', 'longitude', 'gps',
            'timestamp', 'time', 'vehicle_count', 'car_count', 'bus_count',
            'truck_count', 'two_wheeler_count', 'auto_count', 'average_speed',
            'congestion_level', 'congestion_index', 'created_at'
        ]

    def get_time(self, obj):
        return obj.timestamp.strftime('%H:%M')

    def get_gps(self, obj):
        return [obj.latitude, obj.longitude]
