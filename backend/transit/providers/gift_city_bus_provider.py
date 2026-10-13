from typing import List, Dict, Any
from .base import TransportProviderBase

class GiftCityBusProvider(TransportProviderBase):
    """
    GIFT City Internal Smart Transit & Autonomous Electric Shuttle Provider.
    Dedicated zero-emission internal circular network connecting GIFT Tower 1 & 2,
    IFSC Building, GIFT Club, WTC, Multi-Services SEZ, and Residential Concourse.
    """

    def get_agency_info(self) -> Dict[str, Any]:
        return {
            'code': 'GIFT_TRANSIT',
            'name': 'GIFT City Smart Transit & Autonomous EV Shuttles',
            'full_name': 'Gujarat International Finance Tec-City (GIFT City) Smart Mobility Division',
            'website': 'https://giftgujarat.in/smart-mobility',
            'helpline': '079-61708300',
            'fare_policy': 'Complimentary Internal Smart Transit for GIFT City Workforce & Visitors',
            'is_electric_only': True,
        }

    def get_stops(self) -> List[Dict[str, Any]]:
        return [
            {
                'stop_id': 'GIFT-STOP-CONCOURSE',
                'name': 'GIFT Central Multimodal Concourse',
                'name_gu': 'ગિફ્ટ સેન્ટ્રલ મલ્ટિમોડલ કોનકોર્સ',
                'name_hi': 'गिफ्ट सेंट्रल मल्टीमॉडल कॉनकोर्स',
                'code': 'GIFT-CONC',
                'city': 'GIFT_CITY',
                'mode': 'BUS',
                'latitude': 23.1610,
                'longitude': 72.6845,
                'is_interchange': True,
                'wheelchair_accessible': True,
                'platform_info': 'Autonomous Shuttle Bay 1 & 2',
            },
            {
                'stop_id': 'GIFT-STOP-TOWERS',
                'name': 'GIFT One & Two / WTC Plaza',
                'name_gu': 'ગિફ્ટ વન અને ટુ / ડબ્લ્યુટીસી પ્લાઝા',
                'name_hi': 'गिफ्ट वन व टू / डब्ल्यूटीसी प्लाजा',
                'code': 'GIFT-T12',
                'city': 'GIFT_CITY',
                'mode': 'BUS',
                'latitude': 23.1638,
                'longitude': 72.6868,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'platform_info': 'North Concourse Entrance',
            },
            {
                'stop_id': 'GIFT-STOP-IFSC',
                'name': 'International Financial Services Centre (IFSC)',
                'name_gu': 'ઇન્ટરનેશનલ ફાઇનાન્સિયલ સર્વિસીસ સેન્ટર',
                'name_hi': 'अंतर्राष्ट्रीय वित्तीय सेवा केंद्र (आईएफएससी)',
                'code': 'GIFT-IFSC',
                'city': 'GIFT_CITY',
                'mode': 'BUS',
                'latitude': 23.1585,
                'longitude': 72.6852,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'platform_info': 'IFSC East Portico',
            },
            {
                'stop_id': 'GIFT-STOP-CLUB',
                'name': 'GIFT Club & Grand Mercure Enclave',
                'name_gu': 'ગિફ્ટ ક્લબ અને ગ્રાન્ડ મર્ક્યુર',
                'name_hi': 'गिफ्ट क्लब और ग्रैंड मर्क्यूर',
                'code': 'GIFT-CLUB',
                'city': 'GIFT_CITY',
                'mode': 'BUS',
                'latitude': 23.1548,
                'longitude': 72.6812,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'platform_info': 'Club Gate Station',
            },
            {
                'stop_id': 'GIFT-STOP-SEZ',
                'name': 'Multi-Services SEZ & Processing Zone',
                'name_gu': 'મલ્ટી-સર્વિસીસ સેઝ અને પ્રોસેસિંગ ઝોન',
                'name_hi': 'मल्टी-सर्विसेज सेज व प्रोसेसिंग जोन',
                'code': 'GIFT-SEZ',
                'city': 'GIFT_CITY',
                'mode': 'BUS',
                'latitude': 23.1665,
                'longitude': 72.6830,
                'is_interchange': False,
                'wheelchair_accessible': True,
                'platform_info': 'SEZ Processing Gate 2',
            },
        ]

    def get_routes(self) -> List[Dict[str, Any]]:
        return [
            {
                'route_id': 'GIFT-R-SHUTTLE-01',
                'route_number': 'GIFT-AC-1',
                'route_name': 'GIFT Autonomous Circular: Central Concourse ↔ Towers ↔ IFSC ↔ GIFT Club ↔ SEZ',
                'mode': 'BUS',
                'color': '#0EA5E9', # Sky Blue
                'text_color': '#FFFFFF',
                'is_circular': True,
                'headway_peak_mins': 5,
                'headway_offpeak_mins': 8,
                'first_trip_time': '06:00',
                'last_trip_time': '23:30',
                'average_speed_kmh': 24.0,
                'reliability_score': 0.99,
                'is_electric': True,
            }
        ]

    def get_route_stops(self) -> List[Dict[str, Any]]:
        stops = [
            ('GIFT-STOP-CONCOURSE', 0.0, 0.0, True),
            ('GIFT-STOP-TOWERS', 0.6, 1.5, True),
            ('GIFT-STOP-SEZ', 1.3, 2.0, False),
            ('GIFT-STOP-IFSC', 2.1, 2.0, True),
            ('GIFT-STOP-CLUB', 2.8, 2.0, False),
            ('GIFT-STOP-CONCOURSE', 3.5, 2.0, True),
        ]
        return [
            {
                'route_id': 'GIFT-R-SHUTTLE-01',
                'stop_id': stop_id,
                'sequence': idx + 1,
                'distance_from_start_km': dist,
                'travel_time_mins': travel,
                'is_major_stop': maj,
            }
            for idx, (stop_id, dist, travel, maj) in enumerate(stops)
        ]

    def get_transfers(self) -> List[Dict[str, Any]]:
        return [
            {
                'from_stop_id': 'GIFT-STOP-CONCOURSE',
                'to_stop_id': 'GGTSL-STOP-GIFT-MAIN',
                'transfer_type': 'GIFT_SHUTTLE_TRANSFER',
                'walking_distance_m': 30,
                'walking_time_mins': 0.5,
                'transfer_penalty_mins': 0.5,
                'instructions': 'Cross the air-conditioned concourse to GGTSL Gandhinagar Electric Bus Bay 1',
                'from_platform': 'Bay 2',
                'to_platform': 'Bay 1',
                'is_step_free': True,
                'is_sheltered': True,
            }
        ]

    def get_fare_rules(self) -> Dict[str, Any]:
        return {
            'mode': 'BUS',
            'base_fare': 0.0,
            'base_distance_km': 10.0,
            'per_km_rate': 0.0,
            'max_fare': 0.0,
            'fare_brackets': [],
        }

    def get_vehicles(self) -> List[Dict[str, Any]]:
        return [
            {
                'vehicle_id': 'GIFT-EV-01',
                'registration': 'GJ-18-EV-9001',
                'registration_number': 'GJ-18-EV-9001',
                'fleet_number': 'GIFT-EV-1',
                'operator': 'GIFT City Smart Transit',
                'mode': 'BUS',
                'vehicle_type': 'GIFT_AUTONOMOUS_EV',
                'route_id': 'GIFT-R-SHUTTLE-01',
                'capacity': 24,
                'vehicle_capacity': 24,
                'is_electric': True,
                'battery_status': 94,
                'charging_status': 'DISCHARGING',
                'air_conditioned': True,
                'accessible': True,
                'is_wheelchair_accessible': True,
                'is_active': True,
            }
        ]

    def get_service_alerts(self) -> List[Dict[str, Any]]:
        return []
