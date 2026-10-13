from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Detection
from .serializers import DetectionSerializer, DetectionCreateSerializer
from .services import DetectionService
from fleet.models import Bus

class DetectionListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter('detection_type', description='Filter by detection type (e.g. POTHOLE, WATERLOGGING)'),
            OpenApiParameter('severity', description='Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)'),
            OpenApiParameter('bus', description='Filter by bus ID (e.g. BUS-104)'),
            OpenApiParameter('confidence', description='Minimum confidence (0.0 to 1.0)'),
            OpenApiParameter('status', description='Filter by status'),
            OpenApiParameter('location', description='Search by location name'),
            OpenApiParameter('date', description='Filter by date YYYY-MM-DD'),
        ],
        responses={200: DetectionSerializer(many=True)}
    )
    def get(self, request):
        qs = Detection.objects.select_related('bus').all()

        detection_type = request.query_params.get('detection_type') or request.query_params.get('type')
        severity = request.query_params.get('severity')
        bus_id = request.query_params.get('bus') or request.query_params.get('busId')
        confidence = request.query_params.get('confidence')
        status_filter = request.query_params.get('status')
        location = request.query_params.get('location')
        date = request.query_params.get('date')

        if detection_type:
            qs = qs.filter(detection_type__iexact=detection_type)
        if severity:
            qs = qs.filter(severity__iexact=severity)
        if bus_id:
            qs = qs.filter(bus__bus_id__iexact=bus_id)
        if confidence:
            try:
                qs = qs.filter(confidence__gte=float(confidence))
            except ValueError:
                pass
        if status_filter:
            qs = qs.filter(status__iexact=status_filter)
        if location:
            qs = qs.filter(location_name__icontains=location)
        if date:
            qs = qs.filter(timestamp__date=date)

        from common.pagination import StandardResultsSetPagination
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = DetectionSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(request=DetectionCreateSerializer, responses={201: DetectionSerializer})
    def post(self, request):
        serializer = DetectionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        bus = get_object_or_404(Bus, bus_id=data['bus_id'])
        detection = DetectionService.process_detection(
            bus=bus,
            detection_type=data['detection_type'],
            confidence=data['confidence'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            timestamp=data.get('timestamp'),
            frame_reference=data.get('frame_reference'),
            metadata=data.get('metadata', {})
        )

        return Response(DetectionSerializer(detection).data, status=status.HTTP_201_CREATED)


class DetectionDetailView(generics.RetrieveAPIView):
    queryset = Detection.objects.select_related('bus').all()
    serializer_class = DetectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        lookup = self.kwargs.get('id')
        if str(lookup).isdigit():
            return get_object_or_404(Detection, id=int(lookup))
        return get_object_or_404(Detection, detection_id=lookup)


# Edge API for bus camera detection ingestion
class EdgeDetectionView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=DetectionCreateSerializer)
    def post(self, request):
        serializer = DetectionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            bus = Bus.objects.get(bus_id=data['bus_id'])
        except Bus.DoesNotExist:
            return Response({'success': False, 'message': f"Unknown bus {data['bus_id']}"}, status=status.HTTP_404_NOT_FOUND)

        detection = DetectionService.process_detection(
            bus=bus,
            detection_type=data['detection_type'],
            confidence=data['confidence'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            timestamp=data.get('timestamp'),
            frame_reference=data.get('frame_reference'),
            metadata=data.get('metadata', {})
        )
        return Response({
            'success': True,
            'message': 'Detection processed',
            'detection_id': detection.detection_id
        }, status=status.HTTP_201_CREATED)
