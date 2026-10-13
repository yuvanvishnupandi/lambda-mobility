from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import TrafficObservation
from .serializers import TrafficObservationSerializer
from .services import TrafficService

class CurrentTrafficView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = TrafficService.get_current_traffic()
        serializer = TrafficObservationSerializer(data, many=True)
        return Response({
            'success': True,
            'count': len(serializer.data),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class TrafficHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        hours = int(request.query_params.get('hours', 24))
        history = TrafficService.get_traffic_history(hours=hours)
        return Response(history, status=status.HTTP_200_OK)


class TrafficSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        summary = TrafficService.get_traffic_summary()
        return Response(summary, status=status.HTTP_200_OK)


class CongestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        zones = TrafficService.get_congestion_by_zone()
        return Response(zones, status=status.HTTP_200_OK)


class VehicleClassificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        classification = TrafficService.get_vehicle_classification()
        return Response(classification, status=status.HTTP_200_OK)
