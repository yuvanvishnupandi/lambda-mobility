import time
import random
import threading
from django.utils import timezone
from fleet.models import Bus
from detections.models import Detection
from detections.services import DetectionService
from fleet.services import FleetService
from traffic.models import TrafficObservation

class SimulationEngine:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SimulationEngine, cls).__new__(cls)
                cls._instance.is_running = False
                cls._instance.thread = None
                cls._instance.events_generated = 0
                cls._instance.started_at = None
        return cls._instance

    def start(self):
        with self._lock:
            if self.is_running:
                return False, "Simulation already running"
            self.is_running = True
            self.started_at = timezone.now()
            self.thread = threading.Thread(target=self._run_loop, daemon=True)
            self.thread.start()
            return True, "Simulation started"

    def stop(self):
        with self._lock:
            if not self.is_running:
                return False, "Simulation is not running"
            self.is_running = False
            return True, "Simulation stopped"

    def get_status(self):
        return {
            "is_running": self.is_running,
            "events_generated": self.events_generated,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "uptime_seconds": int((timezone.now() - self.started_at).total_seconds()) if (self.is_running and self.started_at) else 0
        }

    def _run_loop(self):
        ahmedabad_roads = [
            ("SG Highway", 23.0395, 72.5667),
            ("Ashram Road", 23.0225, 72.5714),
            ("Ring Road", 23.0300, 72.5800),
            ("CG Road", 23.0350, 72.5550),
            ("Naroda Road", 23.0600, 72.6300),
            ("Sarkhej Cross Road", 23.0050, 72.5000),
            ("Vastrapur Lake Road", 23.0355, 72.5280)
        ]
        detection_types = [
            ('POTHOLE', 'MEDIUM'),
            ('POTHOLE', 'HIGH'),
            ('ROAD_DAMAGE', 'MEDIUM'),
            ('WATERLOGGING', 'HIGH'),
            ('PEDESTRIAN', 'MEDIUM'),
            ('SCHOOL_CHILD', 'HIGH'),
            ('TRAFFIC_SIGN', 'LOW'),
            ('RASH_DRIVING', 'HIGH')
        ]

        while self.is_running:
            try:
                # 1. Update a random bus location
                buses = list(Bus.objects.filter(status__in=['ONLINE', 'PROCESSING'])[:15])
                if buses:
                    bus = random.choice(buses)
                    road_name, base_lat, base_lng = random.choice(ahmedabad_roads)
                    d_lat = (random.random() - 0.5) * 0.005
                    d_lng = (random.random() - 0.5) * 0.005
                    new_lat = round(base_lat + d_lat, 6)
                    new_lng = round(base_lng + d_lng, 6)
                    new_speed = round(random.uniform(20.0, 55.0), 1)
                    new_heading = round(random.uniform(0.0, 360.0), 1)

                    FleetService.update_bus_location(
                        bus=bus,
                        latitude=new_lat,
                        longitude=new_lng,
                        speed=new_speed,
                        heading=new_heading,
                        location_name=road_name
                    )

                # 2. Periodically generate an AI detection
                if random.random() < 0.6 and buses:
                    bus = random.choice(buses)
                    det_type, severity = random.choice(detection_types)
                    road_name, base_lat, base_lng = random.choice(ahmedabad_roads)
                    confidence = round(random.uniform(0.85, 0.98), 2)

                    DetectionService.process_detection(
                        bus=bus,
                        detection_type=det_type,
                        confidence=confidence,
                        latitude=base_lat + (random.random() - 0.5) * 0.003,
                        longitude=base_lng + (random.random() - 0.5) * 0.003,
                        metadata={'severity': severity, 'road': road_name}
                    )

                # 3. Clean up older simulation records if count exceeds threshold
                if self.events_generated % 50 == 0 and self.events_generated > 0:
                    excess_detections = Detection.objects.count() - 500
                    if excess_detections > 0:
                        old_ids = Detection.objects.order_by('timestamp').values_list('id', flat=True)[:excess_detections]
                        Detection.objects.filter(id__in=list(old_ids)).delete()

                self.events_generated += 1
            except Exception:
                pass

            time.sleep(3.0)
