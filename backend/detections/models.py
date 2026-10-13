import uuid
from django.db import models
from django.utils import timezone
from fleet.models import Bus

class Detection(models.Model):
    DETECTION_TYPE_CHOICES = [
        ('POTHOLE', 'Pothole'),
        ('ROAD_DAMAGE', 'Road Damage'),
        ('WATERLOGGING', 'Waterlogging'),
        ('MISSING_DIVIDER', 'Missing Divider'),
        ('MISSING_ZEBRA_CROSSING', 'Missing Zebra Crossing'),
        ('TRAFFIC_SIGN', 'Traffic Sign Issue'),
        ('VEHICLE', 'Vehicle'),
        ('PEDESTRIAN', 'Pedestrian'),
        ('SCHOOL_CHILD', 'School Child Risk'),
        ('RASH_DRIVING', 'Rash Driving'),
        ('HIT_AND_RUN', 'Hit and Run'),
    ]

    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('VERIFIED', 'Verified'),
        ('DISMISSED', 'Dismissed'),
        ('PROCESSED', 'Processed into Hazard/Incident'),
    ]

    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    detection_id = models.CharField(max_length=100, unique=True, db_index=True)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='detections')
    detection_type = models.CharField(max_length=50, choices=DETECTION_TYPE_CHOICES, db_index=True)
    confidence = models.FloatField(help_text="Confidence between 0.0 and 1.0", db_index=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='MEDIUM', db_index=True)
    latitude = models.FloatField(db_index=True)
    longitude = models.FloatField(db_index=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    frame_reference = models.CharField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='NEW', db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    location_name = models.CharField(max_length=255, default='Ahmedabad Road', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['detection_type', '-timestamp']),
            models.Index(fields=['bus', '-timestamp']),
        ]

    def save(self, *args, **kwargs):
        if not self.detection_id:
            self.detection_id = f"DET-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.detection_id}: {self.detection_type} ({self.confidence:.2f}) by {self.bus.bus_id}"

    @property
    def gps(self):
        return [self.latitude, self.longitude]
