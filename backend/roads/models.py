from django.db import models
from django.utils import timezone
from fleet.models import Bus

class RoadHazard(models.Model):
    HAZARD_TYPE_CHOICES = [
        ('POTHOLE', 'Pothole'),
        ('ROAD_DAMAGE', 'Road Surface Damage'),
        ('WATERLOGGING', 'Waterlogging'),
        ('MISSING_DIVIDER', 'Missing Lane Divider'),
        ('MISSING_ZEBRA_CROSSING', 'Missing Zebra Crossing'),
        ('UNMARKED_SPEEDBUMP', 'Unmarked Speed Bump'),
    ]

    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending Inspection'),
        ('VERIFIED', 'Verified'),
        ('IN_PROGRESS', 'Repair In Progress'),
        ('RESOLVED', 'Resolved'),
    ]

    road_name = models.CharField(max_length=255, db_index=True)
    hazard_type = models.CharField(max_length=50, choices=HAZARD_TYPE_CHOICES, db_index=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='MEDIUM', db_index=True)
    confidence = models.FloatField(default=0.90)
    latitude = models.FloatField(db_index=True)
    longitude = models.FloatField(db_index=True)
    detected_by_bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True, related_name='detected_hazards')
    first_detected = models.DateTimeField(default=timezone.now)
    last_detected = models.DateTimeField(default=timezone.now)
    occurrence_count = models.IntegerField(default=1)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    maintenance_priority = models.IntegerField(default=50, help_text="Priority score 1-100")
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-maintenance_priority', '-last_detected']
        indexes = [
            models.Index(fields=['road_name', 'hazard_type']),
            models.Index(fields=['severity', 'status']),
        ]

    def __str__(self):
        return f"{self.hazard_type} on {self.road_name} ({self.severity})"

    @property
    def gps(self):
        return [self.latitude, self.longitude]


class RoadSegment(models.Model):
    road_name = models.CharField(max_length=255)
    segment_code = models.CharField(max_length=50, unique=True)
    start_latitude = models.FloatField()
    start_longitude = models.FloatField()
    end_latitude = models.FloatField()
    end_longitude = models.FloatField()
    condition_score = models.FloatField(default=75.0, help_text="Score 0 (worst) to 100 (best)")
    is_critical = models.BooleanField(default=False, db_index=True)
    last_surveyed = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.road_name} [{self.segment_code}]"


class MaintenanceTask(models.Model):
    hazard = models.ForeignKey(RoadHazard, on_delete=models.CASCADE, related_name='tasks')
    task_number = models.CharField(max_length=50, unique=True)
    assigned_team = models.CharField(max_length=150, default='Ahmedabad Municipal Corporation PWD')
    scheduled_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default='PENDING')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Task {self.task_number} for {self.hazard.hazard_type}"
