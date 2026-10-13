from django.db import models
from django.utils import timezone

class DailyReport(models.Model):
    report_date = models.DateField(unique=True, db_index=True)
    total_buses = models.IntegerField(default=0)
    total_detections = models.IntegerField(default=0)
    road_hazards = models.IntegerField(default=0)
    traffic_events = models.IntegerField(default=0)
    incidents = models.IntegerField(default=0)
    critical_incidents = models.IntegerField(default=0)
    average_confidence = models.FloatField(default=94.5)
    summary_text = models.TextField(blank=True, null=True)
    report_data = models.JSONField(default=dict, blank=True)
    generated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-report_date']

    def __str__(self):
        return f"Daily Urban Intelligence Report - {self.report_date}"
