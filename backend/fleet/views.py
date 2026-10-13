from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Bus, BusRoute, BusCamera, BusLocationHistory
from .serializers import (
    BusSerializer, BusRouteSerializer, BusCameraSerializer,
    LocationUpdateSerializer, BusLocationHistorySerializer
)
from .services import FleetService

class BusListCreateView(generics.ListCreateAPIView):
    serializer_class = BusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Bus.objects.select_related('route').prefetch_related('cameras').all()
        status_param = self.request.query_params.get('status')
        route_param = self.request.query_params.get('route')
        search_param = self.request.query_params.get('search')

        if status_param:
            qs = qs.filter(status__iexact=status_param)
        if route_param:
            qs = qs.filter(route__route_number__icontains=route_param)
        if search_param:
            qs = qs.filter(
                models.Q(bus_id__icontains=search_param) |
                models.Q(registration_number__icontains=search_param) |
                models.Q(current_location_name__icontains=search_param)
            )
        return qs

    @extend_schema(
        parameters=[
            OpenApiParameter('status', description='Filter by status (ONLINE, OFFLINE, PROCESSING, MAINTENANCE)'),
            OpenApiParameter('route', description='Filter by route number (e.g. 18)'),
            OpenApiParameter('search', description='Search by bus ID or registration number'),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


from django.db import models

class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.select_related('route').prefetch_related('cameras').all()
    serializer_class = BusSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_object(self):
        lookup = self.kwargs.get('id')
        # Try id or bus_id
        if lookup.isdigit():
            return get_object_or_404(Bus, id=int(lookup))
        return get_object_or_404(Bus, bus_id=lookup)


class RouteListView(generics.ListCreateAPIView):
    queryset = BusRoute.objects.prefetch_related('buses').all()
    serializer_class = BusRouteSerializer
    permission_classes = [permissions.IsAuthenticated]


class BusCamerasView(generics.ListAPIView):
    serializer_class = BusCameraSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        lookup = self.kwargs.get('id')
        if lookup.isdigit():
            bus = get_object_or_404(Bus, id=int(lookup))
        else:
            bus = get_object_or_404(Bus, bus_id=lookup)
        return bus.cameras.all()


class BusLocationUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=LocationUpdateSerializer, responses={200: BusSerializer})
    def post(self, request, id):
        if str(id).isdigit():
            bus = get_object_or_404(Bus, id=int(id))
        else:
            bus = get_object_or_404(Bus, bus_id=id)

        serializer = LocationUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        FleetService.update_bus_location(
            bus=bus,
            latitude=serializer.validated_data['latitude'],
            longitude=serializer.validated_data['longitude'],
            speed=serializer.validated_data.get('speed', 0.0),
            heading=serializer.validated_data.get('heading', 0.0),
            location_name=serializer.validated_data.get('location_name')
        )

        return Response({
            'success': True,
            'message': 'Bus location updated successfully',
            'data': BusSerializer(bus).data
        }, status=status.HTTP_200_OK)


class BusLocationHistoryView(generics.ListAPIView):
    serializer_class = BusLocationHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        lookup = self.kwargs.get('id')
        if str(lookup).isdigit():
            bus = get_object_or_404(Bus, id=int(lookup))
        else:
            bus = get_object_or_404(Bus, bus_id=lookup)
        return bus.location_history.all()[:100]


# Edge APIs
class EdgeHeartbeatView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        bus_id = request.data.get('bus_id')
        if not bus_id:
            return Response({'success': False, 'message': 'bus_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        bus = get_object_or_404(Bus, bus_id=bus_id)
        camera_status = request.data.get('camera_status', {})
        ai_status = request.data.get('ai_status', 'PROCESSING')

        FleetService.update_heartbeat(bus, camera_status=camera_status, ai_status=ai_status)
        return Response({'success': True, 'message': 'Heartbeat acknowledged', 'bus_id': bus.bus_id})


class EdgeLocationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        bus_id = request.data.get('bus_id')
        if not bus_id:
            return Response({'success': False, 'message': 'bus_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        bus = get_object_or_404(Bus, bus_id=bus_id)
        serializer = LocationUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        FleetService.update_bus_location(
            bus=bus,
            latitude=serializer.validated_data['latitude'],
            longitude=serializer.validated_data['longitude'],
            speed=serializer.validated_data.get('speed', 0.0),
            heading=serializer.validated_data.get('heading', 0.0),
            location_name=serializer.validated_data.get('location_name')
        )
        return Response({'success': True, 'message': 'Location received', 'bus_id': bus.bus_id})
