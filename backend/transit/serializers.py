from rest_framework import serializers
from .models import (
    TransportAgency, TransportMode, Stop, Route, RouteStop,
    Transfer, Vehicle, VehiclePosition, FareRule, ServiceAlert,
    DataSource, DataSyncLog, PlaceLandmark
)

class TransportAgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportAgency
        fields = '__all__'


class TransportModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportMode
        fields = '__all__'


class StopSerializer(serializers.ModelSerializer):
    agency_name = serializers.CharField(source='agency.name', read_only=True)
    agency_code = serializers.CharField(source='agency.code', read_only=True)
    coordinates = serializers.ReadOnlyField()

    class Meta:
        model = Stop
        fields = [
            'id', 'stop_id', 'name', 'name_gu', 'name_hi', 'code',
            'agency', 'agency_name', 'agency_code', 'mode',
            'latitude', 'longitude', 'coordinates', 'zone',
            'is_interchange', 'wheelchair_accessible', 'has_elevator',
            'has_escalator', 'platform_info'
        ]


class RouteStopSerializer(serializers.ModelSerializer):
    stop_name = serializers.CharField(source='stop.name', read_only=True)
    stop_name_gu = serializers.CharField(source='stop.name_gu', read_only=True)
    latitude = serializers.FloatField(source='stop.latitude', read_only=True)
    longitude = serializers.FloatField(source='stop.longitude', read_only=True)
    mode = serializers.CharField(source='stop.mode', read_only=True)

    class Meta:
        model = RouteStop
        fields = [
            'id', 'sequence', 'stop', 'stop_name', 'stop_name_gu',
            'latitude', 'longitude', 'mode',
            'distance_from_start_km', 'travel_time_mins', 'is_major_stop'
        ]


class RouteSerializer(serializers.ModelSerializer):
    agency_name = serializers.CharField(source='agency.name', read_only=True)
    agency_code = serializers.CharField(source='agency.code', read_only=True)
    stops = RouteStopSerializer(source='route_stops', many=True, read_only=True)

    class Meta:
        model = Route
        fields = [
            'id', 'route_id', 'route_number', 'route_name',
            'agency', 'agency_name', 'agency_code', 'mode',
            'color', 'text_color', 'is_circular',
            'headway_peak_mins', 'headway_offpeak_mins',
            'first_trip_time', 'last_trip_time', 'average_speed_kmh',
            'reliability_score', 'is_active', 'stops'
        ]


class TransferSerializer(serializers.ModelSerializer):
    from_stop_name = serializers.CharField(source='from_stop.name', read_only=True)
    to_stop_name = serializers.CharField(source='to_stop.name', read_only=True)

    class Meta:
        model = Transfer
        fields = '__all__'


class VehiclePositionSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.CharField(source='vehicle.vehicle_id', read_only=True)
    registration = serializers.CharField(source='vehicle.registration', read_only=True)
    mode = serializers.CharField(source='vehicle.mode', read_only=True)
    agency_name = serializers.CharField(source='vehicle.agency.name', read_only=True)
    route_number = serializers.CharField(source='vehicle.current_route.route_number', read_only=True)
    route_name = serializers.CharField(source='vehicle.current_route.route_name', read_only=True)
    next_stop_name = serializers.CharField(source='next_stop.name', read_only=True)
    coordinates = serializers.ReadOnlyField()

    class Meta:
        model = VehiclePosition
        fields = [
            'id', 'vehicle', 'vehicle_id', 'registration', 'mode',
            'agency_name', 'route_number', 'route_name',
            'latitude', 'longitude', 'coordinates', 'speed_kmh', 'heading',
            'current_location_name', 'next_stop', 'next_stop_name',
            'eta_next_stop_seconds', 'delay_minutes', 'status',
            'is_live', 'data_source', 'last_updated'
        ]


class VehicleSerializer(serializers.ModelSerializer):
    live_position = VehiclePositionSerializer(read_only=True)
    agency_name = serializers.CharField(source='agency.name', read_only=True)
    route_number = serializers.CharField(source='current_route.route_number', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'vehicle_id', 'registration', 'agency', 'agency_name',
            'mode', 'current_route', 'route_number', 'capacity',
            'is_electric', 'is_wheelchair_accessible', 'is_active',
            'live_position'
        ]


class ServiceAlertSerializer(serializers.ModelSerializer):
    agency_name = serializers.CharField(source='agency.name', read_only=True)
    route_number = serializers.CharField(source='route.route_number', read_only=True)
    affected_stop_name = serializers.CharField(source='affected_stop.name', read_only=True)

    class Meta:
        model = ServiceAlert
        fields = '__all__'


class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = '__all__'


class PlaceLandmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaceLandmark
        fields = '__all__'
