from django.db import models
from django.utils import timezone
from fleet.models import Bus
from incidents.models import Incident

class Alert(models.Model):
    SEVERITY_CHOICES = [
        ('INFO', 'Informational'),
        ('LOW', 'Low Priority'),
        ('MEDIUM', 'Medium Priority'),
        ('HIGH', 'High Priority'),
        ('CRITICAL', 'Critical Alert'),
    ]

    alert_type = models.CharField(max_length=50, db_index=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='MEDIUM', db_index=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    location = models.CharField(max_length=255, db_index=True)
    latitude = models.FloatField(default=23.0225)
    longitude = models.FloatField(default=72.5714)
    confidence = models.FloatField(default=0.95)
    bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True, related_name='alerts')
    incident = models.ForeignKey(Incident, on_delete=models.SET_NULL, null=True, blank=True, related_name='alerts')
    is_read = models.BooleanField(default=False, db_index=True)
    acknowledged = models.BooleanField(default=False)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['severity', 'is_read', '-created_at']),
        ]

    def __str__(self):
        return f"[{self.severity}] {self.title} @ {self.location}"

    @property
    def gps(self):
        return [self.latitude, self.longitude]
