from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Incident
from .serializers import (
    IncidentSerializer, IncidentDetailSerializer,
    IncidentCreateSerializer, IncidentResolveSerializer
)
from .services import IncidentService

class IncidentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return IncidentCreateSerializer
        return IncidentSerializer

    def get_queryset(self):
        qs = Incident.objects.select_related('bus', 'tracked_vehicle', 'assigned_to').all()
        severity = self.request.query_params.get('severity')
        status_param = self.request.query_params.get('status')
        incident_type = self.request.query_params.get('type') or self.request.query_params.get('incident_type')
        bus = self.request.query_params.get('bus')

        if severity:
            qs = qs.filter(severity__iexact=severity)
        if status_param:
            qs = qs.filter(status__iexact=status_param)
        if incident_type:
            qs = qs.filter(incident_type__iexact=incident_type)
        if bus:
            qs = qs.filter(bus__bus_id__iexact=bus)
        return qs

    @extend_schema(
        parameters=[
            OpenApiParameter('severity', description='Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)'),
            OpenApiParameter('status', description='Filter by status (OPEN, INVESTIGATING, ASSIGNED, RESOLVED)'),
            OpenApiParameter('type', description='Filter by type (HIT_AND_RUN, RASH_DRIVING, ACCIDENT, etc.)'),
            OpenApiParameter('bus', description='Filter by bus ID'),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class IncidentDetailView(generics.RetrieveUpdateAPIView):
    queryset = Incident.objects.select_related('bus', 'tracked_vehicle', 'assigned_to').all()
    serializer_class = IncidentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        lookup = self.kwargs.get('id')
        if str(lookup).isdigit():
            return get_object_or_404(Incident, id=int(lookup))
        return get_object_or_404(Incident, incident_id=lookup)


class IncidentResolveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=IncidentResolveSerializer, responses={200: IncidentDetailSerializer})
    def post(self, request, id):
        if str(id).isdigit():
            incident = get_object_or_404(Incident, id=int(id))
        else:
            incident = get_object_or_404(Incident, incident_id=id)

        serializer = IncidentResolveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        notes = serializer.validated_data.get('resolution_notes', 'Resolved by operator')
        IncidentService.resolve_incident(incident, resolution_notes=notes)

        return Response({
            'success': True,
            'message': f'Incident {incident.incident_id} marked as RESOLVED',
            'data': IncidentDetailSerializer(incident).data
        }, status=status.HTTP_200_OK)


# Edge API for edge AI incident triggers
class EdgeIncidentView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        bus_id = request.data.get('bus_id')
        incident_type = request.data.get('incident_type', 'HIT_AND_RUN')
        latitude = request.data.get('latitude', 23.0395)
        longitude = request.data.get('longitude', 72.5667)

        from fleet.models import Bus
        bus = get_object_or_404(Bus, bus_id=bus_id)

        if incident_type == 'HIT_AND_RUN':
            reg = request.data.get('registration_number', 'GJ01XX4821')
            incident = IncidentService.process_hit_and_run_detection(
                bus=bus,
                latitude=latitude,
                longitude=longitude,
                vehicle_registration=reg,
                location_name=request.data.get('location', 'SG Highway')
            )
        else:
            incident = Incident.objects.create(
                incident_type=incident_type,
                severity=request.data.get('severity', 'HIGH'),
                bus=bus,
                location=request.data.get('location', bus.current_location_name),
                latitude=latitude,
                longitude=longitude,
                confidence=request.data.get('confidence', 0.92),
                status='OPEN',
                description=request.data.get('description', f'{incident_type} triggered by edge device')
            )

        return Response({
            'success': True,
            'message': 'Edge incident processed',
            'incident_id': incident.incident_id
        }, status=status.HTTP_201_CREATED)
