import time
from django.utils import timezone
from ..models import (
    TransportAgency, TransportMode, Stop, Route, RouteStop,
    Trip, TripStopTime, Transfer, Vehicle, VehiclePosition,
    FareRule, ServiceAlert, DataSource, DataSyncLog, PlaceLandmark
)
from ..providers.metro_provider import MetroProvider
from ..providers.brts_provider import BRTSProvider
from ..providers.amts_provider import AMTSProvider
from ..providers.rail_provider import RailProvider
from ..providers.gandhinagar_bus_provider import GandhinagarBusProvider
from ..providers.gandhinagar_electric_bus_provider import GandhinagarElectricBusProvider, DemoGandhinagarElectricBusProvider
from ..providers.gift_city_bus_provider import GiftCityBusProvider

class SyncService:
    """Ingests and synchronizes all Ahmedabad, Gandhinagar & GIFT City transit providers."""

    @classmethod
    def sync_all(cls) -> dict:
        start_time = time.time()
        stats = {
            'agencies': 0,
            'modes': 0,
            'stops': 0,
            'routes': 0,
            'route_stops': 0,
            'trips': 0,
            'transfers': 0,
            'fare_rules': 0,
            'vehicles': 0,
            'alerts': 0,
            'landmarks': 0,
        }

        # 1. Transport Modes
        modes_data = [
            ('METRO', 'Ahmedabad/Gandhinagar Metro', 'train', '#2563EB', 38.0, 2),
            ('BRTS', 'Janmarg BRTS', 'bus', '#F97316', 28.0, 1),
            ('AMTS', 'AMTS City Bus', 'bus', '#059669', 20.0, 2),
            ('GANDHINAGAR_ELECTRIC_BUS', 'Gandhinagar Electric Bus (GGTSL)', 'bus', '#059669', 32.0, 2),
            ('RAIL', 'Indian Railways Intercity', 'train', '#7C3AED', 45.0, 3),
            ('BUS', 'GIFT Shuttle / Regional Bus / GSRTC', 'bus', '#0D9488', 30.0, 2),
            ('WALK', 'Pedestrian Walk', 'footprints', '#64748B', 4.5, 0),
        ]
        for code, name, icon, color, speed, boarding in modes_data:
            TransportMode.objects.update_or_create(
                code=code,
                defaults={
                    'name': name,
                    'icon': icon,
                    'color': color,
                    'average_speed_kmh': speed,
                    'boarding_time_mins': boarding,
                }
            )
            stats['modes'] += 1

        # 2. Providers
        providers = [
            ('METRO', MetroProvider()),
            ('BRTS', BRTSProvider()),
            ('AMTS', AMTSProvider()),
            ('GGTSL', GandhinagarElectricBusProvider()),
            ('GIFT_TRANSIT', GiftCityBusProvider()),
            ('RAIL', RailProvider()),
            ('GND_TRANSIT', GandhinagarBusProvider()),
        ]

        for p_code, provider in providers:
            # Agency
            agency_info = provider.get_agency_info()
            agency, _ = TransportAgency.objects.update_or_create(
                code=agency_info['code'],
                defaults={
                    'name': agency_info['name'],
                    'full_name': agency_info.get('full_name', ''),
                    'website': agency_info.get('website', ''),
                    'helpline': agency_info.get('helpline', ''),
                    'fare_policy': agency_info.get('fare_policy', ''),
                    'is_active': True,
                }
            )
            stats['agencies'] += 1

            # Data Source Tracking with PM-eBus Sewa / Fleet Dynamics
            fleet_total = agency_info.get('fleet_total', 0)
            fleet_deployed = agency_info.get('fleet_deployed', 0)
            fleet_active = agency_info.get('fleet_active', 0)

            ds, _ = DataSource.objects.update_or_create(
                source_name=f"{agency.name} Feed",
                defaults={
                    'provider_type': f"{p_code}_PROVIDER",
                    'status': 'OPERATIONAL',
                    'last_sync': timezone.now(),
                    'is_live_telemetry': False, # Demo simulated until official token
                    'freshness_seconds': 15,
                    'fleet_total': fleet_total,
                    'fleet_deployed': fleet_deployed,
                    'fleet_active': fleet_active,
                    'last_updated_feed': timezone.now(),
                }
            )

            # Stops
            for s_data in provider.get_stops():
                Stop.objects.update_or_create(
                    stop_id=s_data['stop_id'],
                    defaults={
                        'name': s_data['name'],
                        'name_gu': s_data.get('name_gu', ''),
                        'name_hi': s_data.get('name_hi', ''),
                        'code': s_data.get('code', ''),
                        'city': s_data.get('city', 'AHMEDABAD'),
                        'agency': agency,
                        'mode': s_data['mode'],
                        'latitude': s_data['latitude'],
                        'longitude': s_data['longitude'],
                        'is_interchange': s_data.get('is_interchange', False),
                        'wheelchair_accessible': s_data.get('wheelchair_accessible', True),
                        'has_elevator': s_data.get('has_elevator', False),
                        'has_escalator': s_data.get('has_escalator', False),
                        'has_parking': s_data.get('has_parking', False),
                        'has_restroom': s_data.get('has_restroom', False),
                        'platform_info': s_data.get('platform_info', ''),
                    }
                )
                stats['stops'] += 1

            # Routes
            for r_data in provider.get_routes():
                route, _ = Route.objects.update_or_create(
                    route_id=r_data['route_id'],
                    defaults={
                        'route_number': r_data['route_number'],
                        'route_name': r_data['route_name'],
                        'agency': agency,
                        'mode': r_data['mode'],
                        'color': r_data.get('color', '#2563EB'),
                        'text_color': r_data.get('text_color', '#FFFFFF'),
                        'is_electric': r_data.get('is_electric', False),
                        'headway_peak_mins': r_data.get('headway_peak_mins', 6),
                        'headway_offpeak_mins': r_data.get('headway_offpeak_mins', 12),
                        'first_trip_time': r_data.get('first_trip_time', '06:00'),
                        'last_trip_time': r_data.get('last_trip_time', '22:30'),
                        'average_speed_kmh': r_data.get('average_speed_kmh', 25.0),
                        'reliability_score': r_data.get('reliability_score', 0.9),
                        'is_active': True,
                    }
                )
                stats['routes'] += 1

                # Generate scheduled trips for this route across operating hours
                if not Trip.objects.filter(route=route).exists():
                    try:
                        f_hour = int(r_data.get('first_trip_time', '06:00').split(':')[0])
                        l_hour = int(r_data.get('last_trip_time', '22:00').split(':')[0])
                        headway = r_data.get('headway_peak_mins', 10)
                        trip_idx = 1
                        for hr in range(f_hour, l_hour + 1):
                            for mn in range(0, 60, max(headway, 10)):
                                dep_str = f"{hr:02d}:{mn:02d}"
                                arr_str = f"{(hr + 1) % 24:02d}:{(mn + 25) % 60:02d}"
                                Trip.objects.create(
                                    trip_id=f"TRIP-{route.route_id}-{trip_idx}",
                                    route=route,
                                    service_id='DAILY',
                                    headsign=route.route_name.split('↔')[-1].strip(),
                                    departure_time_start=dep_str,
                                    arrival_time_end=arr_str,
                                    is_active=True,
                                )
                                trip_idx += 1
                                stats['trips'] += 1
                    except Exception:
                        pass

            # Route Stops
            for rs_data in provider.get_route_stops():
                route = Route.objects.filter(route_id=rs_data['route_id']).first()
                stop = Stop.objects.filter(stop_id=rs_data['stop_id']).first()
                if route and stop:
                    RouteStop.objects.update_or_create(
                        route=route,
                        sequence=rs_data['sequence'],
                        defaults={
                            'stop': stop,
                            'distance_from_start_km': rs_data.get('distance_from_start_km', 0.0),
                            'travel_time_mins': rs_data.get('travel_time_mins', 2.0),
                            'is_major_stop': rs_data.get('is_major_stop', False),
                        }
                    )
                    stats['route_stops'] += 1

            # Transfers
            for t_data in provider.get_transfers():
                from_s = Stop.objects.filter(stop_id=t_data['from_stop_id']).first()
                to_s = Stop.objects.filter(stop_id=t_data['to_stop_id']).first()
                if from_s and to_s:
                    Transfer.objects.update_or_create(
                        from_stop=from_s,
                        to_stop=to_s,
                        defaults={
                            'transfer_type': t_data.get('transfer_type', 'PEDESTRIAN_LINK'),
                            'walking_distance_m': t_data.get('walking_distance_m', 100),
                            'walking_time_mins': t_data.get('walking_time_mins', 2.0),
                            'transfer_penalty_mins': t_data.get('transfer_penalty_mins', 2.0),
                            'instructions': t_data.get('instructions', ''),
                            'from_platform': t_data.get('from_platform', ''),
                            'to_platform': t_data.get('to_platform', ''),
                            'stand_number': t_data.get('stand_number', ''),
                            'transfer_buffer_mins': t_data.get('transfer_buffer_mins', 3.0),
                            'is_step_free': t_data.get('is_step_free', True),
                        }
                    )
                    stats['transfers'] += 1

            # Fare Rules
            fare_info = provider.get_fare_rules()
            FareRule.objects.update_or_create(
                agency=agency,
                mode=fare_info['mode'],
                defaults={
                    'base_fare': fare_info.get('base_fare', 5.0),
                    'base_distance_km': fare_info.get('base_distance_km', 2.0),
                    'per_km_rate': fare_info.get('per_km_rate', 1.2),
                    'max_fare': fare_info.get('max_fare', 25.0),
                    'fare_brackets': fare_info.get('fare_brackets', []),
                    'is_active': True,
                }
            )
            stats['fare_rules'] += 1

            # Vehicles & Live Positions
            for v_data in provider.get_vehicles():
                route = Route.objects.filter(route_id=v_data.get('route_id')).first()
                vehicle, _ = Vehicle.objects.update_or_create(
                    vehicle_id=v_data['vehicle_id'],
                    defaults={
                        'registration': v_data.get('registration', ''),
                        'registration_number': v_data.get('registration_number', ''),
                        'fleet_number': v_data.get('fleet_number', ''),
                        'agency': agency,
                        'operator': v_data.get('operator', agency.name),
                        'mode': v_data['mode'],
                        'vehicle_type': v_data.get('vehicle_type', '9M_ELECTRIC_AC' if v_data.get('is_electric') else 'AMTS_BUS'),
                        'current_route': route,
                        'capacity': v_data.get('capacity', 45),
                        'vehicle_capacity': v_data.get('vehicle_capacity', 45),
                        'is_electric': v_data.get('is_electric', True),
                        'battery_status': v_data.get('battery_status', 85 if v_data.get('is_electric') else None),
                        'charging_status': v_data.get('charging_status', 'DISCHARGING'),
                        'air_conditioned': v_data.get('air_conditioned', True),
                        'accessible': v_data.get('accessible', True),
                        'is_wheelchair_accessible': v_data.get('is_wheelchair_accessible', True),
                        'is_active': True,
                    }
                )
                stats['vehicles'] += 1

                # Calculate default coordinates near stop or route
                v_lat = v_data.get('latitude')
                v_lng = v_data.get('longitude')
                next_s = Stop.objects.filter(stop_id=v_data.get('next_stop_id')).first()

                if v_lat is None or v_lng is None:
                    if next_s:
                        v_lat = next_s.latitude + 0.002
                        v_lng = next_s.longitude + 0.002
                    elif route and route.route_stops.exists():
                        first_rs = route.route_stops.first()
                        v_lat = first_rs.stop.latitude
                        v_lng = first_rs.stop.longitude
                    else:
                        v_lat = 23.2285
                        v_lng = 72.6610

                VehiclePosition.objects.update_or_create(
                    vehicle=vehicle,
                    defaults={
                        'latitude': v_lat,
                        'longitude': v_lng,
                        'speed_kmh': v_data.get('speed_kmh', 32.0 if vehicle.is_electric else 25.0),
                        'heading': v_data.get('heading', 45.0),
                        'current_location_name': v_data.get('current_location_name', 'Gandhinagar-GIFT EV Concourse' if vehicle.is_electric else 'Ahmedabad Transit Corridor'),
                        'next_stop': next_s,
                        'eta_next_stop_seconds': v_data.get('eta_next_stop_seconds', 180),
                        'delay_minutes': v_data.get('delay_minutes', 0),
                        'status': v_data.get('status', 'ON_TIME'),
                        'telemetry_type': 'ESTIMATED' if vehicle.is_electric else 'SCHEDULED',
                        'is_live': False, # Demo simulation
                        'data_source': 'DEMO_SIMULATION (GGTSL / PM-eBus Sewa Mock)' if vehicle.is_electric else 'DEMO_SIMULATION',
                        'last_updated': timezone.now(),
                    }
                )

            # Service Alerts
            for a_data in provider.get_service_alerts():
                a_route = Route.objects.filter(route_id=a_data.get('route_id')).first()
                a_stop = Stop.objects.filter(stop_id=a_data.get('affected_stop_id')).first()
                ServiceAlert.objects.update_or_create(
                    title=a_data['title'],
                    agency=agency,
                    defaults={
                        'route': a_route,
                        'affected_stop': a_stop,
                        'description': a_data['description'],
                        'alert_type': a_data.get('alert_type', 'GENERAL_NOTICE'),
                        'alternative_advice': a_data.get('alternative_advice', ''),
                        'severity': a_data.get('severity', 'INFO'),
                        'status': a_data.get('status', 'ACTIVE'),
                        'delay_impact_mins': a_data.get('delay_impact_mins', 0),
                        'valid_from': timezone.now(),
                    }
                )
                stats['alerts'] += 1

            # Update DataSource record count
            ds.records_count = Stop.objects.filter(agency=agency).count() + Route.objects.filter(agency=agency).count()
            ds.save()

            DataSyncLog.objects.create(
                source=ds,
                status='SUCCESS',
                records_processed=ds.records_count,
                records_updated=ds.records_count,
                duration_ms=int((time.time() - start_time) * 1000),
                details=f"Synchronized {agency.name} complete network."
            )

        # 3. Comprehensive Ahmedabad, Gandhinagar (Sectors 1-35) & GIFT City Landmarks
        landmarks_data = [
            # --- Ahmedabad Hubs ---
            ('Sabarmati Railway Station', 'સાબરમતી રેલવે સ્ટેશન', 'AHMEDABAD', 'RAILWAY_STATION', 'Dharamnagar, Sabarmati, Ahmedabad', 23.0762, 72.5855, ['Sabarmati Junction', 'SBT', 'Sabarmati Stn', 'Sabarmati']),
            ('Kalupur Railway Station', 'કાલુપુર રેલવે સ્ટેશન', 'AHMEDABAD', 'RAILWAY_STATION', 'Ahmedabad Central Railway Station, Kalupur', 23.0245, 72.6000, ['Ahmedabad Junction', 'ADI', 'Kalupur Station', 'Ahmedabad Railway Station', 'Kalupur']),
            ('Sardar Vallabhbhai Patel International Airport (SVPIA)', 'અમદાવાદ એરપોર્ટ', 'AHMEDABAD', 'AIRPORT', 'Hansol, Ahmedabad', 23.0735, 72.6265, ['Airport', 'AMD', 'SVPIA', 'Ahmedabad Airport', 'Airport T1', 'Airport T2']),
            ('Narendra Modi Stadium (Motera)', 'નરેન્દ્ર મોદી સ્ટેડિયમ (મોટેરા)', 'AHMEDABAD', 'TOURIST', 'Motera, Sabarmati, Ahmedabad', 23.0915, 72.5975, ['Motera Stadium', 'Motera', 'Cricket Stadium', 'Narendra Modi Stadium']),
            ('Gujarat Science City', 'ગુજરાત સાયન્સ સિટી', 'AHMEDABAD', 'TOURIST', 'Science City Road, Sola, Ahmedabad', 23.0780, 72.5030, ['Science City', 'Science City Ahmedabad', 'Aquatic Gallery', 'Robotics Gallery']),
            ('Iskcon Temple & Cross Road', 'ઇસ્કોન મંદિર', 'AHMEDABAD', 'COMMERCIAL', 'SG Highway, Satellite, Ahmedabad', 23.0280, 72.5070, ['Iskcon', 'Iskcon Circle', 'SG Highway Iskcon', 'Iskcon Cross Road']),
            ('Prahlad Nagar Corporate Road & Garden', 'પ્રહલાદ નગર', 'AHMEDABAD', 'COMMERCIAL', 'Prahlad Nagar, SG Highway, Ahmedabad', 23.0120, 72.5080, ['Prahladnagar', 'Corporate Road', 'Prahlad Nagar Garden', 'Prahladnagar SG Highway']),
            ('Thaltej Metro Interchange', 'થલતેજ મેટ્રો', 'AHMEDABAD', 'METRO_STATION', 'Thaltej Cross Road, SG Highway, Ahmedabad', 23.0525, 72.5165, ['Thaltej', 'Thaltej Char Rasta', 'Thaltej Gam', 'Thaltej Metro']),
            ('Gujarat University', 'ગુજરાત યુનિવર્સિટી', 'AHMEDABAD', 'EDUCATION', 'Navrangpura, Ahmedabad', 23.0381, 72.5482, ['GU', 'Gujarat Univ', 'Navrangpura']),
            ('IIM Ahmedabad / Vastrapur Lake', 'આઈઆઈએમ અમદાવાદ / વસ્ત્રાપુર', 'AHMEDABAD', 'EDUCATION', 'Vastrapur, Ahmedabad', 23.0315, 72.5460, ['IIM-A', 'IIM Vastrapur', 'IIM Ahmedabad', 'Vastrapur Lake', 'Alpha One Mall']),
            ('Ashram Road / Income Tax Circle', 'આશ્રમ રોડ / ઇન્કમટેક્સ સર્કલ', 'AHMEDABAD', 'COMMERCIAL', 'Income Tax Circle to Nehru Bridge, Ahmedabad', 23.0415, 72.5710, ['Income Tax Circle', 'Ashram Road', 'Ashram Rd', 'Income Tax']),
            ('Law Garden & C.G. Road', 'લો ગાર્ડન અને સી.જી. રોડ', 'AHMEDABAD', 'COMMERCIAL', 'Ellisbridge / Navrangpura, Ahmedabad', 23.0275, 72.5590, ['Law Garden', 'CG Road', 'C.G. Road', 'Navrangpura']),
            ('Kankaria Lake & Zoo', 'કાંકરિયા લેક', 'AHMEDABAD', 'TOURIST', 'Maninagar, Ahmedabad', 23.0070, 72.5990, ['Kankaria', 'Kankaria Lake', 'Kankaria Zoo', 'Kankaria Carnival']),
            ('Ranip GSRTC Central Bus Stand', 'રાણીપ બસ ટર્મિનલ', 'AHMEDABAD', 'BRTS_HUB', 'Ranip, Ahmedabad', 23.0545, 72.5740, ['Ranip', 'Ranip Bus Stand', 'Ranip Terminal', 'Ranip GSRTC']),
            ('Gujarat High Court (Sola SG Highway)', 'ગુજરાત હાઇકોર્ટ (સોલા)', 'AHMEDABAD', 'GOVERNMENT', 'S.G. Highway, Sola, Ahmedabad', 23.0810, 72.5270, ['High Court', 'Gujarat High Court', 'Sola Civil Hospital', 'Sola High Court']),
            ('Bopal Approach & SP Ring Road', 'બોપલ એપ્રોચ', 'AHMEDABAD', 'RESIDENTIAL', 'SP Ring Road, Bopal, Ahmedabad', 23.0310, 72.4850, ['Bopal', 'South Bopal', 'Bopal Cross Road', 'Bopal Ring Road']),
            ('Gota Cross Road (SG Highway)', 'ગોટા ચાર રસ્તા', 'AHMEDABAD', 'COMMERCIAL', 'SG Highway, Gota, Ahmedabad', 23.0980, 72.5350, ['Gota', 'Gota SG Highway', 'Gota Cross Road', 'Vandematram']),
            ('Tapovan Circle (Visat Highway)', 'તપોવન સર્કલ', 'AHMEDABAD', 'COMMERCIAL', 'Visat-Gandhinagar Highway, Ahmedabad', 23.1290, 72.5950, ['Tapovan', 'Visat Circle', 'Tapovan Hub', 'Tapovan Circle']),
            ('Vishwakarma Government Engineering College (VGEC)', 'વિશ્વકર્મા સરકારી એન્જિનિયરિંગ કોલેજ (VGEC)', 'AHMEDABAD', 'EDUCATION', 'Opp. Sangath Mall, Visat-Gandhinagar Highway, Chandkheda, Ahmedabad', 23.1090, 72.5950, ['VGEC', 'Vishwakarma College', 'Vishwakarma Government Engineering College', 'Vishwakrma College', 'VGEC Chandkheda', 'GTU Chandkheda', 'Vishwakarma', 'vishwakarma government engineering college', 'Vishwakarma Engineering College']),
            ('Vishwakarma College Metro Station', 'વિશ્વકર્મા કોલેજ મેટ્રો સ્ટેશન', 'AHMEDABAD', 'METRO_STATION', 'Visat-Gandhinagar Highway, Chandkheda, Ahmedabad', 23.1090, 72.5950, ['Vishwakarma Metro', 'Vishwakarma College Metro', 'Vishwakrma College Metro Station', 'VKCL', 'VGEC Metro', 'Chandkheda Metro', 'Vishwakarma Station', 'Vishwakrma Metro']),
            ('Chandkheda', 'ચાંદખેડા', 'AHMEDABAD', 'RESIDENTIAL', 'Chandkheda, Ahmedabad', 23.1150, 72.5890, ['Chandkheda Road', 'IOC Road']),
            ('Shivranjani Cross Road BRTS', 'શિવરંજની ક્રોસ રોડ', 'AHMEDABAD', 'BRTS_HUB', 'Shivranjani, Satellite, Ahmedabad', 23.0245, 72.5312, ['Shivranjani', 'Shivranjani BRTS', 'Satellite']),
            ('Maninagar Railway Station & Hub', 'મણિનગર રેલવે સ્ટેશન', 'AHMEDABAD', 'RAILWAY_STATION', 'Maninagar, Ahmedabad', 22.9975, 72.6020, ['Maninagar Station', 'Maninagar', 'Maninagar South']),
            ('Lal Darwaja Central Terminus', 'લાલ દરવાજા ટર્મિનસ', 'AHMEDABAD', 'BRTS_HUB', 'Lal Darwaja, Old City, Ahmedabad', 23.0250, 72.5820, ['Lal Darwaja', 'Bhadra', 'Old City']),
            ('Geeta Mandir Central ST Bus Stand', 'ગીતા મંદિર એસટી બસ સ્ટેન્ડ', 'AHMEDABAD', 'BRTS_HUB', 'Geeta Mandir, Ahmedabad', 23.0145, 72.5890, ['Geeta Mandir', 'Gita Mandir', 'Central Bus Station Ahmedabad']),
            ('Vastral Gam Metro Terminal', 'વસ્ત્રાલ ગામ મેટ્રો', 'AHMEDABAD', 'METRO_STATION', 'Vastral Gam, Ahmedabad', 22.9990, 72.6680, ['Vastral', 'Vastral Gam', 'Vastral Metro']),
            ('Naroda GIDC & Patiya', 'નરોડા જીઆઇડીસી', 'AHMEDABAD', 'COMMERCIAL', 'Naroda GIDC, Ahmedabad', 23.0680, 72.6580, ['Naroda Patiya', 'Naroda', 'Naroda GIDC']),
            ('Sarkhej Roza Heritage Complex', 'સરખેજ રોઝા', 'AHMEDABAD', 'TOURIST', 'Sarkhej, Ahmedabad', 22.9810, 72.5010, ['Sarkhej', 'Sarkhej Roza', 'Sanand Cross Road']),
            ('Sabarmati Riverfront Promenade', 'સાબરમતી રિવરફ્રન્ટ', 'AHMEDABAD', 'TOURIST', 'Riverfront West, Ahmedabad', 23.0345, 72.5780, ['Riverfront', 'Sabarmati Riverfront', 'Riverfront West']),
            ('Paldi Cross Road', 'પાલડી ચાર રસ્તા', 'AHMEDABAD', 'RESIDENTIAL', 'Paldi, Ahmedabad', 23.0160, 72.5695, ['Paldi Metro', 'Paldi Circle', 'Paldi']),

            # --- GIFT City Prime Nodes ---
            ('GIFT City FinTech Zone', 'ગિફ્ટ સિટી ફિનટેક ઝોન', 'GIFT_CITY', 'COMMERCIAL', 'Gujarat International Finance Tec-City, Gandhinagar', 23.1600, 72.6840, ['GIFT', 'GIFT City', 'GIFT SEZ', 'GIFT FinTech Hub', 'FinTech City', 'GIFT CBD']),
            ('GIFT Tower 1 & 2 (World Trade Center)', 'ગિફ્ટ ટાવર ૧ અને ૨ (ડબલ્યુટીસી)', 'GIFT_CITY', 'COMMERCIAL', 'Road 1C, Zone 1, GIFT City', 23.1630, 72.6865, ['GIFT One', 'GIFT Two', 'WTC GIFT City', 'GIFT Tower 1', 'GIFT Tower 2', 'World Trade Center GIFT']),
            ('GIFT City Club & Grand Omaxe', 'ગિફ્ટ સિટી ક્લબ', 'GIFT_CITY', 'COMMERCIAL', 'Block 49, Sector 2, GIFT City', 23.1550, 72.6810, ['GIFT Club', 'Grand Omaxe GIFT', 'GIFT City Club', 'Omaxe GIFT City']),
            ('GIFT Multi-Services SEZ Processing Zone', 'ગિફ્ટ મલ્ટી-સર્વિસિસ સેઝ', 'GIFT_CITY', 'COMMERCIAL', 'SEZ Zone, GIFT City', 23.1610, 72.6870, ['GIFT SEZ', 'Multi-Services SEZ', 'GIFT Tech Zone']),
            ('GIFT International Bullion Exchange (IIBX)', 'ગિફ્ટ ઇન્ટરનેશનલ બુલિયન એક્સચેન્જ (IIBX)', 'GIFT_CITY', 'COMMERCIAL', 'FinTech Hub, GIFT City', 23.1640, 72.6850, ['IIBX', 'Bullion Exchange', 'Diamond Tower GIFT', 'India International Bullion Exchange']),
            ('GIFT City Metro Station', 'ગિફ્ટ સિટી મેટ્રો સ્ટેશન', 'GIFT_CITY', 'METRO_STATION', 'GIFT City Transit Concourse, Gandhinagar', 23.1600, 72.6840, ['GIFT Metro', 'GIFT City Metro', 'GIFT Station']),
            ('GIFT City EV Smart Shuttle Terminal', 'ગિફ્ટ સિટી ઇવી શટલ ટર્મિનલ', 'GIFT_CITY', 'BRTS_HUB', 'Central Terminal, GIFT City', 23.1605, 72.6835, ['GIFT Shuttle', 'GIFT EV Shuttle', 'GIFT Bus Terminal']),
            ('GIFT Domestic Tariff Area (DTA)', 'ગિફ્ટ ડીટીએ બિઝનેસ હબ', 'GIFT_CITY', 'COMMERCIAL', 'DTA Zone, GIFT City', 23.1580, 72.6820, ['GIFT DTA', 'DTA Business Hub']),

            # --- Gandhinagar Landmarks ---
            ('Gandhinagar Capital Railway Station', 'ગાંધીનગર કેપિટલ રેલવે સ્ટેશન', 'GANDHINAGAR', 'RAILWAY_STATION', 'Sector 14, Gandhinagar', 23.2480, 72.6490, ['Gandhinagar Station', 'GNC', 'Gandhinagar Capital', 'The Leela Gandhinagar']),
            ('Gandhinagar City Center', 'ગાંધીનગર સિટી સેન્ટર', 'GANDHINAGAR', 'GOVERNMENT', 'Sector 10, Gandhinagar Capital City', 23.2200, 72.6500, ['Gandhinagar City', 'Capital City', 'Gandhinagar']),
            ('Mahatma Mandir Convention Centre', 'મહાત્મા મંદિર કન્વેન્શન સેન્ટર', 'GANDHINAGAR', 'COMMERCIAL', 'Sector 13C, Gandhinagar', 23.2590, 72.6520, ['Mahatma Mandir', 'Mahatma Mandir Convention', 'Mahatma Mandir Metro']),
            ('Infocity Metro Station & IT Hub', 'ઇન્ફોસિટી મેટ્રો અને આઇટી પાર્ક', 'GANDHINAGAR', 'METRO_STATION', 'Infocity Complex, GH-0, Gandhinagar', 23.1965, 72.6288, ['Infocity', 'Infocity Gandhinagar', 'Infocity IT Park', 'Infocity Metro', 'Infocity Hub']),
            ('Dholakuva Circle & Metro Station', 'ધોળકુવા સર્કલ મેટ્રો સ્ટેશન', 'GANDHINAGAR', 'METRO_STATION', 'Dholakuva Circle, Gandhinagar', 23.2087, 72.6253, ['Dholakuva', 'Dholakuva Circle', 'Dholakuva Metro']),
            ('Akshardham Temple (Sector 20)', 'અક્ષરધામ મંદિર (સેક્ટર ૨૦)', 'GANDHINAGAR', 'TOURIST', 'Sector 20, J Road, Gandhinagar', 23.2300, 72.6730, ['Akshardham', 'Swaminarayan Akshardham', 'Akshardham Gandhinagar', 'Akshardham Temple']),
            ('Gujarat New Sachivalaya (Secretariat)', 'ગુજરાત નવું સચિવાલય', 'GANDHINAGAR', 'GOVERNMENT', 'Sector 10, Gandhinagar', 23.2320, 72.6480, ['Sachivalaya', 'Secretariat', 'Swarnim Sankul', 'Vidhan Sabha', 'New Sachivalaya']),
            ('Pathikashram Central Bus Station (GSRTC)', 'પથિકાશ્રમ સેન્ટ્રલ બસ સ્ટેશન', 'GANDHINAGAR', 'BRTS_HUB', 'Sector 11, Gandhinagar', 23.2200, 72.6480, ['Pathikashram', 'Gandhinagar Bus Stand', 'GSRTC Gandhinagar', 'Pathikashram Bus']),
            ('GNLU (Gujarat National Law University)', 'જીએનએલયુ (ઇન્ટરચેન્જ)', 'GANDHINAGAR', 'METRO_STATION', 'Attalika Avenue, Knowledge Corridor, Bhaijipura / Koba', 23.1540, 72.6500, ['GNLU', 'GNLU Metro Interchange', 'GNLU Gandhinagar', 'GNLU Metro']),
            ('Pandit Deendayal Energy University (PDEU)', 'પંડિત દીનદયાળ એનર્જી યુનિવર્સિટી (પીડીઇયુ)', 'GANDHINAGAR', 'EDUCATION', 'Knowledge Corridor, Raisan, Gandhinagar', 23.1610, 72.6650, ['PDPU', 'PDEU', 'Pandit Deendayal Energy University', 'PDPU Metro']),
            ('DA-IICT (Dhirubhai Ambani Institute)', 'ડીએ-આઇઆઇસીટી ગાંધીનગર', 'GANDHINAGAR', 'EDUCATION', 'Near Indroda Circle, Gandhinagar', 23.1880, 72.6280, ['DAIICT', 'DA-IICT', 'Dhirubhai Ambani Institute']),
            ('IIT Gandhinagar (Palaj Campus)', 'આઈઆઈટી ગાંધીનગર', 'GANDHINAGAR', 'EDUCATION', 'Palaj, Gandhinagar', 23.2130, 72.6840, ['IITGN', 'IIT Gandhinagar', 'Palaj Campus']),
            ('NIFT Gandhinagar', 'નિફ્ટ ગાંધીનગર', 'GANDHINAGAR', 'EDUCATION', 'GH-0 Road, Infocity, Gandhinagar', 23.1980, 72.6290, ['NIFT', 'NIFT Gandhinagar']),
            ('National Forensic Sciences University (NFSU)', 'નેશનલ ફોરેન્સિક સાયન્સિસ યુનિવર્સિટી', 'GANDHINAGAR', 'EDUCATION', 'Sector 9, Gandhinagar', 23.2180, 72.6410, ['NFSU', 'GFSU', 'Forensic University']),
            ('Indroda Dinosaur & Nature Fossil Park', 'ઇન્દ્રોડા નેચર પાર્ક', 'GANDHINAGAR', 'TOURIST', 'Indroda, Gandhinagar', 23.1950, 72.6720, ['Indroda Park', 'Zoo Gandhinagar', 'Dinosaur Park Gandhinagar']),
            ('Gandhinagar Sector 21 Shopping Centre', 'સેક્ટર ૨૧ શોપિંગ સેન્ટર', 'GANDHINAGAR', 'COMMERCIAL', 'Sector 21, Gandhinagar', 23.2380, 72.6420, ['Sector 21', 'Sec 21', 'Sector 21 Market', 'Sector 21 Shopping Center']),
            ('Kudasan Commercial Hub', 'કુડાસણ કોમર્શિયલ હબ', 'GANDHINAGAR', 'COMMERCIAL', 'Kudasan Cross Road, Gandhinagar', 23.1780, 72.6320, ['Kudasan', 'Kudasan Cross Road']),
            ('Koba Circle Transit Junction', 'કોબા સર્કલ', 'GANDHINAGAR', 'COMMERCIAL', 'Koba, Airport-Gandhinagar Highway', 23.1550, 72.6100, ['Koba', 'Koba Circle', 'Koba Highway']),
            ('Raysan Metro Station', 'રાયસણ મેટ્રો', 'GANDHINAGAR', 'METRO_STATION', 'Raysan, Gandhinagar', 23.1700, 72.6410, ['Raysan', 'Raysan Metro']),
            ('Randesan Metro Station', 'રાંદેસણ મેટ્રો', 'GANDHINAGAR', 'METRO_STATION', 'Randesan, Gandhinagar', 23.1810, 72.6360, ['Randesan', 'Randesan Metro']),
            ('Sargasan Cross Road', 'સરગાસણ ચાર રસ્તા', 'GANDHINAGAR', 'COMMERCIAL', 'Sargasan, SG Highway, Gandhinagar', 23.2050, 72.6180, ['Sargasan', 'Sargasan Cross Road']),
        ]

        # Add all 35 Gandhinagar Sectors (Sectors 1 to 35) systematically
        sector_coords = {
            1: (23.2350, 72.6640), 2: (23.2400, 72.6680), 3: (23.2450, 72.6720), 4: (23.2500, 72.6760),
            5: (23.2550, 72.6790), 6: (23.2600, 72.6750), 7: (23.2550, 72.6700), 8: (23.2500, 72.6650),
            9: (23.2450, 72.6600), 10: (23.2420, 72.6580), 11: (23.2200, 72.6480), 12: (23.2250, 72.6450),
            13: (23.2300, 72.6420), 14: (23.2480, 72.6490), 15: (23.2420, 72.6380), 16: (23.2350, 72.6350),
            17: (23.2280, 72.6320), 18: (23.2220, 72.6300), 19: (23.2150, 72.6280), 20: (23.2300, 72.6730),
            21: (23.2380, 72.6420), 22: (23.2450, 72.6350), 23: (23.2520, 72.6300), 24: (23.2580, 72.6250),
            25: (23.2650, 72.6200), 26: (23.2700, 72.6250), 27: (23.2750, 72.6300), 28: (23.2800, 72.6350),
            29: (23.2850, 72.6400), 30: (23.2900, 72.6450), 31: (23.2950, 72.6500), 32: (23.3000, 72.6550),
            33: (23.3050, 72.6600), 34: (23.3100, 72.6650), 35: (23.3150, 72.6700),
        }

        for sec_num, (s_lat, s_lng) in sector_coords.items():
            landmarks_data.append((
                f"Gandhinagar Sector {sec_num}",
                f"ગાંધીનગર સેક્ટર {sec_num}",
                'GANDHINAGAR',
                'RESIDENTIAL',
                f"Sector {sec_num}, Gandhinagar",
                s_lat,
                s_lng,
                [f"Sector {sec_num}", f"Sec {sec_num}", f"Gandhinagar Sec {sec_num}"]
            ))

        for name, name_gu, city, cat, addr, lat, lng, aliases in landmarks_data:
            PlaceLandmark.objects.update_or_create(
                name=name,
                defaults={
                    'name_gu': name_gu,
                    'city': city,
                    'category': cat,
                    'address': addr,
                    'latitude': lat,
                    'longitude': lng,
                    'is_popular': True,
                    'aliases': aliases,
                }
            )
            stats['landmarks'] += 1

        return stats
