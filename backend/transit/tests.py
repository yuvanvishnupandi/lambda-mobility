from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from transit.models import Stop, Route, Vehicle, VehiclePosition, ServiceAlert
from transit.services.sync_service import SyncService
from transit.services.routing_engine import MultimodalRoutingEngine
from transit.services.geocoding_service import GeocodingService
from transit.services.eta_engine import ETAEngine
from transit.services.fare_engine import FareEngine

class TransitPlannerTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Seed complete transit dataset
        SyncService.sync_all()

    def test_database_seeding_complete(self):
        """Verify all agencies, stops, routes, and landmarks are populated."""
        self.assertGreaterEqual(Stop.objects.count(), 30)
        self.assertGreaterEqual(Route.objects.count(), 5)
        self.assertTrue(Stop.objects.filter(mode='METRO').exists())
        self.assertTrue(Stop.objects.filter(mode='BRTS').exists())
        self.assertTrue(Stop.objects.filter(mode='AMTS').exists())

    def test_sabarmati_to_thaltej_multimodal_journey(self):
        """Test primary user scenario: Sabarmati Railway Station -> Thaltej."""
        response = self.client.get('/api/transit/journey/plan/', {
            'from': 'Sabarmati Railway Station',
            'to': 'Thaltej',
            'departure': 'now'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('routes', data)
        self.assertGreaterEqual(len(data['routes']), 1)

        # Check fastest route properties
        fastest_route = data['routes'][0]
        self.assertIn('duration_minutes', fastest_route)
        self.assertIn('fare', fastest_route)
        self.assertIn('steps', fastest_route)
        self.assertIn('tag_label', fastest_route)
        self.assertGreater(fastest_route['duration_minutes'], 0)

    def test_airport_to_thaltej_journey(self):
        """Test airport express multimodal route."""
        response = self.client.get('/api/transit/journey/plan/', {
            'from': 'Sardar Vallabhbhai Patel International Airport (SVPIA)',
            'to': 'Thaltej',
            'preference': 'fastest'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(len(data['routes']) >= 1)

    def test_nearby_transport_lookup(self):
        """Test geospatial nearby stops lookup from user coordinates."""
        # Ashram Road / Income Tax coordinates
        response = self.client.get('/api/transit/stops/nearby/', {
            'lat': 23.0415,
            'lng': 72.5710,
            'radius': 1.5
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('nearby_stops', data)
        self.assertGreaterEqual(len(data['nearby_stops']), 1)
        # Verify distance and walking duration are calculated
        first_stop = data['nearby_stops'][0]
        self.assertIn('distance_m', first_stop)
        self.assertIn('walking_time_mins', first_stop)

    def test_station_departure_board(self):
        """Test live vs scheduled departure board for Old High Court Metro Interchange."""
        response = self.client.get('/api/transit/departures/', {
            'stop_id': 'METRO-INT-01',
            'limit': 5
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('departures', data)
        self.assertGreaterEqual(len(data['departures']), 1)
        first_dep = data['departures'][0]
        self.assertIn('status', first_dep) # LIVE or SCHEDULED
        self.assertIn('eta_minutes', first_dep)

    def test_delay_aware_rerouting_detection(self):
        """Test that vehicle delays are detected and dynamic alternatives are suggested."""
        result = MultimodalRoutingEngine.plan_journey(
            from_name='Sabarmati Railway Station',
            to_name='Thaltej',
            preference='fastest'
        )
        # Should have routes calculated
        self.assertTrue(len(result['routes']) >= 1)
        # Check if delay callout structure is valid
        if result['delay_alert_callout']:
            self.assertIn('alert_message', result['delay_alert_callout'])

    def test_accessibility_mode(self):
        """Test wheelchair accessibility filtering."""
        response = self.client.get('/api/transit/journey/plan/', {
            'from': 'Sabarmati Railway Station',
            'to': 'Thaltej',
            'wheelchair': 'true'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(len(data['routes']) >= 1)

    def test_location_search_autocomplete(self):
        """Test location search autocomplete with Ahmedabad landmarks."""
        response = self.client.get('/api/transit/search/', {'q': 'Sabarmati'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertGreaterEqual(data['count'], 1)

    def test_live_vehicles_api(self):
        """Test live vehicle tracking API."""
        response = self.client.get('/api/transit/vehicles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('vehicles', data)
        self.assertGreaterEqual(len(data['vehicles']), 1)

    def test_transit_status_api(self):
        """Test data source status and freshness monitor."""
        response = self.client.get('/api/transit/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['system_status'], 'OPERATIONAL')
        self.assertIn('sources', data)

    def test_ai_journey_assistant_api(self):
        """Test AI natural language journey parser and planner."""
        response = self.client.post('/api/journey/ai-assist/', {
            'query': 'How do I reach GIFT City from Sabarmati before 9 AM?'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('parsed_intent', data)
        self.assertIn('assistant_response', data)
        self.assertIn('sabarmati', data['parsed_intent']['from_location'].lower())
        self.assertIn('gift city', data['parsed_intent']['to_location'].lower())

    def test_route_comparison_matrix_api(self):
        """Test side-by-side multimodal candidate comparison matrix."""
        response = self.client.get('/api/journey/compare/', {
            'from': 'Sabarmati Railway Station',
            'to': 'GIFT City'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('comparison_matrix', data)
        self.assertGreaterEqual(len(data['comparison_matrix']), 1)

    def test_admin_network_monitor_api(self):
        """Test Admin Ops tri-city network health monitor."""
        response = self.client.get('/api/transit/admin-monitor/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['network_status'], 'OPERATIONAL')
        self.assertIn('regions', data)
        self.assertEqual(len(data['regions']), 3)

    def test_electric_bus_routes_api(self):
        """Test Gandhinagar Electric Bus routes API."""
        response = self.client.get('/api/electric-bus/routes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('routes', data)
        self.assertGreaterEqual(data['count'], 10)
        # Check first route attributes
        r = data['routes'][0]
        self.assertTrue(r['is_electrified'])
        self.assertEqual(r['mode'], 'GANDHINAGAR_ELECTRIC_BUS')
        self.assertIn('stops', r)
        self.assertTrue(r['ac_available'])
        self.assertTrue(r['low_floor'])

    def test_electric_bus_stops_api(self):
        """Test Gandhinagar Electric Bus stops API with sector filtering."""
        response = self.client.get('/api/electric-bus/stops/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('stops', data)
        self.assertGreaterEqual(data['count'], 20)

        # Sector 21 search
        res_sec21 = self.client.get('/api/electric-bus/stops/', {'sector': '21'})
        self.assertEqual(res_sec21.status_code, status.HTTP_200_OK)
        sec21_data = res_sec21.json()
        self.assertGreaterEqual(sec21_data['count'], 1)

    def test_electric_bus_vehicles_api(self):
        """Test live GPS telemetry and battery health feed for electric buses."""
        response = self.client.get('/api/electric-bus/vehicles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('vehicles', data)
        self.assertIn('fleet_summary', data)
        self.assertGreaterEqual(data['fleet_summary']['fleet_total'], 50)
        if data['vehicles']:
            v = data['vehicles'][0]
            self.assertTrue(v['is_electric'])
            self.assertIn('battery_soc_pct', v)
            self.assertIn('provenance', v)

    def test_electric_bus_stats_dynamic_api(self):
        """Test dynamic PM-eBus Sewa fleet and environmental impact metrics."""
        response = self.client.get('/api/electric-bus/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('fleet_metrics', data)
        self.assertIn('environmental_impact', data)
        self.assertIn('clean_km_today', data['environmental_impact'])
        self.assertIn('co2_saved_kg_today', data['environmental_impact'])
        self.assertGreater(data['environmental_impact']['co2_saved_kg_today'], 0)

    def test_gandhinagar_cross_city_journey_with_electric_bus(self):
        """Test cross-city route planning incorporating Gandhinagar Electric Bus."""
        plan = MultimodalRoutingEngine.plan_journey(
            from_name='Mahatma Mandir',
            to_name='GIFT City',
            preference='fastest'
        )
        self.assertIn('routes', plan)
        self.assertGreaterEqual(len(plan['routes']), 1)
        # Verify that an electric bus or metro option is provided
        has_electric_or_transit = any(
            any(s.get('mode') in ['GANDHINAGAR_ELECTRIC_BUS', 'METRO', 'BUS'] for s in r['steps'])
            for r in plan['routes']
        )
        self.assertTrue(has_electric_or_transit)

    def test_transfer_risk_analysis(self):
        """Test tight transfer risk calculation and protection status."""
        plan = MultimodalRoutingEngine.plan_journey(
            from_name='Sabarmati Railway Station',
            to_name='GIFT City',
            departure_time_str='08:15',
            preference='fastest'
        )
        self.assertIn('routes', plan)
        routes = plan['routes']
        self.assertTrue(len(routes) >= 1)
        for r in routes:
            for s in r['steps']:
                if s.get('step_type') == 'TRANSFER':
                    self.assertIn('is_tight', s)
                    self.assertIn('protection_status', s)

    def test_traccar_client_gps_ingestion(self):
        """Test direct smartphone / OsmAnd GPS packet ingestion for electric buses."""
        # 1. Test GET query param ingestion
        response = self.client.get('/api/traccar/client/', {
            'id': 'GGTSL-EB-101',
            'lat': '23.2156',
            'lon': '72.6369',
            'speed': '34.5',
            'bearing': '180.0',
            'batt': '88',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['status'], 'OK')
        self.assertEqual(data['event']['vehicle_id'], 'GGTSL-EB-101')
        self.assertEqual(data['event']['battery_soc_pct'], 88)
        self.assertEqual(data['event']['speed_kmh'], 34.5)
        self.assertTrue(data['event']['is_electric'])

        # Verify database update
        pos = VehiclePosition.objects.get(vehicle__vehicle_id='GGTSL-EB-101')
        self.assertAlmostEqual(pos.latitude, 23.2156, places=4)
        self.assertAlmostEqual(pos.longitude, 72.6369, places=4)
        self.assertEqual(pos.telemetry_type, 'REAL_TIME')

    def test_traccar_webhook_ingestion(self):
        """Test Traccar Server forwarding webhook ingestion."""
        payload = {
            "device": {
                "id": 101,
                "uniqueId": "GGTSL-EB-102",
                "name": "GGTSL Electric Bus 102"
            },
            "position": {
                "latitude": 23.2210,
                "longitude": 72.6640,
                "speed": 29.0,
                "course": 90.0,
                "attributes": {
                    "batteryLevel": 79
                }
            }
        }
        response = self.client.post('/api/traccar/webhook/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['status'], 'OK')
        self.assertEqual(data['processed_count'], 1)
        self.assertEqual(data['events'][0]['vehicle_id'], 'GGTSL-EB-102')
        self.assertEqual(data['events'][0]['battery_soc_pct'], 79)

    def test_traccar_simulator_and_status(self):
        """Test Traccar simulation step and status APIs."""
        # Status check
        res_status = self.client.get('/api/traccar/status/')
        self.assertEqual(res_status.status_code, status.HTTP_200_OK)
        status_data = res_status.json()
        self.assertEqual(status_data['status'], 'OPERATIONAL')
        self.assertIn('client_ingest_url', status_data)

        # Simulator step
        res_step = self.client.post('/api/traccar/simulate/', {'action': 'step'}, format='json')
        self.assertEqual(res_step.status_code, status.HTTP_200_OK)
        step_data = res_step.json()
        self.assertEqual(step_data['status'], 'OK')
        self.assertGreaterEqual(step_data['updated_vehicles'], 2)

    def test_infocity_gps_nearest_metro_not_gnlu(self):
        """CRITICAL: User at Infocity / Dholakuva circle MUST get Infocity/Dholakuva Metro, NEVER GNLU."""
        # Infocity GPS (23.1965, 72.6288)
        response = self.client.get('/api/location/debug/nearest/', {
            'latitude': 23.1965,
            'longitude': 72.6288,
            'transportType': 'METRO_STATION',
            'radius': 10.0
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('results', data)
        self.assertTrue(len(data['results']) >= 1)

        # The closest metro stop MUST be Infocity or Dholakuva Circle, NOT GNLU
        closest = data['results'][0]
        self.assertIn('Infocity', closest['name'])
        self.assertLess(closest['distanceMeters'], 500) # Close to user

        # GNLU must be > 4000 meters away
        gnlu_matches = [r for r in data['results'] if 'GNLU' in r['name']]
        if gnlu_matches:
            self.assertGreater(gnlu_matches[0]['distanceMeters'], 4000)

    def test_dholakuva_circle_gps_nearest_metro(self):
        """User at Dholakuva Circle MUST get Dholakuva Circle as closest."""
        # Dholakuva Circle GPS (23.2087, 72.6253)
        response = self.client.get('/api/location/debug/nearest/', {
            'latitude': 23.2087,
            'longitude': 72.6253,
            'transportType': 'METRO_STATION',
            'radius': 10.0
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(len(data['results']) >= 1)
        closest = data['results'][0]
        self.assertIn('Dholakuva', closest['name'])
        self.assertLess(closest['distanceMeters'], 300)

    def test_gnlu_gps_nearest_metro(self):
        """User actually at GNLU Campus (23.1540, 72.6500) gets GNLU Interchange."""
        response = self.client.get('/api/location/debug/nearest/', {
            'latitude': 23.1540,
            'longitude': 72.6500,
            'transportType': 'METRO_STATION',
            'radius': 10.0
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(len(data['results']) >= 1)
        closest = data['results'][0]
        self.assertIn('GNLU', closest['name'])
        self.assertLess(closest['distanceMeters'], 400)

    def test_gift_city_gps_nearest_transport(self):
        """User at GIFT City FinTech (23.1600, 72.6840) gets GIFT City Metro / Bus."""
        response = self.client.get('/api/location/debug/nearest/', {
            'latitude': 23.1600,
            'longitude': 72.6840,
            'transportType': 'ALL',
            'radius': 10.0
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(len(data['results']) >= 1)
        closest = data['results'][0]
        self.assertTrue('GIFT' in closest['name'])
        self.assertLess(closest['distanceMeters'], 500)

    def test_geocoding_service_find_nearby_stops_walking_metrics(self):
        """Verify GeocodingService calculates walking distances and durations properly."""
        stops = GeocodingService.find_nearby_stops(
            lat=23.1965,
            lng=72.6288,
            radius_km=3.0,
            mode='METRO'
        )
        self.assertTrue(len(stops) >= 1)
        for s in stops:
            self.assertIn('distance_m', s)
            self.assertIn('walking_distance_m', s)
            self.assertIn('walking_time_mins', s)
            self.assertGreaterEqual(s['walking_distance_m'], s['distance_m'])
            self.assertGreaterEqual(s['walking_time_mins'], 1)

    def test_gandhinagar_electric_bus_fare_calculation(self):
        """Verify real stage fare calculation for Gandhinagar Electric Bus network."""
        # 0 - 3 km -> ₹5
        self.assertEqual(FareEngine.calculate_leg_fare('GANDHINAGAR_ELECTRIC_BUS', 2.0), 5.0)
        self.assertEqual(FareEngine.calculate_leg_fare('GANDHINAGAR_ELECTRIC_BUS', 3.0), 5.0)
        # 3 - 8 km -> ₹10
        self.assertEqual(FareEngine.calculate_leg_fare('GANDHINAGAR_ELECTRIC_BUS', 5.5), 10.0)
        self.assertEqual(FareEngine.calculate_leg_fare('GANDHINAGAR_ELECTRIC_BUS', 8.0), 10.0)
        # 8 - 15 km -> ₹15
        self.assertEqual(FareEngine.calculate_leg_fare('GANDHINAGAR_ELECTRIC_BUS', 12.0), 15.0)
        self.assertEqual(FareEngine.calculate_leg_fare('GANDHINAGAR_ELECTRIC_BUS', 15.0), 15.0)
        # 15 - 25 km -> ₹25
        self.assertEqual(FareEngine.calculate_leg_fare('GANDHINAGAR_ELECTRIC_BUS', 18.0), 25.0)
        self.assertEqual(FareEngine.calculate_leg_fare('GANDHINAGAR_ELECTRIC_BUS', 25.0), 25.0)
        # > 25 km -> ₹30
        self.assertEqual(FareEngine.calculate_leg_fare('GANDHINAGAR_ELECTRIC_BUS', 28.0), 30.0)

    def test_journey_planner_electric_bus_fare_in_steps(self):
        """Verify journey planner includes accurate step fares and breakdown for Gandhinagar Electric Bus."""
        response = self.client.get('/api/transit/journey/plan/', {
            'from': 'Mahatma Mandir Electric Bus Terminal',
            'to': 'Infocity Bus Stand',
            'preference': 'fastest'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(len(data['routes']) >= 1)
        route = data['routes'][0]
        self.assertGreater(route['fare'], 0)
        self.assertEqual(route['fare_currency'], '₹')
        self.assertGreater(len(route['fare_breakdown']), 0)
        for fb in route['fare_breakdown']:
            self.assertIn('mode', fb)
            self.assertIn('fare', fb)
            self.assertGreater(fb['fare'], 0)

        # Check step-level fare attribution
        transit_steps = [s for s in route['steps'] if s['step_type'] == 'TRANSIT']
        self.assertGreater(len(transit_steps), 0)
        for step in transit_steps:
            self.assertIn('fare', step)
            self.assertGreater(step['fare'], 0)

    def test_vishwakarma_college_metro_and_landmark_journey(self):
        """Verify search and journey planning to/from Vishwakarma College Metro & VGEC."""
        # 1. Test autocomplete search for Vishwakarma
        search_res = self.client.get('/api/transit/search/', {'q': 'Vishwakarma'})
        self.assertEqual(search_res.status_code, status.HTTP_200_OK)
        search_data = search_res.json()
        self.assertGreaterEqual(search_data['count'], 1)
        names = [r['name'] for r in search_data['results']]
        self.assertTrue(any('Vishwakarma' in n for n in names))

        # 2. Test journey plan: Vishwakarma College Metro Station -> Mahatma Mandir
        plan_res = self.client.get('/api/transit/journey/plan/', {
            'from': 'Vishwakarma College Metro Station',
            'to': 'Mahatma Mandir Metro (Gandhinagar Capital)',
            'preference': 'fastest'
        })
        self.assertEqual(plan_res.status_code, status.HTTP_200_OK)
        plan_data = plan_res.json()
        self.assertTrue(len(plan_data['routes']) >= 1)
        first_route = plan_data['routes'][0]
        self.assertIn('Vishwakarma', str(first_route['steps']))
        self.assertGreater(first_route['fare'], 0)






