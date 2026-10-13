import uuid
from django.db import models
from django.utils import timezone

class TransportAgency(models.Model):
    """Transport authority or operator in Ahmedabad."""
    code = models.CharField(max_length=20, unique=True, db_index=True) # e.g., GMRC, BRTS, AMTS, PEDESTRIAN
    name = models.CharField(max_length=100) # e.g. Gujarat Metro Rail Corporation
    full_name = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    helpline = models.CharField(max_length=50, blank=True)
    fare_policy = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Transport Agencies'
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class TransportMode(models.Model):
    """Mode of transport: METRO, BRTS, AMTS, GANDHINAGAR_ELECTRIC_BUS, RAIL, BUS, WALK."""
    MODE_CHOICES = [
        ('METRO', 'Ahmedabad/Gandhinagar Metro (GMRC)'),
        ('BRTS', 'Janmarg BRTS'),
        ('AMTS', 'AMTS City Bus'),
        ('GANDHINAGAR_ELECTRIC_BUS', 'Gandhinagar Electric Bus (GGTSL)'),
        ('RAIL', 'Indian Railways Intercity'),
        ('BUS', 'GIFT Shuttle / Regional Bus / GSRTC'),
        ('WALK', 'Pedestrian Walking'),
    ]
    code = models.CharField(max_length=30, choices=MODE_CHOICES, unique=True)
    name = models.CharField(max_length=50)
    icon = models.CharField(max_length=50, default='bus')
    color = models.CharField(max_length=20, default='#2563EB')
    average_speed_kmh = models.FloatField(default=25.0)
    boarding_time_mins = models.IntegerField(default=2)

    def __str__(self):
        return self.name


class Stop(models.Model):
    """Bus stop, Metro station, or Rail station across Ahmedabad, Gandhinagar & GIFT City."""
    CITY_CHOICES = [
        ('AHMEDABAD', 'Ahmedabad'),
        ('GANDHINAGAR', 'Gandhinagar'),
        ('GIFT_CITY', 'GIFT City'),
    ]
    stop_id = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    name_gu = models.CharField(max_length=255, blank=True) # Gujarati translation
    name_hi = models.CharField(max_length=255, blank=True) # Hindi translation
    code = models.CharField(max_length=30, blank=True)
    city = models.CharField(max_length=50, choices=CITY_CHOICES, default='AHMEDABAD', db_index=True)
    agency = models.ForeignKey(TransportAgency, on_delete=models.CASCADE, related_name='stops')
    mode = models.CharField(max_length=30, choices=TransportMode.MODE_CHOICES, db_index=True)
    latitude = models.FloatField(db_index=True)
    longitude = models.FloatField(db_index=True)
    zone = models.CharField(max_length=50, blank=True)
    is_interchange = models.BooleanField(default=False, db_index=True)
    wheelchair_accessible = models.BooleanField(default=True)
    has_elevator = models.BooleanField(default=False)
    has_escalator = models.BooleanField(default=False)
    has_parking = models.BooleanField(default=False)
    has_restroom = models.BooleanField(default=False)
    platform_info = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['mode', 'is_interchange']),
            models.Index(fields=['city', 'mode']),
        ]

    def __str__(self):
        return f"{self.name} ({self.mode})"

    @property
    def coordinates(self):
        return [self.latitude, self.longitude]


class Route(models.Model):
    """Transit route line (e.g. Metro Red Line, BRTS Route 1D, GGTSL E-1, AMTS 125)."""
    route_id = models.CharField(max_length=50, unique=True, db_index=True)
    route_number = models.CharField(max_length=50, db_index=True) # e.g. EW-Line, 1D, E-1, 125
    route_name = models.CharField(max_length=255) # e.g. Mahatma Mandir to GIFT City
    agency = models.ForeignKey(TransportAgency, on_delete=models.CASCADE, related_name='routes')
    mode = models.CharField(max_length=30, choices=TransportMode.MODE_CHOICES, db_index=True)
    color = models.CharField(max_length=20, default='#2563EB')
    text_color = models.CharField(max_length=20, default='#FFFFFF')
    is_circular = models.BooleanField(default=False)
    is_electric = models.BooleanField(default=False, db_index=True)
    headway_peak_mins = models.IntegerField(default=6) # frequency during rush hours
    headway_offpeak_mins = models.IntegerField(default=12) # frequency off peak
    first_trip_time = models.CharField(max_length=10, default='06:20')
    last_trip_time = models.CharField(max_length=10, default='22:00')
    average_speed_kmh = models.FloatField(default=30.0)
    reliability_score = models.FloatField(default=0.95) # 0.0 to 1.0
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['mode', 'route_number']
        indexes = [
            models.Index(fields=['mode', 'is_active']),
            models.Index(fields=['is_electric']),
        ]

    def __str__(self):
        return f"{self.mode} {self.route_number}: {self.route_name}"


