from typing import List, Dict, Any
from .base import TransportProviderBase

class AMTSProvider(TransportProviderBase):
    """
    Official Ahmedabad Municipal Transport Service (AMTS) Feeder Network Provider.
    Covers city feeder buses, railway connections, airport shuttles, and arterial lines.
    """

    def get_agency_info(self) -> Dict[str, Any]:
        return {
            'code': 'AMTS',
            'name': 'AMTS City Bus',
            'full_name': 'Ahmedabad Municipal Transport Service',
            'website': 'https://www.amts.co.in',
            'helpline': '079-25391811',
            'fare_policy': 'Stage based: ₹3 (0-2 km), ₹6 (2-4 km), ₹10 (4-8 km), ₹15 (8-14 km), ₹20 (14-20 km), max ₹25',
        }

    def get_stops(self) -> List[Dict[str, Any]]:
        return [
            {
                'stop_id': 'AMTS-01',
                'name': 'Sabarmati Railway Station AMTS Stand',
                'name_gu': 'સાબરમતી રેલવે સ્ટેશન એએમટીએસ સ્ટેન્ડ',
                'name_hi': 'साबरमती रेलवे स्टेशन एएमटीएस स्टैंड',
                'code': 'SBMA',
                'mode': 'AMTS',
                'latitude': 23.0768,
                'longitude': 72.5850,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Bay 1 & 2',
            },
            {
                'stop_id': 'AMTS-02',
                'name': 'Subhash Bridge Circle AMTS',
                'name_gu': 'સુભાષ બ્રિજ સર્કલ એએમટીએસ',
                'name_hi': 'सुभाष ब्रिज सर्कल एएमटीएस',
                'code': 'SBHA',
                'mode': 'AMTS',
                'latitude': 23.0640,
                'longitude': 72.5865,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Roadside Stop',
            },
            {
                'stop_id': 'AMTS-03',
                'name': 'Lal Darwaja Terminal',
                'name_gu': 'લાલ દરવાજા ટર્મિનલ',
                'name_hi': 'लाल दरवाजा टर्मिनल',
                'code': 'LALB',
                'mode': 'AMTS',
                'latitude': 23.0238,
                'longitude': 72.5815,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Central City Bus Terminal (All Bays)',
            },
            {
                'stop_id': 'AMTS-04',
                'name': 'Paldi Crossroads AMTS',
                'name_gu': 'પાલડી ચાર રસ્તા એએમટીએસ',
                'name_hi': 'पालडी चार रास्ता एएमटीएस',
                'code': 'PLDA',
                'mode': 'AMTS',
                'latitude': 23.0180,
                'longitude': 72.5670,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Bay A & B',
            },
            {
                'stop_id': 'AMTS-05',
                'name': 'Vasna Terminal AMTS',
                'name_gu': 'વાસણા ટર્મિનલ એએમટીએસ',
                'name_hi': 'वासणा टर्मिनल एएमटीएस',
                'code': 'VSNA',
                'mode': 'AMTS',
                'latitude': 22.9995,
                'longitude': 72.5535,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Bus Terminal',
            },
            {
                'stop_id': 'AMTS-06',
                'name': 'SVPIA Airport Terminal 1 & 2',
                'name_gu': 'એરપોર્ટ ટર્મિનલ એએમટીએસ',
                'name_hi': 'एयरपोर्ट टर्मिनल एएमटीएस',
                'code': 'AIRA',
                'mode': 'AMTS',
                'latitude': 23.0735,
                'longitude': 72.6345,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Arrival Plaza Bus Bay',
            },
            {
                'stop_id': 'AMTS-07',
                'name': 'Shahibaug Underbridge AMTS',
                'name_gu': 'શાહીબાગ અંડરબ્રિજ એએમટીએસ',
                'name_hi': 'शाहीबाग अंडरब्रिज एएमटीएस',
                'code': 'SHBA',
                'mode': 'AMTS',
                'latitude': 23.0560,
                'longitude': 72.5990,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Roadside Stop',
            },
            {
                'stop_id': 'AMTS-08',
                'name': 'Delhi Darwaja AMTS',
                'name_gu': 'દિલ્હી દરવાજા એએમટીએસ',
                'name_hi': 'दिल्ली दरवाजा एएमटीएस',
                'code': 'DLHA',
                'mode': 'AMTS',
                'latitude': 23.0410,
                'longitude': 72.5890,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Roadside Stop',
            },
            {
                'stop_id': 'AMTS-09',
                'name': 'Kalupur Railway Station AMTS Circle',
                'name_gu': 'કાલુપુર રેલવે સ્ટેશન એએમટીએસ સર્કલ',
                'name_hi': 'कालुपुर रेलवे स्टेशन एएमटीएस सर्कल',
                'code': 'KLPA',
                'mode': 'AMTS',
                'latitude': 23.0300,
                'longitude': 72.5990,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Station Forecourt Bus Bay',
            },
            {
                'stop_id': 'AMTS-10',
                'name': 'Vastrapur Lake AMTS',
                'name_gu': 'વસ્ત્રાપુર તળાવ એએમટીએસ',
                'name_hi': 'वस्त्रापुर झील एएमटीएस',
                'code': 'VSTA',
                'mode': 'AMTS',
                'latitude': 23.0360,
                'longitude': 72.5285,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Roadside Stop',
            },
            {
                'stop_id': 'AMTS-11',
                'name': 'Iskcon Temple AMTS',
                'name_gu': 'ઇસ્કોન મંદિર એએમટીએસ',
                'name_hi': 'इस्कॉन मंदिर एएमटीएस',
                'code': 'ISKA',
                'mode': 'AMTS',
                'latitude': 23.0280,
                'longitude': 72.5080,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Service Road Bay',
            },
            {
                'stop_id': 'AMTS-12',
                'name': 'Thaltej Cross Road AMTS',
                'name_gu': 'થલતેજ ચાર રસ્તા એએમટીએસ',
                'name_hi': 'थलतेज चार रास्ता एएमटीएस',
                'code': 'THLA',
                'mode': 'AMTS',
                'latitude': 23.0530,
                'longitude': 72.5170,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'SG Highway Service Road Bay',
            },
            {
                'stop_id': 'AMTS-13',
                'name': 'Pakwan Cross Road AMTS',
                'name_gu': 'પકવાન ચાર રસ્તા એએમટીએસ',
                'name_hi': 'पकवान चार रास्ता एएमटीएस',
                'code': 'PKWA',
                'mode': 'AMTS',
                'latitude': 23.0420,
                'longitude': 72.5130,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'SG Highway Service Road',
            },
            {
                'stop_id': 'AMTS-14',
                'name': 'Sarkhej Sanand Crossroads AMTS',
                'name_gu': 'સરખેજ સાણંદ ચાર રસ્તા એએમટીએસ',
                'name_hi': 'सरखेज साणंद चार रास्ता एएमटीएस',
                'code': 'SRKA',
                'mode': 'AMTS',
                'latitude': 22.9980,
                'longitude': 72.4980,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'South SG Highway Terminal',
            },
        ]

    def get_routes(self) -> List[Dict[str, Any]]:
        return [
            {
                'route_id': 'AMTS-125',
                'route_number': '125',
                'route_name': 'Sabarmati Railway Station ↔ Lal Darwaja ↔ Vasna',
                'mode': 'AMTS',
                'color': '#059669', # Emerald Green
                'text_color': '#FFFFFF',
                'headway_peak_mins': 10,
                'headway_offpeak_mins': 18,
                'first_trip_time': '06:00',
                'last_trip_time': '22:30',
                'average_speed_kmh': 20.0,
                'reliability_score': 0.86,
            },
            {
                'route_id': 'AMTS-501',
                'route_number': '501 (Airport Shuttle)',
                'route_name': 'SVPIA Airport ↔ Shahibaug ↔ Kalupur ↔ Lal Darwaja',
                'mode': 'AMTS',
                'color': '#0284C7', # Sky Blue
                'text_color': '#FFFFFF',
                'headway_peak_mins': 15,
                'headway_offpeak_mins': 25,
                'first_trip_time': '05:30',
                'last_trip_time': '23:30',
                'average_speed_kmh': 22.0,
                'reliability_score': 0.88,
            },
            {
                'route_id': 'AMTS-13-1',
                'route_number': '13/1',
                'route_name': 'Kalupur ↔ Income Tax ↔ Vastrapur ↔ Thaltej',
                'mode': 'AMTS',
                'color': '#10B981', # Green
                'text_color': '#FFFFFF',
                'headway_peak_mins': 12,
                'headway_offpeak_mins': 20,
                'first_trip_time': '06:15',
                'last_trip_time': '22:00',
                'average_speed_kmh': 19.0,
                'reliability_score': 0.84,
            },
            {
                'route_id': 'AMTS-401',
                'route_number': '401 (SG Express)',
                'route_name': 'Sarkhej ↔ Iskcon ↔ Pakwan ↔ Thaltej',
                'mode': 'AMTS',
                'color': '#D97706', # Amber
                'text_color': '#FFFFFF',
                'headway_peak_mins': 8,
                'headway_offpeak_mins': 15,
                'first_trip_time': '06:00',
                'last_trip_time': '23:00',
                'average_speed_kmh': 24.0,
                'reliability_score': 0.87,
            },
        ]

    def get_route_stops(self) -> List[Dict[str, Any]]:
        # Route 125: Sabarmati -> Vasna
        r125_stops = ['AMTS-01', 'AMTS-02', 'AMTS-03', 'AMTS-04', 'AMTS-05']

        # Route 501: Airport -> Lal Darwaja
        r501_stops = ['AMTS-06', 'AMTS-07', 'AMTS-08', 'AMTS-09', 'AMTS-03']

        # Route 13/1: Kalupur -> Thaltej
        r13_stops = ['AMTS-09', 'AMTS-03', 'AMTS-10', 'AMTS-11', 'AMTS-12']

        # Route 401: Sarkhej -> Thaltej
        r401_stops = ['AMTS-14', 'AMTS-11', 'AMTS-13', 'AMTS-12']

        result = []
        for r_id, stops, dist_step in [
            ('AMTS-125', r125_stops, 2.5),
            ('AMTS-501', r501_stops, 3.2),
            ('AMTS-13-1', r13_stops, 2.8),
            ('AMTS-401', r401_stops, 2.3),
        ]:
            cum_dist = 0.0
            for seq, sid in enumerate(stops, start=1):
                result.append({
                    'route_id': r_id,
                    'stop_id': sid,
                    'sequence': seq,
                    'distance_from_start_km': round(cum_dist, 2),
                    'travel_time_mins': 4.0 if seq > 1 else 0.0,
                    'is_major_stop': seq in [1, len(stops)],
                })
                cum_dist += dist_step

        return result

    def get_transfers(self) -> List[Dict[str, Any]]:
        return [
            {
                'from_stop_id': 'AMTS-01', # Sabarmati AMTS
                'to_stop_id': 'METRO-NS-02', # Sabarmati Railway Station Metro
                'transfer_type': 'METRO_AMTS',
                'walking_distance_m': 100,
                'walking_time_mins': 1.5,
                'transfer_penalty_mins': 2.0,
                'instructions': 'Walk 100m from AMTS bus bay directly to Sabarmati Metro North Entry gate.',
                'is_step_free': True,
            },
            {
                'from_stop_id': 'AMTS-12', # Thaltej AMTS
                'to_stop_id': 'METRO-EW-02', # Thaltej Metro
                'transfer_type': 'METRO_AMTS',
                'walking_distance_m': 80,
                'walking_time_mins': 1.0,
                'transfer_penalty_mins': 1.5,
                'instructions': 'Direct roadside connection: Thaltej AMTS stop is 80m from Thaltej Metro Gate 1.',
                'is_step_free': True,
            },
            {
                'from_stop_id': 'AMTS-11', # Iskcon AMTS
                'to_stop_id': 'BRTS-12', # Iskcon BRTS
                'transfer_type': 'BRTS_AMTS',
                'walking_distance_m': 110,
                'walking_time_mins': 1.5,
                'transfer_penalty_mins': 2.0,
                'instructions': 'Cross service road using zebra crossing to enter Iskcon BRTS median station.',
                'is_step_free': True,
            },
        ]

    def get_fare_rules(self) -> Dict[str, Any]:
        return {
            'agency_code': 'AMTS',
            'mode': 'AMTS',
            'base_fare': 3.0,
            'base_distance_km': 2.0,
            'per_km_rate': 1.0,
            'max_fare': 25.0,
            'fare_brackets': [
                {'km': 2.0, 'fare': 3},
                {'km': 4.0, 'fare': 6},
                {'km': 8.0, 'fare': 10},
                {'km': 14.0, 'fare': 15},
                {'km': 20.0, 'fare': 20},
                {'km': 99.0, 'fare': 25},
            ]
        }

    def get_vehicles(self) -> List[Dict[str, Any]]:
        return [
            {
                'vehicle_id': 'AMTS-BUS-125',
                'registration': 'GJ-01-BX-7125',
                'mode': 'AMTS',
                'route_id': 'AMTS-125',
                'capacity': 55,
                'is_electric': True,
                'latitude': 23.0640,
                'longitude': 72.5865,
                'speed_kmh': 24.0,
                'current_location_name': 'Subhash Bridge Circle',
                'next_stop_id': 'AMTS-03',
                'delay_minutes': 12, # Dynamic delay for testing delay-aware routing!
                'status': 'DELAYED',
            },
            {
                'vehicle_id': 'AMTS-BUS-501',
                'registration': 'GJ-01-BX-8501',
                'mode': 'AMTS',
                'route_id': 'AMTS-501',
                'capacity': 55,
                'is_electric': True,
                'latitude': 23.0735,
                'longitude': 72.6345,
                'speed_kmh': 26.0,
                'current_location_name': 'SVPIA Airport Departure Plaza',
                'next_stop_id': 'AMTS-07',
                'delay_minutes': 2,
                'status': 'SLIGHT_DELAY',
            },
            {
                'vehicle_id': 'AMTS-BUS-401',
                'registration': 'GJ-01-BX-9401',
                'mode': 'AMTS',
                'route_id': 'AMTS-401',
                'capacity': 55,
                'is_electric': True,
                'latitude': 23.0420,
                'longitude': 72.5130,
                'speed_kmh': 28.0,
                'current_location_name': 'Pakwan Cross Road SG Highway',
                'next_stop_id': 'AMTS-12',
                'delay_minutes': 0,
                'status': 'ON_TIME',
            }
        ]

    def get_service_alerts(self) -> List[Dict[str, Any]]:
        return [
            {
                'title': 'AMTS Route 125 Ashram Road Traffic Delay',
                'description': 'Route 125 currently experiencing +12 min delay near Subhash Bridge due to junction maintenance. Metro alternative recommended.',
                'severity': 'WARNING',
                'status': 'ACTIVE',
                'delay_impact_mins': 12,
            }
        ]
