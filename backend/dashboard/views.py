from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .services import DashboardService
from .simulation import SimulationEngine

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        summary = DashboardService.get_summary()
        return Response(summary, status=status.HTTP_200_OK)


class LiveAlertsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        alerts = DashboardService.get_live_alerts()
        return Response(alerts, status=status.HTTP_200_OK)


class DemoStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        engine = SimulationEngine()
        success, message = engine.start()
        return Response({
            'success': success,
            'message': message,
            'status': engine.get_status()
        }, status=status.HTTP_200_OK if success else status.HTTP_400_BAD_REQUEST)


class DemoStopView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        engine = SimulationEngine()
        success, message = engine.stop()
        return Response({
            'success': success,
            'message': message,
            'status': engine.get_status()
        }, status=status.HTTP_200_OK if success else status.HTTP_400_BAD_REQUEST)


class DemoStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        engine = SimulationEngine()
        return Response(engine.get_status(), status=status.HTTP_200_OK)
