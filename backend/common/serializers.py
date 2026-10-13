from rest_framework import serializers
from .models import Location, SchoolZone

class LocationSerializer(serializers.ModelSerializer):
    gps = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ['id', 'name', 'address', 'city', 'state', 'latitude', 'longitude', 'gps', 'landmark']

    def get_gps(self, obj):
        return [obj.latitude, obj.longitude]


class SchoolZoneSerializer(serializers.ModelSerializer):
    gps = serializers.SerializerMethodField()

    class Meta:
        model = SchoolZone
        fields = [
            'id', 'name', 'latitude', 'longitude', 'gps', 'radius',
            'risk_level', 'active', 'school_type', 'student_count_estimate', 'created_at'
        ]

    def get_gps(self, obj):
        return [obj.latitude, obj.longitude]
