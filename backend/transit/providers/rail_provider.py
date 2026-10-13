from typing import List, Dict, Any
from .base import TransportProviderBase

class RailProvider(TransportProviderBase):
    """
    Indian Railways (Western Railway - Ahmedabad Division) Suburban / Intercity Network Provider.
    Covers the Ahmedabad Junction (Kalupur) ↔ Sabarmati Junction ↔ Gandhinagar Capital corridor.
    """

    def get_agency_info(self) -> Dict[str, Any]:
        return {
            'code': 'WR_RAIL',
            'name': 'Indian Railways (Western Railway)',
            'full_name': 'Western Railway Ahmedabad Division - Suburban / Intercity',
            'website': 'https://wr.indianrailways.gov.in',
            'helpline': '139',
            'fare_policy': 'Unreserved Second Class / Intercity MEMU fares: ₹10 (0-15 km), ₹15 (15-30 km), ₹30 (30+ km)',
        }

    def get_stops(self) -> List[Dict[str, Any]]:
        return [
            {
                'stop_id': 'RAIL-ADI-01',
                'name': 'Ahmedabad Junction (Kalupur)',
                'name_gu': 'અમદાવાદ જંકશન (કાલુપુર)',
                'name_hi': 'अहमदाबाद जंक्शन (कालुपुर)',
                'code': 'ADI',
                'city': 'AHMEDABAD',
                'mode': 'RAIL',
                'latitude': 23.0232,
                'longitude': 72.6006,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': True,
                'has_escalator': True,
                'has_parking': True,
                'has_restroom': True,
                'platform_info': 'Platform 1-12 (Main Rail Terminal - direct Metro connection)',
            },
            {
                'stop_id': 'RAIL-SBT-01',
                'name': 'Sabarmati Junction Railway Station',
                'name_gu': 'સાબરમતી જંકશન રેલ્વે સ્ટેશન',
                'name_hi': 'સાબરમતી जंक्शन रेलवे स्टेशन',
                'code': 'SBI',
                'city': 'AHMEDABAD',
                'mode': 'RAIL',
                'latitude': 23.0762,
                'longitude': 72.5855,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': True,
                'has_escalator': True,
                'has_parking': True,
                'has_restroom': True,
                'platform_info': 'Platform 1-5 (Integrated with GMRC Sabarmati Metro)',
            },
            {
                'stop_id': 'RAIL-CDK-01',
                'name': 'Chandkheda Road Railway Station',
                'name_gu': 'ચાંદખેડા રોડ રેલ્વે સ્ટેશન',
                'name_hi': 'चांदखेड़ा रोड रेलवे स्टेशन',
                'code': 'CDK',
                'city': 'AHMEDABAD',
                'mode': 'RAIL',
                'latitude': 23.1150,
                'longitude': 72.5890,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'has_parking': True,
                'has_restroom': True,
                'platform_info': 'Platform 1 & 2',
            },
            {
                'stop_id': 'RAIL-KHD-01',
                'name': 'Khodiyar Railway Station',
                'name_gu': 'ખોડિયાર રેલ્વે સ્ટેશન',
                'name_hi': 'खोड़ियार रेलवे स्टेशन',
                'code': 'KHD',
                'city': 'GANDHINAGAR',
                'mode': 'RAIL',
                'latitude': 23.1720,
                'longitude': 72.5860,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'has_parking': True,
                'has_restroom': True,
                'platform_info': 'Platform 1 & 2',
            },
            {
                'stop_id': 'RAIL-GNC-01',
                'name': 'Gandhinagar Capital Railway Station',
                'name_gu': 'ગાંધીનગર કેપિટલ રેલ્વે સ્ટેશન',
                'name_hi': 'गांधीनगर कैपिटल रेलवे स्टेशन',
                'code': 'GNC',
                'city': 'GANDHINAGAR',
                'mode': 'RAIL',
                'latitude': 23.2480,
                'longitude': 72.6490,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': True,
                'has_escalator': True,
                'has_parking': True,
                'has_restroom': True,
                'platform_info': 'Platform 1-3 (World Class Redeveloped Station with Leela Hotel & Mahatma Mandir Access)',
            },
        ]

    def get_routes(self) -> List[Dict[str, Any]]:
        return [
            {
                'route_id': 'RAIL-ADI-GNC',
                'route_number': 'ADI-GNC MEMU',
                'route_name': 'Ahmedabad Junction ↔ Sabarmati ↔ Gandhinagar Capital',
                'mode': 'RAIL',
                'color': '#7C3AED',
                'text_color': '#FFFFFF',
                'headway_peak_mins': 30,
                'headway_offpeak_mins': 60,
                'first_trip_time': '06:00',
                'last_trip_time': '21:30',
                'average_speed_kmh': 45.0,
                'reliability_score': 0.94,
            },
        ]

    def get_route_stops(self) -> List[Dict[str, Any]]:
        rail_stops = [
            'RAIL-ADI-01',
            'RAIL-SBT-01',
            'RAIL-CDK-01',
            'RAIL-KHD-01',
            'RAIL-GNC-01',
        ]
        result = []
        cum_dist = 0.0
        time_deltas = [0.0, 8.0, 6.0, 7.0, 9.0] # approx minutes between stops
        dist_deltas = [0.0, 6.2, 4.8, 6.5, 8.8] # approx km between stops

        for seq, sid in enumerate(rail_stops, start=1):
            cum_dist += dist_deltas[seq - 1]
            result.append({
                'route_id': 'RAIL-ADI-GNC',
                'stop_id': sid,
                'sequence': seq,
                'distance_from_start_km': round(cum_dist, 2),
                'travel_time_mins': time_deltas[seq - 1],
                'is_major_stop': sid in ['RAIL-ADI-01', 'RAIL-SBT-01', 'RAIL-GNC-01'],
            })
        return result

    def get_transfers(self) -> List[Dict[str, Any]]:
        return [
            {
                'from_stop_id': 'RAIL-SBT-01',
                'to_stop_id': 'METRO-NS-02',
                'transfer_type': 'RAIL_TRANSIT',
                'walking_distance_m': 120,
                'walking_time_mins': 2.5,
                'transfer_penalty_mins': 2.0,
                'instructions': 'Follow skywalk from Sabarmati Railway Station Platform 1 directly into Sabarmati Metro concourse.',
                'from_platform': 'Rail Platform 1',
                'to_platform': 'Metro Platform 2',
                'stand_number': 'Concourse Skywalk',
                'transfer_buffer_mins': 3.0,
                'is_step_free': True,
            },
            {
                'from_stop_id': 'METRO-NS-02',
                'to_stop_id': 'RAIL-SBT-01',
                'transfer_type': 'RAIL_TRANSIT',
                'walking_distance_m': 120,
                'walking_time_mins': 2.5,
                'transfer_penalty_mins': 2.0,
                'instructions': 'Exit Metro Concourse via Gate 2 directly to Sabarmati Railway Station main entrance.',
                'from_platform': 'Metro Platform 1/2',
                'to_platform': 'Rail Platform 1',
                'stand_number': 'Skywalk Gate 2',
                'transfer_buffer_mins': 3.0,
                'is_step_free': True,
            },
            {
                'from_stop_id': 'RAIL-GNC-01',
                'to_stop_id': 'METRO-GND-07',
                'transfer_type': 'RAIL_TRANSIT',
                'walking_distance_m': 250,
                'walking_time_mins': 3.5,
                'transfer_penalty_mins': 2.0,
                'instructions': 'Walk 250m along shaded concourse walkway from Gandhinagar Capital station exit to Mahatma Mandir Metro Station.',
                'from_platform': 'Main Rail Exit',
                'to_platform': 'Metro Concourse',
                'stand_number': 'North Exit Plaza',
                'transfer_buffer_mins': 4.0,
                'is_step_free': True,
            },
        ]

    def get_fare_rules(self) -> Dict[str, Any]:
        return {
            'agency_code': 'WR_RAIL',
            'mode': 'RAIL',
            'base_fare': 10.0,
            'base_distance_km': 15.0,
            'per_km_rate': 0.7,
            'max_fare': 30.0,
            'fare_brackets': [
                {'km': 15.0, 'fare': 10},
                {'km': 30.0, 'fare': 15},
                {'km': 99.0, 'fare': 30},
            ]
        }

    def get_vehicles(self) -> List[Dict[str, Any]]:
        return [
            {
                'vehicle_id': 'RAIL-MEMU-01',
                'registration': 'WR-MEMU-69117',
                'mode': 'RAIL',
                'route_id': 'RAIL-ADI-GNC',
                'capacity': 1200,
                'is_electric': True,
                'latitude': 23.0762,
                'longitude': 72.5855,
                'speed_kmh': 55.0,
                'current_location_name': 'Sabarmati Junction Platform 1',
                'next_stop_id': 'RAIL-CDK-01',
                'delay_minutes': 1,
                'status': 'ON_TIME',
            }
        ]

    def get_service_alerts(self) -> List[Dict[str, Any]]:
        return [
            {
                'title': 'Sabarmati - Gandhinagar Capital Intercity MEMU On Schedule',
                'description': 'Western Railway MEMU services between Ahmedabad Jn, Sabarmati, and Gandhinagar Capital running as per timetable.',
                'severity': 'INFO',
                'status': 'ACTIVE',
                'delay_impact_mins': 0,
            }
        ]
