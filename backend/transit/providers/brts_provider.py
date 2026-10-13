from typing import List, Dict, Any
from .base import TransportProviderBase

class BRTSProvider(TransportProviderBase):
    """
    Official Ahmedabad Janmarg BRTS (Bus Rapid Transit System) Network Provider.
    Covers major dedicated median busway corridors across Ahmedabad.
    """

    def get_agency_info(self) -> Dict[str, Any]:
        return {
            'code': 'BRTS',
            'name': 'Janmarg BRTS',
            'full_name': 'Ahmedabad Janmarg Limited (AJL)',
            'website': 'https://www.ahmedabadjanmarg.com',
            'helpline': '079-27552250',
            'fare_policy': 'Stage based: ₹4 (0-2 km), ₹8 (2-5 km), ₹12 (5-8 km), ₹16 (8-14 km), ₹20 (14-20 km), max ₹30',
        }

    def get_stops(self) -> List[Dict[str, Any]]:
        return [
            # --- Corridor 1 (West - Ring Road): RTO to Bopal ---
            {
                'stop_id': 'BRTS-01',
                'name': 'RTO Circle BRTS',
                'name_gu': 'આર.ટી.ઓ. સર્કલ બીઆરટીએસ',
                'name_hi': 'आर.टी.ओ. सर्कल बीआरटीएस',
                'code': 'RTOB',
                'mode': 'BRTS',
                'latitude': 23.0650,
                'longitude': 72.5800,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform A & B',
            },
            {
                'stop_id': 'BRTS-02',
                'name': 'Ranip Cross Road BRTS',
                'name_gu': 'રાણીપ ક્રોસ રોડ બીઆરટીએસ',
                'name_hi': 'राणिप क्रॉस रोड बीआरटीએસ',
                'code': 'RNPB',
                'mode': 'BRTS',
                'latitude': 23.0555,
                'longitude': 72.5732,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform (Direct Ranip Metro link)',
            },
            {
                'stop_id': 'BRTS-03',
                'name': 'Bhavsar Hostel BRTS',
                'name_gu': 'ભાવસાર હોસ્ટેલ બીઆરટીએસ',
                'name_hi': 'भावसार हॉस्टेल बीआरटीएस',
                'code': 'BHVB',
                'mode': 'BRTS',
                'latitude': 23.0565,
                'longitude': 72.5650,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform',
            },
            {
                'stop_id': 'BRTS-04',
                'name': 'Shastri Nagar BRTS',
                'name_gu': 'શાસ્ત્રી નગર બીઆરટીએસ',
                'name_hi': 'शास्त्री नगर बीआरटीएस',
                'code': 'SHTB',
                'mode': 'BRTS',
                'latitude': 23.0575,
                'longitude': 72.5520,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform',
            },
            {
                'stop_id': 'BRTS-05',
                'name': 'Sola Cross Road BRTS',
                'name_gu': 'સોલા ક્રોસ રોડ બીઆરટીએસ',
                'name_hi': 'सोला क्रॉस रोड बीआरटीएस',
                'code': 'SOLB',
                'mode': 'BRTS',
                'latitude': 23.0585,
                'longitude': 72.5410,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform A & B',
            },
            {
                'stop_id': 'BRTS-06',
                'name': 'Memnagar BRTS',
                'name_gu': 'મેમનગર બીઆરટીએસ',
                'name_hi': 'मेमनगर बीआरटीएस',
                'code': 'MEMB',
                'mode': 'BRTS',
                'latitude': 23.0495,
                'longitude': 72.5400,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform',
            },
            {
                'stop_id': 'BRTS-07',
                'name': 'Gujarat University BRTS',
                'name_gu': 'ગુજરાત યુનિવર્સિટી બીઆરટીએસ',
                'name_hi': 'गुजरात विश्वविद्यालय बीआरटीएस',
                'code': 'GUNB',
                'mode': 'BRTS',
                'latitude': 23.0392,
                'longitude': 72.5475,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform (Metro Link 100m)',
            },
            {
                'stop_id': 'BRTS-08',
                'name': 'Panjrapol BRTS',
                'name_gu': 'પાંજરાપોળ બીઆરટીએસ',
                'name_hi': 'पांजरापोल बीआरटीएस',
                'code': 'PNJB',
                'mode': 'BRTS',
                'latitude': 23.0315,
                'longitude': 72.5460,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform (IIM Ahmedabad access)',
            },
            {
                'stop_id': 'BRTS-09',
                'name': 'Nehrunagar BRTS',
                'name_gu': 'નેહરુનગર બીઆરટીએસ',
                'name_hi': 'नेहरूनगर बीआरटीएस',
                'code': 'NEHB',
                'mode': 'BRTS',
                'latitude': 23.0235,
                'longitude': 72.5440,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform A & B',
            },
            {
                'stop_id': 'BRTS-10',
                'name': 'Shivranjani BRTS',
                'name_gu': 'શિવરંજની બીઆરટીએસ',
                'name_hi': 'शिवरंजनी बीआरटीएस',
                'code': 'SHVB',
                'mode': 'BRTS',
                'latitude': 23.0245,
                'longitude': 72.5320,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform A & B',
            },
            {
                'stop_id': 'BRTS-11',
                'name': 'Jhansi Ki Rani BRTS',
                'name_gu': 'ઝાંસી કી રાણી બીઆરટીએસ',
                'name_hi': 'झांसी की रानी बीआरटीएस',
                'code': 'JKRB',
                'mode': 'BRTS',
                'latitude': 23.0252,
                'longitude': 72.5230,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform',
            },
            {
                'stop_id': 'BRTS-12',
                'name': 'Iskcon Cross Road BRTS',
                'name_gu': 'ઇસ્કોન ચાર રસ્તા બીઆરટીએસ',
                'name_hi': 'इस्कॉन चार रास्ता बीआरटीएस',
                'code': 'ISKB',
                'mode': 'BRTS',
                'latitude': 23.0270,
                'longitude': 72.5075,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Major Hub Platform (SG Highway)',
            },
            {
                'stop_id': 'BRTS-13',
                'name': 'Bopal Approach BRTS',
                'name_gu': 'બોપલ એપ્રોચ બીઆરટીએસ',
                'name_hi': 'बोपल एप्रोच बीआरटीएस',
                'code': 'BOPB',
                'mode': 'BRTS',
                'latitude': 23.0310,
                'longitude': 72.4850,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Terminal Platform',
            },

            # --- Central Corridor (Ashram Road / Central): Chandkheda to Maninagar ---
            {
                'stop_id': 'BRTS-14',
                'name': 'Chandkheda BRTS',
                'name_gu': 'ચાંદખેડા બીઆરટીએસ',
                'name_hi': 'चांदखेड़ा बीआरटीएस',
                'code': 'CHNB',
                'mode': 'BRTS',
                'latitude': 23.1090,
                'longitude': 72.5850,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform',
            },
            {
                'stop_id': 'BRTS-15',
                'name': 'Visat Junction BRTS',
                'name_gu': 'વિસત જંકશન બીઆરટીએસ',
                'name_hi': 'विसत जंक्शन बीआरटीएस',
                'code': 'VIST',
                'mode': 'BRTS',
                'latitude': 23.0980,
                'longitude': 72.5830,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform',
            },
            {
                'stop_id': 'BRTS-16',
                'name': 'Sabarmati Power House BRTS',
                'name_gu': 'સાબરમતી પાવર હાઉસ બીઆરટીએસ',
                'name_hi': 'साबरमती पावर हाउस बीआरटीएस',
                'code': 'SPHB',
                'mode': 'BRTS',
                'latitude': 23.0785,
                'longitude': 72.5825,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Median Platform (Sabarmati Rail Link 200m)',
            },
            {
                'stop_id': 'BRTS-17',
                'name': 'Income Tax Circle BRTS',
                'name_gu': 'ઇન્કમ ટેક્સ સર્કલ બીઆરટીએસ',
                'name_hi': 'इनकम टैक्स सर्कल बीआरटीएस',
                'code': 'ITXB',
                'mode': 'BRTS',
                'latitude': 23.0415,
                'longitude': 72.5710,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Ashram Road Hub (Old High Court Metro 150m)',
            },
            {
                'stop_id': 'BRTS-18',
                'name': 'Geeta Mandir BRTS',
                'name_gu': 'ગીતા મંદિર બીઆરટીએસ',
                'name_hi': 'गीता मंदिर बीआरटीएस',
                'code': 'GTMB',
                'mode': 'BRTS',
                'latitude': 23.0145,
                'longitude': 72.5895,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Central Bus Terminal Platform',
            },
            {
                'stop_id': 'BRTS-19',
                'name': 'Maninagar Railway Station BRTS',
                'name_gu': 'મણિનગર રેલવે સ્ટેશન બીઆરટીએસ',
                'name_hi': 'मणिनगर रेलवे स्टेशन बीआरटीएस',
                'code': 'MANB',
                'mode': 'BRTS',
                'latitude': 22.9975,
                'longitude': 72.6050,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Railway Concourse Connection',
            },
            {
                'stop_id': 'BRTS-20',
                'name': 'Kalupur Railway Station BRTS',
                'name_gu': 'કાલુપુર રેલવે સ્ટેશન બીઆરટીએસ',
                'name_hi': 'कालुपुर रेलवे स्टेशन बीआरटीएस',
                'code': 'KLPB',
                'mode': 'BRTS',
                'latitude': 23.0305,
                'longitude': 72.5985,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Ahmedabad Central Rail Concourse',
            },
            {
                'stop_id': 'BRTS-21',
                'name': 'Science City BRTS',
                'name_gu': 'સાયન્સ સિટી બીઆરટીએસ',
                'name_hi': 'साइंस सिटी बीआरटीएस',
                'code': 'SCIB',
                'mode': 'BRTS',
                'latitude': 23.0780,
                'longitude': 72.5030,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'has_elevator': False,
                'has_escalator': False,
                'platform_info': 'Science City Gate Platform',
            },
        ]

    def get_routes(self) -> List[Dict[str, Any]]:
        return [
            {
                'route_id': 'BRTS-1D',
                'route_number': '1D (Janmarg Line 1)',
                'route_name': 'RTO Circle ↔ Shivranjani ↔ Iskcon ↔ Bopal',
                'mode': 'BRTS',
                'color': '#F97316', # Orange
                'text_color': '#FFFFFF',
                'headway_peak_mins': 4,
                'headway_offpeak_mins': 8,
                'first_trip_time': '06:00',
                'last_trip_time': '23:00',
                'average_speed_kmh': 28.0,
                'reliability_score': 0.94,
            },
            {
                'route_id': 'BRTS-8D',
                'route_number': '8D (Janmarg Line 8)',
                'route_name': 'Chandkheda ↔ RTO ↔ Income Tax ↔ Maninagar',
                'mode': 'BRTS',
                'color': '#0D9488', # Teal
                'text_color': '#FFFFFF',
                'headway_peak_mins': 5,
                'headway_offpeak_mins': 10,
                'first_trip_time': '06:00',
                'last_trip_time': '23:00',
                'average_speed_kmh': 26.0,
                'reliability_score': 0.93,
            },
            {
                'route_id': 'BRTS-9D',
                'route_number': '9D (Janmarg Line 9)',
                'route_name': 'Science City ↔ Sola ↔ Usmanpura ↔ Kalupur',
                'mode': 'BRTS',
                'color': '#9333EA', # Purple
                'text_color': '#FFFFFF',
                'headway_peak_mins': 6,
                'headway_offpeak_mins': 12,
                'first_trip_time': '06:15',
                'last_trip_time': '22:30',
                'average_speed_kmh': 25.0,
                'reliability_score': 0.91,
            },
        ]

    def get_route_stops(self) -> List[Dict[str, Any]]:
        # Line 1D: RTO -> Bopal
        line1_stops = [
            'BRTS-01', 'BRTS-02', 'BRTS-03', 'BRTS-04', 'BRTS-05',
            'BRTS-06', 'BRTS-07', 'BRTS-08', 'BRTS-09', 'BRTS-10',
            'BRTS-11', 'BRTS-12', 'BRTS-13'
        ]

        # Line 8D: Chandkheda -> Maninagar
        line8_stops = [
            'BRTS-14', 'BRTS-15', 'BRTS-16', 'BRTS-01', 'BRTS-17',
            'BRTS-18', 'BRTS-19'
        ]

        # Line 9D: Science City -> Kalupur
        line9_stops = [
            'BRTS-21', 'BRTS-05', 'BRTS-04', 'BRTS-03', 'BRTS-17', 'BRTS-20'
        ]

        result = []
        # Line 1D
        cum_dist = 0.0
        for seq, sid in enumerate(line1_stops, start=1):
            result.append({
                'route_id': 'BRTS-1D',
                'stop_id': sid,
                'sequence': seq,
                'distance_from_start_km': round(cum_dist, 2),
                'travel_time_mins': 2.5 if seq > 1 else 0.0,
                'is_major_stop': sid in ['BRTS-01', 'BRTS-07', 'BRTS-10', 'BRTS-12'],
            })
            cum_dist += 1.3

        # Line 8D
        cum_dist = 0.0
        for seq, sid in enumerate(line8_stops, start=1):
            result.append({
                'route_id': 'BRTS-8D',
                'stop_id': sid,
                'sequence': seq,
                'distance_from_start_km': round(cum_dist, 2),
                'travel_time_mins': 3.0 if seq > 1 else 0.0,
                'is_major_stop': sid in ['BRTS-16', 'BRTS-17', 'BRTS-19'],
            })
            cum_dist += 2.0

        # Line 9D
        cum_dist = 0.0
        for seq, sid in enumerate(line9_stops, start=1):
            result.append({
                'route_id': 'BRTS-9D',
                'stop_id': sid,
                'sequence': seq,
                'distance_from_start_km': round(cum_dist, 2),
                'travel_time_mins': 3.5 if seq > 1 else 0.0,
                'is_major_stop': sid in ['BRTS-21', 'BRTS-05', 'BRTS-20'],
            })
            cum_dist += 2.2

        return result

    def get_transfers(self) -> List[Dict[str, Any]]:
        return [
            {
                'from_stop_id': 'BRTS-16', # Sabarmati Power House BRTS
                'to_stop_id': 'METRO-NS-02', # Sabarmati Railway Station Metro
                'transfer_type': 'METRO_BRTS',
                'walking_distance_m': 180,
                'walking_time_mins': 2.5,
                'transfer_penalty_mins': 2.0,
                'instructions': 'Exit BRTS median station, cross to Metro concourse via pedestrian zebra crossing and skywalk.',
                'is_step_free': True,
            },
            {
                'from_stop_id': 'BRTS-02', # Ranip BRTS
                'to_stop_id': 'METRO-NS-05', # Ranip Metro
                'transfer_type': 'METRO_BRTS',
                'walking_distance_m': 120,
                'walking_time_mins': 1.8,
                'transfer_penalty_mins': 2.0,
                'instructions': 'Direct covered pedestrian pathway from Ranip BRTS to Ranip Metro concourse.',
                'is_step_free': True,
            },
            {
                'from_stop_id': 'BRTS-17', # Income Tax BRTS
                'to_stop_id': 'METRO-INT-01', # Old High Court Metro Interchange
                'transfer_type': 'METRO_BRTS',
                'walking_distance_m': 150,
                'walking_time_mins': 2.2,
                'transfer_penalty_mins': 2.0,
                'instructions': 'Walk south on Ashram Road for 150m to Old High Court Metro Entry Gate 2.',
                'is_step_free': True,
            },
            {
                'from_stop_id': 'BRTS-07', # Gujarat University BRTS
                'to_stop_id': 'METRO-EW-05', # Gujarat University Metro
                'transfer_type': 'METRO_BRTS',
                'walking_distance_m': 140,
                'walking_time_mins': 2.0,
                'transfer_penalty_mins': 2.0,
                'instructions': 'Walk 140m across University circle to Metro station entrance.',
                'is_step_free': True,
            },
            {
                'from_stop_id': 'BRTS-20', # Kalupur BRTS
                'to_stop_id': 'METRO-EW-10', # Kalupur Metro
                'transfer_type': 'METRO_BRTS',
                'walking_distance_m': 90,
                'walking_time_mins': 1.2,
                'transfer_penalty_mins': 1.5,
                'instructions': 'Direct rail terminal underground pedestrian underpass connects BRTS and Metro.',
                'is_step_free': True,
            },
        ]

    def get_fare_rules(self) -> Dict[str, Any]:
        return {
            'agency_code': 'BRTS',
            'mode': 'BRTS',
            'base_fare': 4.0,
            'base_distance_km': 2.0,
            'per_km_rate': 1.1,
            'max_fare': 30.0,
            'fare_brackets': [
                {'km': 2.0, 'fare': 4},
                {'km': 5.0, 'fare': 8},
                {'km': 8.0, 'fare': 12},
                {'km': 14.0, 'fare': 16},
                {'km': 20.0, 'fare': 20},
                {'km': 99.0, 'fare': 30},
            ]
        }

    def get_vehicles(self) -> List[Dict[str, Any]]:
        return [
            {
                'vehicle_id': 'BRTS-BUS-104',
                'registration': 'GJ-01-CZ-4104',
                'mode': 'BRTS',
                'route_id': 'BRTS-1D',
                'capacity': 75,
                'is_electric': True,
                'latitude': 23.0415,
                'longitude': 72.5710,
                'speed_kmh': 31.0,
                'current_location_name': 'Ashram Road Busway',
                'next_stop_id': 'BRTS-02',
                'delay_minutes': 1,
                'status': 'SLIGHT_DELAY',
            },
            {
                'vehicle_id': 'BRTS-BUS-108',
                'registration': 'GJ-01-CZ-4108',
                'mode': 'BRTS',
                'route_id': 'BRTS-8D',
                'capacity': 75,
                'is_electric': True,
                'latitude': 23.0785,
                'longitude': 72.5825,
                'speed_kmh': 29.0,
                'current_location_name': 'Sabarmati Power House Median',
                'next_stop_id': 'BRTS-01',
                'delay_minutes': 0,
                'status': 'ON_TIME',
            },
            {
                'vehicle_id': 'BRTS-BUS-115',
                'registration': 'GJ-01-CZ-4115',
                'mode': 'BRTS',
                'route_id': 'BRTS-1D',
                'capacity': 75,
                'is_electric': True,
                'latitude': 23.0270,
                'longitude': 72.5075,
                'speed_kmh': 34.0,
                'current_location_name': 'Iskcon Flyover Median',
                'next_stop_id': 'BRTS-13',
                'delay_minutes': 0,
                'status': 'ON_TIME',
            }
        ]

    def get_service_alerts(self) -> List[Dict[str, Any]]:
        return [
            {
                'title': 'Janmarg High-Frequency Electric Bus Service',
                'description': 'Route 1D (RTO - Bopal) and 8D (Chandkheda - Maninagar) operating with 100% Zero-Emission Electric AC Buses.',
                'severity': 'INFO',
                'status': 'ACTIVE',
                'delay_impact_mins': 0,
            }
        ]
