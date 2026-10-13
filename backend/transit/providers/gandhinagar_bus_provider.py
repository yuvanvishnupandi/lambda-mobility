from typing import List, Dict, Any
from .base import TransportProviderBase

class GandhinagarBusProvider(TransportProviderBase):
    """
    Gandhinagar City Bus, GSRTC Regional Express & GIFT City Electric Shuttle Provider.
    Covers:
    - GIFT City Dedicated Electric Shuttle: Tapovan Circle ↔ Infocity ↔ GIFT City FinTech Hub
    - Gandhinagar Capital Circular: Mahatma Mandir ↔ Akshardham ↔ Sector 21 ↔ Infocity ↔ GIFT City
    - Intercity Express: Ranip GSRTC Hub ↔ Sabarmati ↔ Visat ↔ Infocity ↔ Pathikashram Bus Station
    - Airport GIFT Express (Feeder): Ahmedabad Airport ↔ Motera ↔ Tapovan ↔ GIFT City
    """

    def get_agency_info(self) -> Dict[str, Any]:
        return {
            'code': 'GND_TRANSIT',
            'name': 'Gandhinagar Transit & GIFT Shuttle',
            'full_name': 'Gandhinagar Municipal Corporation Transit & GIFT City Shuttles',
            'website': 'https://gandhinagarmunicipal.com',
            'helpline': '079-23220440',
            'fare_policy': 'Flat & Distance Stage Fare: ₹10 (0-5 km), ₹15 (5-12 km), ₹25 (12-25 km), ₹30 (Airport-GIFT Express)',
        }

    def get_stops(self) -> List[Dict[str, Any]]:
        return [
            # Tapovan Hub
            {
                'stop_id': 'GND-BUS-TPVN',
                'name': 'Tapovan Circle Transit Hub',
                'name_gu': 'તપોવન સર્કલ ટ્રાન્ઝિટ હબ',
                'name_hi': 'तपोवन सर्कल ट्रांजिट हब',
                'code': 'TPVNHUB',
                'city': 'AHMEDABAD',
                'mode': 'BUS',
                'latitude': 23.1290,
                'longitude': 72.5950,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'platform_info': 'Stand 1 (GIFT Shuttle) / Stand 2 (Gandhinagar)',
            },
            # Infocity Hub
            {
                'stop_id': 'GND-BUS-INFO',
                'name': 'Infocity Bus Terminal',
                'name_gu': 'ઇન્ફોસિટી બસ ટર્મિનલ',
                'name_hi': 'इन्फोसिटी बस टर्मिनल',
                'code': 'INFOHUB',
                'city': 'GANDHINAGAR',
                'mode': 'BUS',
                'latitude': 23.2280,
                'longitude': 72.6600,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'platform_info': 'Bay A (GIFT City Express) / Bay B (Sector Circulars)',
            },
            # GIFT City Stops
            {
                'stop_id': 'GND-BUS-GIFT-HUB',
                'name': 'GIFT City Main Bus Terminal & FinTech Concourse',
                'name_gu': 'ગિફ્ટ સિટી મેઇન બસ ટર્મિનલ',
                'name_hi': 'गिफ्ट सिटी मुख्य बस टर्मिनल',
                'code': 'GIFTHUB',
                'city': 'GIFT_CITY',
                'mode': 'BUS',
                'latitude': 23.1600,
                'longitude': 72.6840,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'platform_info': 'Bay 1 (Ahmedabad Express) / Bay 2 (Gandhinagar)',
            },
            {
                'stop_id': 'GND-BUS-GIFT-T1',
                'name': 'GIFT Tower 1 & 2 / World Trade Center',
                'name_gu': 'ગિફ્ટ ટાવર ૧ અને ૨',
                'name_hi': 'गिफ्ट टॉवर 1 और 2',
                'code': 'GIFTT1',
                'city': 'GIFT_CITY',
                'mode': 'BUS',
                'latitude': 23.1630,
                'longitude': 72.6865,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'platform_info': 'North Concourse Drop-off',
            },
            {
                'stop_id': 'GND-BUS-GIFT-CLUB',
                'name': 'GIFT City Club & Residential Zone',
                'name_gu': 'ગિફ્ટ સિટી ક્લબ',
                'name_hi': 'गिफ्ट सिटी क्लब',
                'code': 'GIFTCLB',
                'city': 'GIFT_CITY',
                'mode': 'BUS',
                'latitude': 23.1550,
                'longitude': 72.6810,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'platform_info': 'Residential Gate Stop',
            },
            # Gandhinagar Sectors
            {
                'stop_id': 'GND-BUS-SEC21',
                'name': 'Sector 21 Shopping Centre & Bus Stand',
                'name_gu': 'સેક્ટર ૨૧ બસ સ્ટેન્ડ',
                'name_hi': 'सेक्टर 21 बस स्टैंड',
                'code': 'SEC21B',
                'city': 'GANDHINAGAR',
                'mode': 'BUS',
                'latitude': 23.2380,
                'longitude': 72.6420,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'platform_info': 'Stand 1-4',
            },
            {
                'stop_id': 'GND-BUS-AKSHAR',
                'name': 'Akshardham Temple Bus Stand',
                'name_gu': 'અક્ષરધામ મંદિર બસ સ્ટેન્ડ',
                'name_hi': 'अक्षरधाम मंदिर बस स्टैंड',
                'code': 'AKSHAR',
                'city': 'GANDHINAGAR',
                'mode': 'BUS',
                'latitude': 23.2300,
                'longitude': 72.6730,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'platform_info': 'Visitor Plaza Stop',
            },
            {
                'stop_id': 'GND-BUS-PATHIK',
                'name': 'Pathikashram Central Bus Station (GSRTC Gandhinagar)',
                'name_gu': 'પથિકાશ્રમ સેન્ટ્રલ બસ સ્ટેશન',
                'name_hi': 'पथिकाश्रम सेंट्रल बस स्टेशन',
                'code': 'PATHIK',
                'city': 'GANDHINAGAR',
                'mode': 'BUS',
                'latitude': 23.2200,
                'longitude': 72.6480,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'platform_info': 'Platform 1-16 (Intercity GSRTC Hub)',
            },
            {
                'stop_id': 'GND-BUS-SACHIV',
                'name': 'Gujarat New Sachivalaya (Secretariat)',
                'name_gu': 'નવું સચિવાલય (ગાંધીનગર)',
                'name_hi': 'नया सचिवालय (गांधीनगर)',
                'code': 'SACHIV',
                'city': 'GANDHINAGAR',
                'mode': 'BUS',
                'latitude': 23.2420,
                'longitude': 72.6580,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'platform_info': 'Gate 1 & Gate 4 Stops',
            },
            {
                'stop_id': 'GND-BUS-MMND',
                'name': 'Mahatma Mandir Convention Centre Stand',
                'name_gu': 'મહાત્મા મંદિર બસ સ્ટેન્ડ',
                'name_hi': 'महात्मा मंदिर बस स्टैंड',
                'code': 'MMNDB',
                'city': 'GANDHINAGAR',
                'mode': 'BUS',
                'latitude': 23.2500,
                'longitude': 72.6520,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'platform_info': 'Convention Gate Drop-off',
            },
        ]

    def get_routes(self) -> List[Dict[str, Any]]:
        return [
            {
                'route_id': 'GIFT-SHUTTLE-01',
                'route_number': 'GIFT Electric Shuttle',
                'route_name': 'Tapovan Circle ↔ Infocity ↔ GIFT City FinTech Hub',
                'mode': 'BUS',
                'color': '#0D9488',
                'text_color': '#FFFFFF',
                'headway_peak_mins': 10,
                'headway_offpeak_mins': 20,
                'first_trip_time': '06:30',
                'last_trip_time': '22:00',
                'average_speed_kmh': 35.0,
                'reliability_score': 0.96,
            },
            {
                'route_id': 'GND-CIRCULAR-01',
                'route_number': 'Gandhinagar Circular 1',
                'route_name': 'Mahatma Mandir ↔ Sachivalaya ↔ Sector 21 ↔ Infocity ↔ GIFT City',
                'mode': 'BUS',
                'color': '#059669',
                'text_color': '#FFFFFF',
                'headway_peak_mins': 15,
                'headway_offpeak_mins': 30,
                'first_trip_time': '06:45',
                'last_trip_time': '21:45',
                'average_speed_kmh': 30.0,
                'reliability_score': 0.92,
            },
            {
                'route_id': 'GSRTC-EXPRESS-01',
                'route_number': 'Ahmedabad - Gandhinagar Express',
                'route_name': 'Ranip Bus Hub ↔ Sabarmati ↔ Tapovan ↔ Infocity ↔ Pathikashram',
                'mode': 'BUS',
                'color': '#EA580C',
                'text_color': '#FFFFFF',
                'headway_peak_mins': 12,
                'headway_offpeak_mins': 25,
                'first_trip_time': '06:00',
                'last_trip_time': '22:30',
                'average_speed_kmh': 34.0,
                'reliability_score': 0.90,
            },
            {
                'route_id': 'AIRPORT-GIFT-EXP',
                'route_number': 'Airport - GIFT Express',
                'route_name': 'Ahmedabad Airport (SVP) ↔ Motera ↔ Tapovan ↔ GIFT City',
                'mode': 'BUS',
                'color': '#2563EB',
                'text_color': '#FFFFFF',
                'headway_peak_mins': 20,
                'headway_offpeak_mins': 40,
                'first_trip_time': '05:30',
                'last_trip_time': '23:30',
                'average_speed_kmh': 40.0,
                'reliability_score': 0.95,
            },
        ]

    def get_route_stops(self) -> List[Dict[str, Any]]:
        result = []

        # Route 1: GIFT-SHUTTLE-01 (Tapovan -> Infocity -> GIFT City)
        s1 = ['GND-BUS-TPVN', 'GND-BUS-INFO', 'GND-BUS-GIFT-HUB', 'GND-BUS-GIFT-T1']
        t1 = [0.0, 14.0, 10.0, 3.0]
        d1 = [0.0, 11.2, 8.5, 1.2]
        cum_dist = 0.0
        for seq, sid in enumerate(s1, start=1):
            cum_dist += d1[seq - 1]
            result.append({
                'route_id': 'GIFT-SHUTTLE-01',
                'stop_id': sid,
                'sequence': seq,
                'distance_from_start_km': round(cum_dist, 2),
                'travel_time_mins': t1[seq - 1],
                'is_major_stop': True,
            })

        # Route 2: GND-CIRCULAR-01
        s2 = ['GND-BUS-MMND', 'GND-BUS-SACHIV', 'GND-BUS-SEC21', 'GND-BUS-AKSHAR', 'GND-BUS-INFO', 'GND-BUS-GIFT-HUB']
        t2 = [0.0, 3.0, 5.0, 6.0, 7.0, 10.0]
        d2 = [0.0, 1.8, 2.5, 3.2, 3.8, 8.5]
        cum_dist = 0.0
        for seq, sid in enumerate(s2, start=1):
            cum_dist += d2[seq - 1]
            result.append({
                'route_id': 'GND-CIRCULAR-01',
                'stop_id': sid,
                'sequence': seq,
                'distance_from_start_km': round(cum_dist, 2),
                'travel_time_mins': t2[seq - 1],
                'is_major_stop': sid in ['GND-BUS-MMND', 'GND-BUS-SEC21', 'GND-BUS-INFO', 'GND-BUS-GIFT-HUB'],
            })

        # Route 3: GSRTC-EXPRESS-01
        s3 = ['BRTS-01', 'AMTS-01', 'GND-BUS-TPVN', 'GND-BUS-INFO', 'GND-BUS-PATHIK']
        t3 = [0.0, 8.0, 12.0, 14.0, 6.0]
        d3 = [0.0, 4.5, 7.8, 11.2, 3.5]
        cum_dist = 0.0
        for seq, sid in enumerate(s3, start=1):
            cum_dist += d3[seq - 1]
            result.append({
                'route_id': 'GSRTC-EXPRESS-01',
                'stop_id': sid,
                'sequence': seq,
                'distance_from_start_km': round(cum_dist, 2),
                'travel_time_mins': t3[seq - 1],
                'is_major_stop': True,
            })

        # Route 4: AIRPORT-GIFT-EXP
        s4 = ['AMTS-06', 'METRO-NS-01', 'GND-BUS-TPVN', 'GND-BUS-GIFT-HUB', 'GND-BUS-GIFT-T1']
        t4 = [0.0, 10.0, 8.0, 14.0, 3.0]
        d4 = [0.0, 6.0, 5.0, 12.0, 1.2]
        cum_dist = 0.0
        for seq, sid in enumerate(s4, start=1):
            cum_dist += d4[seq - 1]
            result.append({
                'route_id': 'AIRPORT-GIFT-EXP',
                'stop_id': sid,
                'sequence': seq,
                'distance_from_start_km': round(cum_dist, 2),
                'travel_time_mins': t4[seq - 1],
                'is_major_stop': True,
            })

        return result

    def get_transfers(self) -> List[Dict[str, Any]]:
        return [
            {
                'from_stop_id': 'GND-BUS-INFO',
                'to_stop_id': 'METRO-GND-04',
                'transfer_type': 'METRO_SHUTTLE',
                'walking_distance_m': 100,
                'walking_time_mins': 1.5,
                'transfer_penalty_mins': 2.0,
                'instructions': 'Walk 100m from Infocity Bus Bay A to Infocity Metro Concourse (Gate 1).',
                'from_platform': 'Bus Bay A',
                'to_platform': 'Metro Platform 1/2',
                'stand_number': 'Bay A',
                'transfer_buffer_mins': 3.0,
                'is_step_free': True,
            },
            {
                'from_stop_id': 'GND-BUS-GIFT-HUB',
                'to_stop_id': 'METRO-GIFT-01',
                'transfer_type': 'METRO_SHUTTLE',
                'walking_distance_m': 80,
                'walking_time_mins': 1.0,
                'transfer_penalty_mins': 1.5,
                'instructions': 'Direct covered concourse link between GIFT City Main Bus Hub and GIFT City Metro Station.',
                'from_platform': 'Terminal Concourse',
                'to_platform': 'Metro Platform 1/2',
                'stand_number': 'Bay 1',
                'transfer_buffer_mins': 2.0,
                'is_step_free': True,
            },
            {
                'from_stop_id': 'GND-BUS-TPVN',
                'to_stop_id': 'METRO-NS-18',
                'transfer_type': 'METRO_SHUTTLE',
                'walking_distance_m': 90,
                'walking_time_mins': 1.5,
                'transfer_penalty_mins': 2.0,
                'instructions': 'Walk 90m from Tapovan Circle Bus Stand to Tapovan Circle Metro Station Gate 2.',
                'from_platform': 'Bus Stand 1',
                'to_platform': 'Metro Platform 1/2',
                'stand_number': 'Stand 1',
                'transfer_buffer_mins': 2.5,
                'is_step_free': True,
            },
            {
                'from_stop_id': 'AMTS-06',
                'to_stop_id': 'METRO-NS-01',
                'transfer_type': 'METRO_SHUTTLE',
                'walking_distance_m': 120,
                'walking_time_mins': 2.0,
                'transfer_penalty_mins': 3.0,
                'instructions': 'Airport Express direct transfer to Motera Stadium Metro Interchange.',
                'from_platform': 'Terminal 1/2 Arrival Stand',
                'to_platform': 'Metro Platform 1 (Toward Gandhinagar)',
                'stand_number': 'Airport Express Bay',
                'transfer_buffer_mins': 4.0,
                'is_step_free': True,
            },
            {
                'from_stop_id': 'GND-BUS-SEC21',
                'to_stop_id': 'METRO-GND-06',
                'transfer_type': 'METRO_BUS',
                'walking_distance_m': 200,
                'walking_time_mins': 3.0,
                'transfer_penalty_mins': 2.5,
                'instructions': 'Walk 200m from Sector 21 City Stand to Sector 10A / Sachivalaya Metro Station.',
                'from_platform': 'Sector 21 City Stand',
                'to_platform': 'Metro Platform 1/2',
                'stand_number': 'Stand 1',
                'transfer_buffer_mins': 3.5,
                'is_step_free': True,
            },
        ]

    def get_fare_rules(self) -> Dict[str, Any]:
        return {
            'agency_code': 'GND_TRANSIT',
            'mode': 'BUS',
            'base_fare': 10.0,
            'base_distance_km': 5.0,
            'per_km_rate': 1.0,
            'max_fare': 30.0,
            'fare_brackets': [
                {'km': 5.0, 'fare': 10},
                {'km': 12.0, 'fare': 15},
                {'km': 25.0, 'fare': 25},
                {'km': 99.0, 'fare': 30},
            ]
        }

    def get_vehicles(self) -> List[Dict[str, Any]]:
        return [
            {
                'vehicle_id': 'GIFT-EV-SHUTTLE-01',
                'registration': 'GJ-18-EV-2044',
                'mode': 'BUS',
                'route_id': 'GIFT-SHUTTLE-01',
                'capacity': 45,
                'is_electric': True,
                'latitude': 23.1800,
                'longitude': 72.6700,
                'speed_kmh': 36.0,
                'current_location_name': 'Koba-GIFT Highway Corridor',
                'next_stop_id': 'GND-BUS-GIFT-HUB',
                'delay_minutes': 0,
                'status': 'ON_TIME',
            },
            {
                'vehicle_id': 'AIRPORT-EXP-02',
                'registration': 'GJ-01-EXP-5501',
                'mode': 'BUS',
                'route_id': 'AIRPORT-GIFT-EXP',
                'capacity': 50,
                'is_electric': True,
                'latitude': 23.1100,
                'longitude': 72.6100,
                'speed_kmh': 42.0,
                'current_location_name': 'Motera-Hansol Link Road',
                'next_stop_id': 'GND-BUS-TPVN',
                'delay_minutes': 0,
                'status': 'ON_TIME',
            }
        ]

    def get_service_alerts(self) -> List[Dict[str, Any]]:
        return [
            {
                'title': 'GIFT City Electric Shuttles Running at 10-Min Headway',
                'description': 'Dedicated electric shuttle service running smoothly between Tapovan, Infocity, and GIFT City FinTech Hub.',
                'severity': 'INFO',
                'status': 'ACTIVE',
                'delay_impact_mins': 0,
            }
        ]
