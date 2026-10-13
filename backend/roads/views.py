from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import RoadHazard, RoadSegment
from .serializers import RoadHazardSerializer, RoadSummarySerializer
from .services import RoadService

class RoadHazardListView(generics.ListAPIView):
    serializer_class = RoadHazardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = RoadHazard.objects.select_related('detected_by_bus').all()
        severity = self.request.query_params.get('severity')
        hazard_type = self.request.query_params.get('hazard_type') or self.request.query_params.get('type')
        road = self.request.query_params.get('road')
        status_param = self.request.query_params.get('status')

        if severity:
            qs = qs.filter(severity__iexact=severity)
        if hazard_type:
            qs = qs.filter(hazard_type__iexact=hazard_type)
        if road:
            qs = qs.filter(road_name__icontains=road)
        if status_param:
            qs = qs.filter(status__iexact=status_param)
        return qs

    @extend_schema(
        parameters=[
            OpenApiParameter('severity', description='Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)'),
            OpenApiParameter('hazard_type', description='Filter by hazard type (e.g. POTHOLE)'),
            OpenApiParameter('road', description='Search road name'),
            OpenApiParameter('status', description='Filter by status'),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class RoadHazardDetailView(generics.RetrieveUpdateAPIView):
    queryset = RoadHazard.objects.select_related('detected_by_bus').all()
    serializer_class = RoadHazardSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


class RoadSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: RoadSummarySerializer})
    def get(self, request):
        summary = RoadService.get_summary()
        return Response(summary, status=status.HTTP_200_OK)


class MaintenancePriorityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = RoadHazard.objects.filter(
            status__in=['PENDING', 'VERIFIED', 'IN_PROGRESS']
        ).order_by('-maintenance_priority')[:50]
        serializer = RoadHazardSerializer(qs, many=True)
        return Response({
            'success': True,
            'count': len(serializer.data),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
