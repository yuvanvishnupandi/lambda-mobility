from rest_framework import serializers
from .models import DailyReport

class DailyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyReport
        fields = [
            'id', 'report_date', 'total_buses', 'total_detections',
            'road_hazards', 'traffic_events', 'incidents',
            'critical_incidents', 'average_confidence', 'summary_text',
            'report_data', 'generated_at'
        ]