class RouteStop(models.Model):
    """Ordered stop along a transit route."""
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='route_stops')
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='route_stops')
    sequence = models.IntegerField()
    distance_from_start_km = models.FloatField(default=0.0)
    travel_time_mins = models.FloatField(default=2.0) # time from previous stop
    is_major_stop = models.BooleanField(default=False)

    class Meta:
        ordering = ['route', 'sequence']
        unique_together = ('route', 'sequence')
        indexes = [
            models.Index(fields=['route', 'stop']),
        ]

    def __str__(self):
        return f"{self.route.route_number} - Stop #{self.sequence}: {self.stop.name}"


class Trip(models.Model):
    """Scheduled transit trip along a route with specific timetable."""
    trip_id = models.CharField(max_length=100, unique=True, db_index=True)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='trips')
    service_id = models.CharField(max_length=50, default='DAILY') # DAILY, WEEKDAY, WEEKEND
    headsign = models.CharField(max_length=255, blank=True)
    direction = models.IntegerField(default=0) # 0 = Outbound, 1 = Inbound
    departure_time_start = models.CharField(max_length=10) # e.g. "08:15"
    arrival_time_end = models.CharField(max_length=10) # e.g. "09:05"
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['departure_time_start']
        indexes = [
            models.Index(fields=['route', 'service_id']),
            models.Index(fields=['departure_time_start']),
        ]

    def __str__(self):
        return f"Trip {self.trip_id} ({self.route.route_number} @ {self.departure_time_start})"


class TripStopTime(models.Model):
    """Specific arrival and departure time at each stop for a trip."""
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='stop_times')
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='trip_stop_times')
    stop_sequence = models.IntegerField()
    arrival_time = models.CharField(max_length=10) # e.g. "08:24"
    departure_time = models.CharField(max_length=10) # e.g. "08:25"
    pickup_type = models.IntegerField(default=0)
    drop_off_type = models.IntegerField(default=0)

    class Meta:
        ordering = ['trip', 'stop_sequence']
        unique_together = ('trip', 'stop_sequence')
        indexes = [
            models.Index(fields=['stop', 'departure_time']),
        ]

    def __str__(self):
        return f"{self.trip.trip_id} -> Stop #{self.stop_sequence}: {self.stop.name} ({self.departure_time})"


