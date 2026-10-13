from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import TrackedVehicle, VehicleDetection, ANPRDetection
from .serializers import TrackedVehicleSerializer, VehicleDetectionSerializer, ANPRDetectionSerializer
from .services import VehicleTrackingService

class VehicleListView(generics.ListAPIView):
    queryset = TrackedVehicle.objects.all()
    serializer_class = TrackedVehicleSerializer
    permission_classes = [permissions.IsAuthenticated]


class VehicleDetailView(generics.RetrieveAPIView):
    queryset = TrackedVehicle.objects.all()
    serializer_class = TrackedVehicleSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


class VehicleSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter('registration', description='Vehicle registration number e.g. TN19AZ4821'),
        ]
    )
    def get(self, request):
        reg = request.query_params.get('registration', '').replace(' ', '').upper()
        if not reg:
            return Response({'success': False, 'message': 'registration parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        vehicle = TrackedVehicle.objects.filter(registration_number__icontains=reg).first()
        if not vehicle:
            return Response({'success': False, 'message': f'Vehicle {reg} not found'}, status=status.HTTP_404_NOT_FOUND)

        route_data = VehicleTrackingService.get_vehicle_route(vehicle)
        return Response({
            'success': True,
            'vehicle': TrackedVehicleSerializer(vehicle).data,
            'route': route_data['coordinates'],
            'sightings': route_data['sightings']
        }, status=status.HTTP_200_OK)


class VehicleDetectionsView(generics.ListAPIView):
    serializer_class = VehicleDetectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        vehicle_id = self.kwargs.get('id')
        return VehicleDetection.objects.filter(vehicle_id=vehicle_id)


class VehicleRouteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):
        vehicle = get_object_or_404(TrackedVehicle, id=id)
        route_data = VehicleTrackingService.get_vehicle_route(vehicle)
        return Response(route_data, status=status.HTTP_200_OK)
