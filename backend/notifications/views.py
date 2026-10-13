# pyrefly: ignore [missing-import]
from rest_framework import generics, status, permissions
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
# pyrefly: ignore [missing-import]
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Alert
from .serializers import AlertSerializer
from .services import AlertService

class AlertListView(generics.ListAPIView):
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Alert.objects.select_related('bus', 'incident').all()
        severity = self.request.query_params.get('severity')
        is_read = self.request.query_params.get('is_read')
        alert_type = self.request.query_params.get('type') or self.request.query_params.get('alert_type')

        if severity:
            qs = qs.filter(severity__iexact=severity)
        if is_read is not None:
            qs = qs.filter(is_read=is_read.lower() in ['true', '1'])
        if alert_type:
            qs = qs.filter(alert_type__iexact=alert_type)
        return qs

    @extend_schema(
        parameters=[
            OpenApiParameter('severity', description='Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)'),
            OpenApiParameter('is_read', description='Filter by read status (true/false)'),
            OpenApiParameter('type', description='Filter by alert type'),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class AlertReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, id):
        alert = get_object_or_404(Alert, id=id)
        AlertService.mark_read(alert)
        return Response({
            'success': True,
            'message': f'Alert {id} marked as read',
            'data': AlertSerializer(alert).data
        }, status=status.HTTP_200_OK)


class AlertAcknowledgeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        alert = get_object_or_404(Alert, id=id)
        AlertService.acknowledge(alert)
        return Response({
            'success': True,
            'message': f'Alert {id} acknowledged',
            'data': AlertSerializer(alert).data
        }, status=status.HTTP_200_OK)


class AlertMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Alert.objects.filter(is_read=False).update(is_read=True)
        return Response({
            'success': True,
            'message': 'All alerts marked as read'
        }, status=status.HTTP_200_OK)