class Transfer(models.Model):
    """Transfer or walking connection between stations / stops."""
    TRANSFER_TYPE_CHOICES = [
        ('METRO_INTERCHANGE', 'Metro to Metro (Platform/Concourse)'),
        ('METRO_BRTS', 'Metro to BRTS Walking Transfer'),
        ('METRO_AMTS', 'Metro to AMTS Walking Transfer'),
        ('METRO_ELECTRIC_BUS', 'Metro to Gandhinagar Electric Bus Transfer'),
        ('BRTS_AMTS', 'BRTS to AMTS Walking Transfer'),
        ('BRTS_BRTS', 'BRTS Corridor Transfer'),
        ('BRTS_ELECTRIC_BUS', 'BRTS to Gandhinagar Electric Bus Transfer'),
        ('AMTS_ELECTRIC_BUS', 'AMTS to Gandhinagar Electric Bus Transfer'),
        ('ELECTRIC_BUS_ELECTRIC_BUS', 'Gandhinagar Electric Bus Corridor Transfer'),
        ('RAIL_TRANSIT', 'Indian Railways to Urban Transit'),
        ('METRO_SHUTTLE', 'Metro to Gandhinagar/GIFT Shuttle'),
        ('GIFT_SHUTTLE_TRANSFER', 'GIFT City Multimodal Concourse Transfer'),
        ('PEDESTRIAN_LINK', 'Pedestrian Walkway'),
    ]
    from_stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='transfers_from')
    to_stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='transfers_to')
    transfer_type = models.CharField(max_length=35, choices=TRANSFER_TYPE_CHOICES, default='PEDESTRIAN_LINK')
    walking_distance_m = models.IntegerField(default=150)
    walking_time_mins = models.FloatField(default=3.0)
    transfer_penalty_mins = models.FloatField(default=2.0) # additional friction / buffer
    instructions = models.TextField(blank=True) # e.g. "Take concourse escalator to Platform 2 toward Thaltej"
    from_platform = models.CharField(max_length=50, blank=True)
    to_platform = models.CharField(max_length=50, blank=True)
    stand_number = models.CharField(max_length=50, blank=True)
    transfer_buffer_mins = models.FloatField(default=3.0)
    is_step_free = models.BooleanField(default=True)
    is_sheltered = models.BooleanField(default=True)

    class Meta:
        unique_together = ('from_stop', 'to_stop')

    def __str__(self):
        return f"Transfer: {self.from_stop.name} -> {self.to_stop.name} ({self.walking_time_mins}m)"


class Vehicle(models.Model):
    """Bus, Electric Bus or Metro train unit."""
    VEHICLE_TYPE_CHOICES = [
        ('9M_ELECTRIC_AC', '9m Low-Floor AC Electric Bus (PM-eBus Sewa)'),
        ('12M_ELECTRIC_AC', '12m Low-Floor AC Electric Bus'),
        ('GIFT_AUTONOMOUS_EV', 'GIFT City Autonomous EV Shuttle'),
        ('METRO_RAKE', 'GMRC 3-Car Metro Train Rake'),
        ('BRTS_BUS', 'Janmarg Euro-VI / EV Bus'),
        ('AMTS_BUS', 'AMTS Midi/Standard City Bus'),
        ('RAIL_TRAIN', 'Indian Railways Intercity/MEMU Train'),
    ]
    CHARGING_STATUS_CHOICES = [
        ('CHARGING', 'Charging at Depot Hub'),
        ('DISCHARGING', 'In Service / Active Discharging'),
        ('STANDBY', 'Standby at Terminal'),
        ('OFFLINE', 'Depot Standby / Offline'),
    ]

    vehicle_id = models.CharField(max_length=50, unique=True, db_index=True) # e.g. GGTSL-EB-101, METRO-TS-04, BRTS-104
    registration = models.CharField(max_length=50, blank=True) # e.g. GJ-18-EV-1001
    registration_number = models.CharField(max_length=50, blank=True)
    fleet_number = models.CharField(max_length=50, blank=True, db_index=True)
    agency = models.ForeignKey(TransportAgency, on_delete=models.CASCADE, related_name='vehicles', db_index=True)
    operator = models.CharField(max_length=150, blank=True)
    mode = models.CharField(max_length=30, choices=TransportMode.MODE_CHOICES, db_index=True)
    vehicle_type = models.CharField(max_length=30, choices=VEHICLE_TYPE_CHOICES, default='9M_ELECTRIC_AC')
    current_route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicles')
    capacity = models.IntegerField(default=45)
    vehicle_capacity = models.IntegerField(default=45)
    is_electric = models.BooleanField(default=True, db_index=True)
    battery_status = models.IntegerField(null=True, blank=True, help_text="Battery state of charge 0-100%")
    charging_status = models.CharField(max_length=20, choices=CHARGING_STATUS_CHOICES, default='DISCHARGING')
    air_conditioned = models.BooleanField(default=True)
    accessible = models.BooleanField(default=True)
    is_wheelchair_accessible = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['mode', 'is_electric']),
            models.Index(fields=['agency', 'is_active']),
        ]

    def __str__(self):
        return f"{self.vehicle_id} ({self.mode} - {self.operator or self.agency.name})"


