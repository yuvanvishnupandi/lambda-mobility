import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from accounts.services import AccountService
from fleet.models import BusRoute, Bus, BusCamera, BusLocationHistory
from detections.models import Detection
from roads.models import RoadHazard, RoadSegment, MaintenanceTask
from traffic.models import TrafficObservation
from incidents.models import Incident
from vehicles.models import TrackedVehicle, VehicleDetection, ANPRDetection
from notifications.models import Alert
from common.models import SchoolZone, Location
from reports.models import DailyReport
from incidents.services import IncidentService

class Command(BaseCommand):
    help = 'Seeds realistic Tamil Nadu (Chengalpattu GST Road NH 45) urban sensing demo data for prototype and React frontend'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting Tamil Nadu urban intelligence database seeding...'))

        # 1. Users
        self.stdout.write('Creating default users (admin, operator, analyst, viewer)...')
        AccountService.get_or_create_default_users()

        # 2. Locations and Corridors along Chengalpattu GST Road (NH 45) & Arterials
        tamilnadu_roads = [
            {"name": "GST Road (NH 45)", "start": (12.6939, 79.9757), "end": (12.9249, 80.1200), "code": "GST-NH45"},
            {"name": "Grand Southern Trunk Road", "start": (12.8231, 80.0444), "end": (12.8634, 80.0818), "code": "GST-TRUNK"},
            {"name": "OMR IT Expressway", "start": (12.8250, 80.2180), "end": (13.0067, 80.2025), "code": "OMR-EXP"},
            {"name": "Vandalur-Kelambakkam Road", "start": (12.8885, 80.0815), "end": (12.8300, 80.1500), "code": "VK-RD"},
            {"name": "Chennai Bypass NH 32", "start": (12.9249, 80.1200), "end": (13.0067, 80.2025), "code": "BYPASS-NH32"},
            {"name": "Oragadam Industrial Corridor", "start": (12.8350, 79.9500), "end": (12.7800, 79.9800), "code": "ORG-IND"},
        ]

        for r_info in tamilnadu_roads:
            Location.objects.get_or_create(
                name=r_info["name"],
                defaults={
                    "city": "Chengalpattu",
                    "state": "Tamil Nadu",
                    "latitude": r_info["start"][0],
                    "longitude": r_info["start"][1],
                    "landmark": f"{r_info['name']} Junction"
                }
            )

        # 3. Routes
        self.stdout.write('Creating bus routes...')
        route_configs = [
            ("500A", "GST Road Trunk Corridor", "Chengalpattu Junction Bus Stand", "Tambaram West Bus Terminus"),
            ("70V", "Kilambakkam-CMBT Arterial", "Kilambakkam KCBT Mega Terminal", "CMBT Koyambedu Bus Terminus"),
            ("119", "OMR IT Tech Link", "Guindy Metro Interchange", "Siruseri SIPCOT IT Park Terminal"),
            ("MWC", "Mahindra World City Green Loop", "Paranur Railway Station Intermodal Bay", "Cybervale Tech Concourse"),
            ("202", "Tambaram-Airport Link", "Tambaram Central Station", "Chennai International Airport MAA"),
            ("G18", "GST Southern Sector", "Guduvanchery Bus Stand", "Maraimalai Nagar Industrial Hub"),
        ]
        routes = []
        for num, name, start, end in route_configs:
            route, _ = BusRoute.objects.get_or_create(
                route_number=num,
                defaults={
                    "route_name": name,
                    "start_location": start,
                    "end_location": end,
                    "status": "ACTIVE"
                }
            )
            routes.append(route)

        # 4. Buses (27 buses positioned precisely on Tamil Nadu GST Road corridor centerlines)
        self.stdout.write('Creating 27 buses with real Tamil Nadu road-aligned GPS...')
        bus_specs = [
            ("BUS-104", "TN 19 AZ 1040", routes[0], "ONLINE", 42.0, 12.8231, 80.0444, "GST Road, Potheri SRM Central Junction"),
            ("BUS-087", "TN 19 AZ 0870", routes[1], "ONLINE", 28.0, 12.8465, 80.0612, "GST Road, Guduvanchery Flyover"),
            ("BUS-121", "TN 11 N 1210", routes[2], "ONLINE", 35.0, 12.8634, 80.0818, "GST Road, Kilambakkam KCBT Concourse"),
            ("BUS-156", "TN 19 EV 1560", routes[3], "ONLINE", 22.0, 12.8885, 80.0815, "GST Road, Vandalur Crescent Junction"),
            ("BUS-101", "TN 19 AZ 1010", routes[0], "ONLINE", 38.0, 12.9249, 80.1200, "GST Road, Tambaram Central Terminus"),
            ("BUS-102", "TN 19 AZ 1020", routes[1], "PROCESSING", 31.0, 12.7980, 80.0240, "GST Road, Maraimalai Nagar Industrial Sector"),
            ("BUS-092", "TN 19 AZ 0920", routes[4], "ONLINE", 45.0, 12.7423, 80.0028, "GST Road, Paranur MWC Intermodal Bay"),
            ("BUS-114", "TN 19 AZ 1140", routes[5], "ONLINE", 29.0, 12.6939, 79.9757, "GST Road, Chengalpattu Junction Bus Bay"),
            ("BUS-078", "TN 19 AZ 0780", routes[2], "OFFLINE", 0.0, 12.9380, 80.1300, "GST Road, Tambaram Sanatorium Depot"),
            ("BUS-133", "TN 19 AZ 1330", routes[0], "ONLINE", 40.0, 12.8670, 80.0710, "GST Road, Urapakkam Sector"),
            ("BUS-145", "TN 19 AZ 1450", routes[3], "PROCESSING", 18.0, 12.8120, 80.0350, "GST Road, Kattankulathur Crossing"),
            ("BUS-162", "TN 19 AZ 1620", routes[1], "ONLINE", 33.0, 12.8550, 80.0660, "GST Road, Guduvanchery EB Junction"),
            ("BUS-171", "TN 19 AZ 1710", routes[2], "MAINTENANCE", 0.0, 12.9044, 80.0890, "GST Road, Perungalathur Bypass Hub"),
            ("BUS-180", "TN 19 AZ 1800", routes[5], "ONLINE", 36.0, 12.7800, 80.0150, "GST Road, Singaperumal Koil Junction"),
            ("BUS-195", "TN 19 AZ 1950", routes[4], "ONLINE", 50.0, 12.7150, 79.9890, "GST Road, Chengalpattu Toll Plaza"),
            ("BUS-116", "TN 19 AZ 1160", routes[4], "ONLINE", 25.5, 12.9510, 80.1380, "GST Road, Chromepet MIT Concourse"),
            ("BUS-117", "TN 19 AZ 1170", routes[0], "ONLINE", 41.0, 12.9680, 80.1450, "GST Road, Pallavaram Flyover"),
            ("BUS-118", "TN 19 AZ 1180", routes[2], "ONLINE", 33.5, 12.9941, 80.1709, "GST Road, Chennai Airport MAA Link"),
            ("BUS-119", "TN 19 AZ 1190", routes[3], "ONLINE", 24.0, 13.0067, 80.2025, "GST Road, Guindy Industrial Concourse"),
            ("BUS-120", "TN 19 AZ 1200", routes[1], "ONLINE", 29.5, 12.8350, 80.1450, "Vandalur-Kelambakkam Rd, Kandigai"),
            ("BUS-122", "TN 19 AZ 1220", routes[0], "ONLINE", 46.0, 12.8250, 80.2180, "OMR IT Expressway, Siruseri SIPCOT"),
            ("BUS-123", "TN 19 AZ 1230", routes[4], "ONLINE", 47.0, 12.9000, 80.2280, "OMR IT Expressway, Sholinganallur Junction"),
            ("BUS-124", "TN 19 AZ 1240", routes[4], "ONLINE", 39.0, 12.7850, 79.9820, "Oragadam Corridor, Vallam Vadagal"),
            ("BUS-125", "TN 19 AZ 1250", routes[2], "ONLINE", 34.0, 12.7500, 79.9950, "Mahindra World City, Canopy Commercial Zone"),
            ("BUS-126", "TN 19 AZ 1260", routes[1], "ONLINE", 31.0, 12.7380, 80.0080, "Mahindra World City, Cybervale Tech Concourse"),
            ("BUS-127", "TN 19 AZ 1270", routes[5], "ONLINE", 28.0, 12.8300, 80.0490, "GST Road, Thailavaram Industrial Crossing"),
            ("BUS-128", "TN 19 AZ 1280", routes[3], "ONLINE", 35.0, 12.8180, 80.0400, "GST Road, SRM Kattankulathur South Gate"),
        ]

        buses = []
        for b_id, reg, r, st, spd, lat, lng, loc in bus_specs:
            bus, _ = Bus.objects.update_or_create(
                bus_id=b_id,
                defaults={
                    "registration_number": reg,
                    "route": r,
                    "status": st,
                    "speed": spd,
                    "latitude": lat,
                    "longitude": lng,
                    "current_location_name": loc,
                    "ai_status": "Processing" if st == "ONLINE" else "Standby",
                    "cameras_status": {
                        "front": True, "rear": True, "left": True,
                        "right": True, "passenger": True
                    }
                }
            )
            buses.append(bus)

            # Cameras for bus
            cam_types = ['FRONT', 'REAR', 'LEFT', 'RIGHT', 'PASSENGER']
            for ct in cam_types:
                BusCamera.objects.get_or_create(
                    bus=bus,
                    camera_type=ct,
                    defaults={
                        'camera_id': f"{bus.bus_id}-CAM-{ct[:2]}",
                        'status': 'ACTIVE' if bus.status != 'MAINTENANCE' else 'INACTIVE',
                        'resolution': '1920x1080',
                        'fps': 30
                    }
                )

            # Location history points
            for m in range(5, 0, -1):
                BusLocationHistory.objects.get_or_create(
                    bus=bus,
                    timestamp=timezone.now() - timedelta(minutes=m * 2),
                    defaults={
                        'latitude': lat - (m * 0.001),
                        'longitude': lng - (m * 0.001),
                        'speed': max(0, spd - 5),
                        'heading': 180.0
                    }
                )

        # 5. School Zones
        self.stdout.write('Creating Tamil Nadu school zones...')
        school_zones = [
            ("SRM Public School Kattankulathur", 12.8210, 80.0420, "HIGH", 350.0),
            ("B.S. Abdur Rahman Crescent School Vandalur", 12.8870, 80.0800, "CRITICAL", 300.0),
            ("St. Joseph Higher Secondary Chengalpattu", 12.6950, 79.9780, "HIGH", 300.0),
            ("Mahindra World City Vidya Mandir", 12.7440, 80.0050, "MEDIUM", 250.0),
            ("Vidya Mandir Estancia Guduvanchery", 12.8420, 80.0580, "MEDIUM", 400.0),
        ]
        for s_name, s_lat, s_lng, s_risk, s_rad in school_zones:
            SchoolZone.objects.get_or_create(
                name=s_name,
                defaults={
                    "latitude": s_lat,
                    "longitude": s_lng,
                    "risk_level": s_risk,
                    "radius": s_rad,
                    "active": True
                }
            )

        # 6. Road Hazards (precisely on road centerlines)
        self.stdout.write('Creating road hazards and condition segments on road centerlines...')
        hazards_data = [
            ("GST Road (NH 45), Potheri SRM Interchange", "POTHOLE", "HIGH", 0.94, 12.8231, 80.0444, 86, 3),
            ("GST Road (NH 45), Guduvanchery Flyover", "ROAD_DAMAGE", "MEDIUM", 0.89, 12.8465, 80.0612, 72, 2),
            ("GST Road (NH 45), Kilambakkam KCBT Concourse", "WATERLOGGING", "HIGH", 0.91, 12.8634, 80.0818, 88, 4),
            ("GST Road (NH 45), Vandalur Crescent Junction", "MISSING_DIVIDER", "MEDIUM", 0.85, 12.8885, 80.0815, 65, 1),
            ("GST Road (NH 45), Maraimalai Nagar Industrial Sector", "POTHOLE", "CRITICAL", 0.97, 12.7980, 80.0240, 95, 5),
            ("GST Road (NH 45), Paranur MWC Gate", "UNMARKED_SPEEDBUMP", "LOW", 0.88, 12.7423, 80.0028, 45, 1),
            ("GST Road (NH 45), Tambaram Sanatorium Approach", "POTHOLE", "MEDIUM", 0.92, 12.9380, 80.1300, 68, 2),
            ("GST Road (NH 45), Chengalpattu Toll Approach", "ROAD_DAMAGE", "HIGH", 0.93, 12.7150, 79.9890, 84, 3),
            ("GST Road (NH 45), Urapakkam Junction", "MISSING_ZEBRA_CROSSING", "HIGH", 0.90, 12.8670, 80.0710, 78, 2),
            ("GST Road (NH 45), Perungalathur Bypass", "WATERLOGGING", "CRITICAL", 0.96, 12.9044, 80.0890, 92, 4),
            ("GST Road (NH 45), Singaperumal Koil Crossing", "POTHOLE", "HIGH", 0.93, 12.7800, 80.0150, 81, 3),
            ("GST Road (NH 45), Chromepet MIT Approach", "ROAD_DAMAGE", "LOW", 0.84, 12.9510, 80.1380, 42, 1),
        ]
        for r_name, h_type, sev, conf, lat, lng, prio, occ in hazards_data:
            RoadHazard.objects.update_or_create(
                road_name=r_name,
                hazard_type=h_type,
                defaults={
                    "severity": sev,
                    "confidence": conf,
                    "latitude": lat,
                    "longitude": lng,
                    "detected_by_bus": buses[0],
                    "maintenance_priority": prio,
                    "occurrence_count": occ,
                    "status": "PENDING"
                }
            )

        # 7. Detections (100+)
        self.stdout.write('Creating 100+ AI detections...')
        detection_choices = [
            ('POTHOLE', 'HIGH'),
            ('ROAD_DAMAGE', 'MEDIUM'),
            ('WATERLOGGING', 'HIGH'),
            ('VEHICLE', 'LOW'),
            ('PEDESTRIAN', 'MEDIUM'),
            ('SCHOOL_CHILD', 'HIGH'),
            ('RASH_DRIVING', 'HIGH'),
            ('TRAFFIC_SIGN', 'LOW')
        ]
        now = timezone.now()
        for idx in range(120):
            bus = buses[idx % len(buses)]
            det_type, sev = random.choice(detection_choices)
            conf = round(random.uniform(0.86, 0.98), 2)
            t_offset = timedelta(minutes=random.randint(1, 480))
            road_name = bus.current_location_name or "GST Road Corridor"

            Detection.objects.create(
                bus=bus,
                detection_type=det_type,
                confidence=conf,
                severity=sev,
                latitude=round(bus.latitude + (random.random() - 0.5) * 0.01, 5),
                longitude=round(bus.longitude + (random.random() - 0.5) * 0.01, 5),
                timestamp=now - t_offset,
                frame_reference=f"frame_det_{idx+1000}.jpg",
                location_name=road_name,
                status='NEW',
                metadata={"road": road_name, "severity": sev}
            )

        # 8. Tracked Vehicles and ANPR Records (Suspect TN 19 AZ 4821)
        self.stdout.write('Creating Tracked Vehicles and ANPR detections for TN 19 AZ 4821...')
        suspect_reg = "TN19AZ4821"
        vehicle, _ = TrackedVehicle.objects.get_or_create(
            registration_number=suspect_reg,
            defaults={
                "vehicle_type": "White SUV",
                "vehicle_color": "White",
                "confidence": 0.964,
                "flagged_for_incident": True
            }
        )

        VehicleDetection.objects.filter(vehicle=vehicle).delete()
        ANPRDetection.objects.filter(registration_number=suspect_reg).delete()

        sightings = [
            (12.8231, 80.0444, "GST Road (NH 45), Potheri SRM Interchange", "Northbound towards Guduvanchery", 40),
            (12.8465, 80.0612, "GST Road (NH 45), Guduvanchery Flyover", "Northbound towards Vandalur", 30),
            (12.8634, 80.0818, "GST Road (NH 45), Kilambakkam KCBT Concourse", "Northbound towards Tambaram", 20),
            (12.8885, 80.0815, "GST Road (NH 45), Vandalur Crescent Junction", "Northbound towards Tambaram", 10),
        ]
        for s_lat, s_lng, s_loc, s_dir, s_min_ago in sightings:
            s_time = now - timedelta(minutes=s_min_ago)
            VehicleDetection.objects.create(
                vehicle=vehicle,
                latitude=s_lat,
                longitude=s_lng,
                bus=buses[0],
                timestamp=s_time,
                direction=s_dir,
                confidence=0.964,
                location_name=s_loc,
                frame_reference=f"anpr_{vehicle.registration_number}_{s_min_ago}.jpg"
            )
            ANPRDetection.objects.create(
                registration_number=suspect_reg,
                latitude=s_lat,
                longitude=s_lng,
                vehicle=vehicle,
                bus=buses[0],
                confidence=0.964,
                timestamp=s_time,
                location_name=s_loc,
                image_reference=f"anpr_crop_{s_min_ago}.jpg"
            )

        # 9. Incidents (including Hit-and-Run)
        self.stdout.write('Creating safety incidents...')
        Incident.objects.all().delete()
        Alert.objects.all().delete()

        IncidentService.process_hit_and_run_detection(
            bus=buses[0],
            latitude=12.8231,
            longitude=80.0444,
            vehicle_registration=suspect_reg,
            vehicle_type="White SUV",
            vehicle_color="White",
            location_name="GST Road (NH 45), Potheri SRM Junction"
        )

        other_incidents = [
            ("RASH_DRIVING", "HIGH", buses[1], "GST Road, Guduvanchery Junction", 12.8465, 80.0612, "Reckless overtaking near bus shelter"),
            ("PEDESTRIAN_RISK", "HIGH", buses[2], "GST Road, Vandalur Crescent", 12.8885, 80.0815, "Students crossing GST arterial near university gate"),
            ("WATERLOGGING", "MEDIUM", buses[3], "GST Road, Maraimalai Nagar Subway", 12.7980, 80.0240, "Water accumulation of 6 inches reported in left lane"),
            ("ACCIDENT", "CRITICAL", buses[4], "GST Road, Tambaram Sanatorium Approach", 12.9380, 80.1300, "Minor two-wheeler collision obstructing service lane"),
        ]
        for inc_type, sev, b_inst, loc, lat, lng, desc in other_incidents:
            Incident.objects.create(
                incident_type=inc_type,
                location=loc,
                severity=sev,
                bus=b_inst,
                latitude=lat,
                longitude=lng,
                confidence=0.93,
                status="INVESTIGATING",
                description=desc,
                assigned_team="Chengalpattu District Highway Patrol & Traffic Response"
            )

        # 10. Traffic Observations
        self.stdout.write('Creating hourly traffic observations...')
        TrafficObservation.objects.all().delete()
        for hour in range(24):
            t_time = now.replace(hour=hour, minute=0, second=0)
            is_peak = (8 <= hour <= 11) or (17 <= hour <= 20)
            base_count = 950 if is_peak else 420
            avg_speed = 26.0 if is_peak else 44.0
            cong_index = random.randint(68, 85) if is_peak else random.randint(30, 52)
            cong_level = 'HEAVY' if is_peak else 'MODERATE'

            TrafficObservation.objects.create(
                bus=buses[hour % len(buses)],
                location="GST Road (NH 45)",
                latitude=12.8231,
                longitude=80.0444,
                timestamp=t_time,
                vehicle_count=base_count,
                car_count=int(base_count * 0.45),
                bus_count=int(base_count * 0.08),
                truck_count=int(base_count * 0.06),
                two_wheeler_count=int(base_count * 0.35),
                auto_count=int(base_count * 0.06),
                average_speed=avg_speed,
                congestion_level=cong_level,
                congestion_index=cong_index
            )

        # 11. Alerts
        self.stdout.write('Creating alerts on road centerlines...')
        alerts = [
            ("HIT_AND_RUN", "CRITICAL", "Critical Hit-and-Run Detected", "TN 19 AZ 4821 flagged on GST Road NH 45 (Confidence: 96.4%)", "GST Road, Potheri SRM Junction", buses[0]),
            ("POTHOLE", "HIGH", "Severe Pothole Cluster", "Multiple deep potholes identified near Maraimalai Nagar Industrial Sector", "GST Road, Maraimalai Nagar", buses[4]),
            ("SCHOOL_CHILD", "HIGH", "Pedestrian Surge Near College", "Large student crossing rush near SRM IST Kattankulathur campus", "GST Road, Potheri Central", buses[1]),
            ("WATERLOGGING", "MEDIUM", "Lane Inundation Warning", "Service lane submerged near Guduvanchery underpass", "GST Road, Guduvanchery Junction", buses[2]),
        ]
        for a_type, sev, title, msg, loc, b_inst in alerts:
            Alert.objects.create(
                title=title,
                alert_type=a_type,
                severity=sev,
                message=msg,
                location=loc,
                bus=b_inst,
                latitude=b_inst.latitude,
                longitude=b_inst.longitude,
                confidence=0.94
            )

        # 12. Daily Report
        self.stdout.write('Creating daily report...')
        DailyReport.objects.get_or_create(
            report_date=now.date(),
            defaults={
                "total_buses": 248,
                "total_detections": 12846,
                "road_hazards": 327,
                "traffic_events": 840,
                "incidents": 18,
                "critical_incidents": 4,
                "average_confidence": 94.6,
                "summary_text": "Corridor-wide urban intelligence report for Chengalpattu GST Road Corridor (NH 45). 248 buses online sensing roads and traffic.",
                "report_data": {
                    "corridors": ["GST Road (NH 45)", "Vandalur-Kelambakkam", "OMR IT Expressway", "Oragadam Industrial Corridor"],
                    "maintenance_priority_index": 86
                }
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all urban sensing prototype data for Tamil Nadu!'))
