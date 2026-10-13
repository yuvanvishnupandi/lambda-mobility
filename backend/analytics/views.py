from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .services import AnalyticsService
from traffic.services import TrafficService

class AnalyticsDetectionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = AnalyticsService.get_detection_analytics()
        return Response(data, status=status.HTTP_200_OK)


class AnalyticsTrafficView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        history = TrafficService.get_traffic_history(hours=24)
        summary = TrafficService.get_traffic_summary()
        zones = TrafficService.get_congestion_by_zone()
        classification = TrafficService.get_vehicle_classification()
        return Response({
            "summary": summary,
            "hourly_density": history,
            "congestion_by_zone": zones,
            "vehicle_classification": classification
        }, status=status.HTTP_200_OK)


class AnalyticsRoadConditionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = AnalyticsService.get_road_conditions()
        return Response(data, status=status.HTTP_200_OK)


class AnalyticsIncidentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = AnalyticsService.get_incident_analytics()
        return Response(data, status=status.HTTP_200_OK)


class AnalyticsRouteDelaysView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = AnalyticsService.get_route_delays()
        return Response(data, status=status.HTTP_200_OK)


class AnalyticsInsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        insights = AnalyticsService.generate_ai_insights()
        return Response(insights, status=status.HTTP_200_OK)