class VehiclePosition(models.Model):
    """Live or simulated GPS telemetry for transit vehicles."""
    STATUS_CHOICES = [
        ('ON_TIME', 'On Time'),
        ('SLIGHT_DELAY', 'Slight Delay (+1-4m)'),
        ('DELAYED', 'Delayed (+5m+)'),
        ('AHEAD', 'Ahead of Schedule'),
        ('DISRUPTED', 'Disrupted'),
    ]
    TELEMETRY_CHOICES = [
        ('REAL_TIME', 'Live GPS Feed'),
        ('ESTIMATED', 'Estimated / Projected'),
        ('SCHEDULED', 'Scheduled Timetable'),
        ('UNKNOWN', 'Telemetry Unknown'),
    ]

    vehicle = models.OneToOneField(Vehicle, on_delete=models.CASCADE, related_name='live_position')
    latitude = models.FloatField(db_index=True)
    longitude = models.FloatField(db_index=True)
    speed_kmh = models.FloatField(default=28.0)
    heading = models.FloatField(default=0.0)
    current_location_name = models.CharField(max_length=255, default='Ashram Road')
    next_stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, blank=True, related_name='approaching_vehicles')
    eta_next_stop_seconds = models.IntegerField(default=180)
    delay_minutes = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ON_TIME')
    telemetry_type = models.CharField(max_length=20, choices=TELEMETRY_CHOICES, default='SCHEDULED')
    is_live = models.BooleanField(default=False) # True = verified live feed, False = scheduled / demo
    data_source = models.CharField(max_length=50, default='DEMO_SIMULATION')
    last_updated = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['-last_updated']
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['last_updated']),
        ]

    def __str__(self):
        return f"{self.vehicle.vehicle_id} @ {self.current_location_name} (Delay: {self.delay_minutes}m)"

    @property
    def coordinates(self):
        return [self.latitude, self.longitude]


class FareRule(models.Model):
    """Fare calculation matrix for Metro, BRTS, AMTS, and Gandhinagar Electric Bus."""
    agency = models.ForeignKey(TransportAgency, on_delete=models.CASCADE, related_name='fare_rules')
    mode = models.CharField(max_length=30, choices=TransportMode.MODE_CHOICES)
    base_fare = models.FloatField(default=5.0) # min fare
    base_distance_km = models.FloatField(default=2.0)
    per_km_rate = models.FloatField(default=1.5)
    max_fare = models.FloatField(default=30.0)
    fare_brackets = models.JSONField(default=list, blank=True) # e.g. [{"km": 3, "fare": 5}, {"km": 6, "fare": 10}...]
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Fare Rule: {self.mode} (Base ₹{self.base_fare})"


class ServiceAlert(models.Model):
    """Disruptions, delays, maintenance notices."""
    SEVERITY_CHOICES = [
        ('INFO', 'Informational'),
        ('WARNING', 'Warning / Moderate Delay'),
        ('CRITICAL', 'Critical Disruption / Suspension'),
    ]
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('RESOLVED', 'Resolved'),
        ('UPCOMING', 'Upcoming'),
    ]
    ALERT_TYPE_CHOICES = [
        ('ROUTE_DISRUPTION', 'Route Disruption'),
        ('VEHICLE_BREAKDOWN', 'Vehicle Breakdown'),
        ('TRAFFIC_DELAY', 'Traffic Delay'),
        ('TEMPORARY_CLOSURE', 'Temporary Road/Station Closure'),
        ('ROUTE_DIVERSION', 'Route Diversion'),
        ('CHARGING_DEPOT_ISSUE', 'Charging / Depot Issue'),
        ('WEATHER_DISRUPTION', 'Weather Disruption'),
        ('GENERAL_NOTICE', 'General Notice'),
    ]

    alert_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    agency = models.ForeignKey(TransportAgency, on_delete=models.CASCADE, related_name='alerts')
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name='alerts')
    affected_stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, blank=True, related_name='alerts')
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPE_CHOICES, default='GENERAL_NOTICE')
    title = models.CharField(max_length=255)
    description = models.TextField()
    alternative_advice = models.TextField(blank=True) # e.g. "Take Metro Red Line + GIFT Shuttle"
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='WARNING')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    delay_impact_mins = models.IntegerField(default=0)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-valid_from']
        indexes = [
            models.Index(fields=['status', 'severity']),
            models.Index(fields=['valid_from']),
        ]

    def __str__(self):
        return f"[{self.severity}] {self.title}"


