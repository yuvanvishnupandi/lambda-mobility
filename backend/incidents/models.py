import uuid
from django.db import models
from django.utils import timezone
from fleet.models import Bus
from accounts.models import User
from vehicles.models import TrackedVehicle

class Incident(models.Model):
    INCIDENT_TYPE_CHOICES = [
        ('HIT_AND_RUN', 'Hit and Run'),
        ('RASH_DRIVING', 'Rash Driving'),
        ('PEDESTRIAN_RISK', 'Pedestrian Risk'),
        ('ACCIDENT', 'Traffic Accident'),
        ('ROAD_HAZARD', 'Critical Road Hazard'),
        ('WATERLOGGING', 'Severe Waterlogging'),
        ('OTHER', 'Other Urban Safety Incident'),
    ]

    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('INVESTIGATING', 'Investigating'),
        ('ASSIGNED', 'Assigned'),
        ('RESOLVED', 'Resolved'),
        ('DISMISSED', 'Dismissed'),
    ]

    incident_id = models.CharField(max_length=50, unique=True, db_index=True)
    incident_type = models.CharField(max_length=50, choices=INCIDENT_TYPE_CHOICES, db_index=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='HIGH', db_index=True)
    bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidents')
    location = models.CharField(max_length=255, db_index=True)
    latitude = models.FloatField(db_index=True)
    longitude = models.FloatField(db_index=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    confidence = models.FloatField(default=0.95)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN', db_index=True)
    description = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_incidents')
    assigned_team = models.CharField(max_length=150, default='Ahmedabad Traffic Police QRT')
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True, null=True)

    # Associated vehicle / ANPR / evidence
    tracked_vehicle = models.ForeignKey(TrackedVehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidents')
    vehicle_info = models.JSONField(default=dict, blank=True)
    evidence_frame = models.CharField(max_length=500, blank=True, null=True)
    timeline = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['incident_type', '-timestamp']),
            models.Index(fields=['severity', 'status']),
        ]

    def save(self, *args, **kwargs):
        if not self.incident_id:
            self.incident_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.incident_id} [{self.incident_type}] - {self.severity}"

    @property
    def gps(self):
        return [self.latitude, self.longitude]
