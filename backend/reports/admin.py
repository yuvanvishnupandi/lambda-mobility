from django.contrib import admin
from .models import DailyReport

@admin.register(DailyReport)
class DailyReportAdmin(admin.ModelAdmin):
    list_display = ['report_date', 'total_buses', 'total_detections', 'road_hazards', 'incidents', 'average_confidence', 'generated_at']
    list_filter = ['report_date']
    search_fields = ['report_date', 'summary_text']