class DataSource(models.Model):
    """Status & sync tracking for public transport data feeds & PM-eBus Sewa allocation."""
    source_name = models.CharField(max_length=100, unique=True) # GGTSL Electric Bus ITMS, GMRC Metro, Janmarg BRTS, AMTS Feed
    provider_type = models.CharField(max_length=50) # GGTSL_ITMS, METRO_GMRC, BRTS_JANMARG, AMTS_MUNICIPAL, GIFT_TRANSIT
    status = models.CharField(max_length=20, default='OPERATIONAL') # OPERATIONAL, DEGRADED, SYNCING, ERROR
    last_sync = models.DateTimeField(default=timezone.now)
    records_count = models.IntegerField(default=0)
    is_live_telemetry = models.BooleanField(default=False)
    freshness_seconds = models.IntegerField(default=30)
    error_message = models.TextField(blank=True, null=True)

    # PM-eBus Sewa / Fleet Dynamics
    fleet_total = models.IntegerField(default=0, help_text="Total sanctioned fleet allocation")
    fleet_deployed = models.IntegerField(default=0, help_text="Fleet deployed on ground")
    fleet_active = models.IntegerField(default=0, help_text="Buses currently active in service")
    last_updated_feed = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.source_name} ({self.status})"


class DataSyncLog(models.Model):
    """Audit log for automated data synchronization."""
    source = models.ForeignKey(DataSource, on_delete=models.CASCADE, related_name='sync_logs')
    timestamp = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20) # SUCCESS, FAILED, PARTIAL
    records_processed = models.IntegerField(default=0)
    records_updated = models.IntegerField(default=0)
    duration_ms = models.IntegerField(default=0)
    details = models.TextField(blank=True)
    errors = models.TextField(blank=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['status']),
        ]


class PlaceLandmark(models.Model):
    """Ahmedabad, Gandhinagar & GIFT City points of interest, railway stations, universities, hospitals, tech parks."""
    CITY_CHOICES = [
        ('AHMEDABAD', 'Ahmedabad'),
        ('GANDHINAGAR', 'Gandhinagar'),
        ('GIFT_CITY', 'GIFT City'),
    ]
    CATEGORY_CHOICES = [
        ('RAILWAY_STATION', 'Railway Station'),
        ('AIRPORT', 'Airport Terminal'),
        ('METRO_STATION', 'Metro Station'),
        ('BRTS_HUB', 'BRTS Terminal / Hub'),
        ('ELECTRIC_BUS_HUB', 'Electric Bus Terminal / Depot'),
        ('EDUCATION', 'University / College'),
        ('COMMERCIAL', 'Commercial / Tech Park'),
        ('HOSPITAL', 'Hospital / Medical'),
        ('GOVERNMENT', 'Government / Secretariat / Bhavan'),
        ('TOURIST', 'Tourist Landmark / Temple'),
        ('RESIDENTIAL', 'Residential Suburb / Sector'),
    ]
    name = models.CharField(max_length=255, db_index=True)
    name_gu = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=50, choices=CITY_CHOICES, default='AHMEDABAD', db_index=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='COMMERCIAL')
    address = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    nearest_metro_stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, blank=True, related_name='landmarks_metro')
    nearest_brts_stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, blank=True, related_name='landmarks_brts')
    nearest_electric_bus_stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, blank=True, related_name='landmarks_electric_bus')
    is_popular = models.BooleanField(default=False)
    aliases = models.JSONField(default=list, blank=True) # search aliases

    class Meta:
        ordering = ['-is_popular', 'name']
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['city', 'category']),
        ]

    def __str__(self):
        return f"{self.name} ({self.city} - {self.category})"

