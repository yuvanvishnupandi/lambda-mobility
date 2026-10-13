from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, default='Ahmedabad')
    state = models.CharField(max_length=100, default='Gujarat')
    latitude = models.FloatField(db_index=True)
    longitude = models.FloatField(db_index=True)
    landmark = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name}, {self.city}"

    @property
    def gps(self):
        return [self.latitude, self.longitude]


class SchoolZone(models.Model):
    RISK_LEVEL_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    name = models.CharField(max_length=255)
    latitude = models.FloatField(db_index=True)
    longitude = models.FloatField(db_index=True)
    radius = models.FloatField(default=300.0, help_text="Radius in meters")
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, default='MEDIUM')
    active = models.BooleanField(default=True)
    school_type = models.CharField(max_length=100, blank=True, default='Primary & Secondary')
    student_count_estimate = models.IntegerField(default=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (Risk: {self.risk_level})"

    @property
    def gps(self):
        return [self.latitude, self.longitude]
