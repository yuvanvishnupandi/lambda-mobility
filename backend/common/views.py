from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from fleet.models import Bus
from fleet.serializers import BusSerializer
from detections.models import Detection
from detections.serializers import DetectionSerializer
from roads.models import RoadHazard, RoadSegment
from roads.serializers import RoadHazardSerializer, RoadSegmentSerializer
from incidents.models import Incident
from incidents.serializers import IncidentSerializer
from traffic.models import TrafficObservation
from traffic.serializers import TrafficObservationSerializer
from .models import SchoolZone, Location
from .serializers import SchoolZoneSerializer, LocationSerializer
from .spatial import is_point_in_radius

class MapBusesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        buses = Bus.objects.select_related('route').all()
        serializer = BusSerializer(buses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MapDetectionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get('limit', 100))
        detections = Detection.objects.select_related('bus').order_by('-timestamp')[:limit]
        serializer = DetectionSerializer(detections, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MapIncidentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        incidents = Incident.objects.select_related('bus', 'tracked_vehicle').all()
        serializer = IncidentSerializer(incidents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MapHazardsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        hazards = RoadHazard.objects.select_related('detected_by_bus').all()
        serializer = RoadHazardSerializer(hazards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MapTrafficView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        traffic = TrafficObservation.objects.order_by('-timestamp')[:50]
        serializer = TrafficObservationSerializer(traffic, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MapAllView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        buses = Bus.objects.select_related('route')[:50]
        hazards = RoadHazard.objects.select_related('detected_by_bus')[:60]
        incidents = Incident.objects.select_related('bus', 'tracked_vehicle')[:30]
        traffic = TrafficObservation.objects.order_by('-timestamp')[:20]
        segments = RoadSegment.objects.all()[:30]

        return Response({
            "buses": BusSerializer(buses, many=True).data,
            "hazards": RoadHazardSerializer(hazards, many=True).data,
            "incidents": IncidentSerializer(incidents, many=True).data,
            "traffic": TrafficObservationSerializer(traffic, many=True).data,
            "infrastructure": RoadSegmentSerializer(segments, many=True).data
        }, status=status.HTTP_200_OK)


class SchoolZoneSafetyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        zones = SchoolZone.objects.filter(active=True)
        zones_data = SchoolZoneSerializer(zones, many=True).data

        # Find pedestrian detections near active school zones
        recent_peds = Detection.objects.filter(
            detection_type__in=['PEDESTRIAN', 'SCHOOL_CHILD']
        ).order_by('-timestamp')[:100]

        vulnerable_events = []
        for zone in zones:
            for ped in recent_peds:
                if is_point_in_radius(zone.latitude, zone.longitude, ped.latitude, ped.longitude, zone.radius):
                    vulnerable_events.append({
                        "school_name": zone.name,
                        "risk_level": zone.risk_level,
                        "detection_id": ped.detection_id,
                        "type": ped.detection_type,
                        "confidence": ped.confidence,
                        "timestamp": ped.timestamp.isoformat(),
                        "gps": [ped.latitude, ped.longitude],
                        "bus_id": ped.bus.bus_id
                    })

        return Response({
            "school_zones": zones_data,
            "vulnerable_pedestrian_events": vulnerable_events[:20],
            "total_active_zones": len(zones_data)
        }, status=status.HTTP_200_OK)
