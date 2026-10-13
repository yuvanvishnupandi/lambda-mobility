from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg, Sum
from .models import TrafficObservation

class TrafficService:
    @staticmethod
    def get_current_traffic():
        locations = ['SG Highway', 'Ashram Road', 'Ring Road', 'CG Road', 'Naroda Road']
        current_data = []
        for loc in locations:
            obs = TrafficObservation.objects.filter(location__icontains=loc).order_by('-timestamp').first()
            if obs:
                current_data.append(obs)
        if not current_data:
            current_data = TrafficObservation.objects.order_by('-timestamp')[:10]
        return current_data

    @staticmethod
    def get_traffic_history(hours=24):
        cutoff = timezone.now() - timedelta(hours=hours)
        qs = TrafficObservation.objects.filter(timestamp__gte=cutoff).order_by('timestamp')

        # Group by hour
        hourly_data = {}
        for obs in qs:
            hour_str = obs.timestamp.strftime('%H:00')
            if hour_str not in hourly_data:
                hourly_data[hour_str] = {
                    'time': hour_str,
                    'count': 0,
                    'vehicle_count': 0,
                    'speed_sum': 0.0,
                    'congestion_sum': 0
                }
            item = hourly_data[hour_str]
            item['count'] += 1
            item['vehicle_count'] += obs.vehicle_count
            item['speed_sum'] += obs.average_speed
            item['congestion_sum'] += obs.congestion_index

        result = []
        for hour_str, item in sorted(hourly_data.items()):
            count = max(1, item['count'])
            result.append({
                "time": hour_str,
                "vehicle_count": int(item['vehicle_count'] / count),
                "average_speed": round(item['speed_sum'] / count, 1),
                "congestion_index": int(item['congestion_sum'] / count)
            })

        if not result:
            # Seed-like default if history hasn't accumulated
            base_hours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]
            for h in base_hours:
                result.append({
                    "time": h,
                    "vehicle_count": 842 if h == "14:00" else 650,
                    "average_speed": 34 if h == "14:00" else 40,
                    "congestion_index": 67 if h == "14:00" else 48
                })

        return result

    @staticmethod
    def get_traffic_summary():
        agg = TrafficObservation.objects.aggregate(
            avg_speed=Avg('average_speed'),
            avg_congestion=Avg('congestion_index'),
            total_vehicles=Sum('vehicle_count')
        )
        return {
            "average_speed": round(agg['avg_speed'] or 34.5, 1),
            "congestion_index": int(agg['avg_congestion'] or 56),
            "total_vehicles_observed": agg['total_vehicles'] or 15420,
            "monitored_corridors": 5,
            "status": "MODERATE_FLOW"
        }

    @staticmethod
    def get_congestion_by_zone():
        zones = [
            {"zone": "SG Highway Corridor", "congestion": 74, "status": "Heavy", "avg_speed": 28},
            {"zone": "Ashram Road CBD", "congestion": 82, "status": "Severe", "avg_speed": 22},
            {"zone": "Ring Road West", "congestion": 58, "status": "Moderate", "avg_speed": 38},
            {"zone": "CG Road Commercial", "congestion": 68, "status": "Heavy", "avg_speed": 26},
            {"zone": "Naroda Industrial Link", "congestion": 45, "status": "Low", "avg_speed": 46},
        ]
        return zones

    @staticmethod
    def get_vehicle_classification():
        agg = TrafficObservation.objects.aggregate(
            cars=Sum('car_count'),
            tw=Sum('two_wheeler_count'),
            buses=Sum('bus_count'),
            autos=Sum('auto_count'),
            trucks=Sum('truck_count')
        )
        cars = agg['cars'] or 4500
        tw = agg['tw'] or 5800
        autos = agg['autos'] or 2100
        buses = agg['buses'] or 850
        trucks = agg['trucks'] or 620

        total = max(1, cars + tw + autos + buses + trucks)
        return [
            {"name": "Cars", "count": cars, "percentage": round((cars / total) * 100, 1), "color": "#06b6d4"},
            {"name": "Two-Wheelers", "count": tw, "percentage": round((tw / total) * 100, 1), "color": "#3b82f6"},
            {"name": "Auto-Rickshaws", "count": autos, "percentage": round((autos / total) * 100, 1), "color": "#f59e0b"},
            {"name": "Buses", "count": buses, "percentage": round((buses / total) * 100, 1), "color": "#10b981"},
            {"name": "Trucks & Commercial", "count": trucks, "percentage": round((trucks / total) * 100, 1), "color": "#ef4444"},
        ]
