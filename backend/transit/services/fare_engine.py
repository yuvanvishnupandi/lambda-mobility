import math
from typing import Dict, Any, List
from ..models import FareRule

class FareEngine:
    """Calculates fares for Metro, BRTS, AMTS, Regional Rail, and Gandhinagar/GIFT Bus legs."""

    @classmethod
    def calculate_leg_fare(cls, mode: str, distance_km: float) -> float:
        rule = FareRule.objects.filter(mode=mode, is_active=True).first()
        if not rule:
            # Fallback standard rates
            if mode == 'METRO':
                return min(35.0, max(5.0, 5.0 + math.ceil(distance_km / 3.0) * 5.0))
            elif mode == 'BRTS':
                return min(30.0, max(4.0, 4.0 + math.ceil(distance_km / 2.5) * 4.0))
            elif mode == 'AMTS':
                return min(25.0, max(3.0, 3.0 + math.ceil(distance_km / 3.0) * 3.0))
            elif mode == 'GANDHINAGAR_ELECTRIC_BUS':
                # Real official Gandhinagar Greenline (GGTSL) / GMC Electric Bus Tariff
                if distance_km <= 3.0:
                    return 5.0
                elif distance_km <= 8.0:
                    return 10.0
                elif distance_km <= 15.0:
                    return 15.0
                elif distance_km <= 25.0:
                    return 25.0
                else:
                    return 30.0
            elif mode == 'RAIL':
                return min(30.0, max(10.0, 10.0 + math.ceil(distance_km / 15.0) * 5.0))
            elif mode == 'BUS':
                return min(30.0, max(10.0, 10.0 + math.ceil(distance_km / 8.0) * 5.0))
            return 0.0

        if rule.fare_brackets:
            for bracket in sorted(rule.fare_brackets, key=lambda x: x['km']):
                if distance_km <= bracket['km']:
                    return float(bracket['fare'])
            return float(rule.max_fare)

        # Distance-based fallback
        if distance_km <= rule.base_distance_km:
            return float(rule.base_fare)
        extra_km = distance_km - rule.base_distance_km
        fare = rule.base_fare + (extra_km * rule.per_km_rate)
        return float(min(rule.max_fare, round(fare)))

    @classmethod
    def calculate_journey_fare(cls, steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        total_fare = 0.0
        breakdown = []

        for step in steps:
            mode = step.get('mode')
            dist = step.get('distance_km', 0.0)
            if mode in ['METRO', 'BRTS', 'AMTS', 'RAIL', 'BUS', 'GANDHINAGAR_ELECTRIC_BUS']:
                fare = cls.calculate_leg_fare(mode, dist)
                total_fare += fare
                breakdown.append({
                    'mode': mode,
                    'mode_display': 'Gandhinagar Electric Bus' if mode == 'GANDHINAGAR_ELECTRIC_BUS' else mode,
                    'route_number': step.get('route_number', ''),
                    'distance_km': round(dist, 1),
                    'fare': int(fare),
                })

        return {
            'total_fare': int(total_fare),
            'currency': '₹',
            'breakdown': breakdown,
            'fare_type': 'EXACT' if total_fare > 0 else 'FREE',
        }
