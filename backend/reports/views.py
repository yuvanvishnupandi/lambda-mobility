from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import DailyReport
from .serializers import DailyReportSerializer
from .services import ReportService

class ReportListView(generics.ListAPIView):
    queryset = DailyReport.objects.all()
    serializer_class = DailyReportSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReportDetailView(generics.RetrieveAPIView):
    queryset = DailyReport.objects.all()
    serializer_class = DailyReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


class ReportGenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        date_str = request.data.get('date')
        report_date = None
        if date_str:
            from datetime import datetime
            try:
                report_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'success': False, 'message': 'Date must be in YYYY-MM-DD format'}, status=status.HTTP_400_BAD_REQUEST)

        report = ReportService.generate_daily_report(report_date=report_date)
        return Response({
            'success': True,
            'message': f'Report generated for {report.report_date}',
            'report': DailyReportSerializer(report).data
        }, status=status.HTTP_201_CREATED)
