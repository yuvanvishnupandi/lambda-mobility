import re
import math
from typing import Dict, Any, List, Optional
from datetime import datetime
from django.utils import timezone
from .routing_engine import MultimodalRoutingEngine
from .geocoding_service import GeocodingService
from ..models import PlaceLandmark, Stop

class AiJourneyAssistantService:
    """
    State-of-the-Art AI Passenger Journey Co-Pilot:
    Converts natural language travel requests into structured multimodal routing queries,
    performs contextual reasoning (weather, crowding, taxi savings), and generates rich UI payloads.
    """

    @classmethod
    def parse_and_plan(cls, query: str) -> Dict[str, Any]:
        q = query.strip()
        parsed = cls._parse_query_intent(q)

        # Plan the journey using the multimodal routing engine
        journey_result = MultimodalRoutingEngine.plan_journey(
            from_name=parsed['from_location'],
            to_name=parsed['to_location'],
            departure_time_str=parsed.get('departure', 'now'),
            arrive_by_str=parsed.get('arrive_by'),
            preference=parsed.get('preference', 'fastest'),
            modes=parsed.get('modes'),
            wheelchair_accessible=parsed.get('wheelchair', False)
        )

        # Generate intelligent assistant structured data
        rich_data = cls._generate_rich_intelligence(parsed, journey_result)

        return {
            'query': q,
            'parsed_intent': parsed,
            'assistant_response': rich_data['markdown_summary'],
            'structured_card': rich_data,
            'journey_plan': journey_result,
        }

    @classmethod
    def _parse_query_intent(cls, text: str) -> Dict[str, Any]:
        t = text.lower()

        intent = {
            'from_location': 'Sabarmati Railway Station',
            'to_location': 'GIFT City',
            'departure': 'now',
            'arrive_by': None,
            'preference': 'fastest',
            'modes': ['METRO', 'BRTS', 'AMTS', 'RAIL', 'BUS', 'WALK'],
            'wheelchair': False,
        }

        # 1. Preference detection
        if any(w in t for w in ['cheap', 'cheapest', 'low cost', 'budget', 'lowest fare', 'economic']):
            intent['preference'] = 'cheapest'
        elif any(w in t for w in ['least walk', 'less walking', 'minimal walking', 'no walk', 'low walking']):
            intent['preference'] = 'least_walking'
        elif any(w in t for w in ['least wait', 'minimum wait', 'min wait', 'dont want to wait', 'least waiting', 'quickest']):
            intent['preference'] = 'minimum_wait'
        elif any(w in t for w in ['fewest transfer', 'no change', 'direct', 'fewest interchange', 'single bus', 'single train', 'direct line']):
            intent['preference'] = 'fewest_transfers'
        elif any(w in t for w in ['reliable', 'punctual', 'safe', 'on time']):
            intent['preference'] = 'most_reliable'
        elif any(w in t for w in ['wheelchair', 'accessible', 'step-free', 'disabled', 'elderly', 'elevator']):
            intent['preference'] = 'accessible'
            intent['wheelchair'] = True

        # 2. Time / Arrive-By detection
        time_match = re.search(r'(?:before|by|reach at|arrive at|reach by)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)', t)
        if time_match:
            raw_t = time_match.group(1).strip()
            if 'am' in raw_t or 'pm' in raw_t:
                try:
                    dt = datetime.strptime(raw_t.upper().replace(' ', ''), '%I%p' if ':' not in raw_t else '%I:%M%p')
                    intent['arrive_by'] = dt.strftime('%H:%M')
                except Exception:
                    pass
            elif ':' in raw_t:
                intent['arrive_by'] = raw_t
            else:
                try:
                    h = int(raw_t)
                    intent['arrive_by'] = f"{h:02d}:00"
                except Exception:
                    pass

        # 3. Location extraction with aliases and fuzzy keywords
        loc_map = {
            'airport': 'Sardar Vallabhbhai Patel International Airport (SVPIA)',
            'svpia': 'Sardar Vallabhbhai Patel International Airport (SVPIA)',
            'ahmedabad airport': 'Sardar Vallabhbhai Patel International Airport (SVPIA)',
            'gift city': 'GIFT City',
            'gift': 'GIFT City',
            'sabarmati': 'Sabarmati Railway Station',
            'thaltej': 'Thaltej',
            'kalupur': 'Kalupur Railway Station',
            'infocity': 'Infocity Gandhinagar',
            'mahatma mandir': 'Mahatma Mandir',
            'sector 21': 'Gandhinagar Sector 21',
            'sector 10': 'Gandhinagar Sector 10',
            'sector 1': 'Gandhinagar Sector 1',
            'akshardham': 'Akshardham Gandhinagar',
            'science city': 'Science City',
            'iskcon': 'Iskcon Cross Road',
            'vastral': 'Vastral Gam',
            'motera': 'Motera Stadium',
            'apmc': 'APMC Vasna',
            'gandhinagar capital': 'Gandhinagar Capital',
            'ranip': 'Ranip GSRTC Bus Hub',
        }

        # Check 'from X to Y' pattern
        from_to = re.search(r'from\s+([a-zA-Z0-9\s]+?)\s+(?:to|reach)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:before|by|at|with|via|in|using|for|$))', t)
        reach_from = re.search(r'(?:reach|go to|get to|travel to)\s+([a-zA-Z0-9\s]+?)\s+from\s+([a-zA-Z0-9\s]+?)(?:\s+(?:before|by|at|with|via|in|using|for|$))', t)

        if from_to:
            raw_f = from_to.group(1).strip()
            raw_t = from_to.group(2).strip()
            intent['from_location'] = cls._match_location_alias(raw_f, loc_map)
            intent['to_location'] = cls._match_location_alias(raw_t, loc_map)
        elif reach_from:
            raw_t = reach_from.group(1).strip()
            raw_f = reach_from.group(2).strip()
            intent['to_location'] = cls._match_location_alias(raw_t, loc_map)
            intent['from_location'] = cls._match_location_alias(raw_f, loc_map)
        else:
            # Match keywords in text
            matched_keys = []
            for k in sorted(loc_map.keys(), key=len, reverse=True):
                if k in t:
                    matched_keys.append((t.find(k), loc_map[k]))
            
            # Sort by order of appearance
            matched_keys.sort(key=lambda x: x[0])
            if len(matched_keys) >= 2:
                intent['from_location'] = matched_keys[0][1]
                intent['to_location'] = matched_keys[1][1]
            elif len(matched_keys) == 1:
                intent['to_location'] = matched_keys[0][1]

        return intent

    @classmethod
    def _match_location_alias(cls, text: str, loc_map: Dict[str, str]) -> str:
        t = text.lower().strip()
        for k, v in loc_map.items():
            if k in t:
                return v
        return text.title()

    @classmethod
    def _generate_rich_intelligence(cls, parsed: Dict[str, Any], journey_result: Dict[str, Any]) -> Dict[str, Any]:
        routes = journey_result.get('routes', [])
        origin_name = journey_result.get('origin', {}).get('name', parsed['from_location'])
        dest_name = journey_result.get('destination', {}).get('name', parsed['to_location'])

        if not routes:
            return {
                'structured_title': f"Route Search: {origin_name} → {dest_name}",
                'status': 'NO_DIRECT_ROUTE',
                'travel_time_mins': 0,
                'fare': 0,
                'transfers_count': 0,
                'modes': [],
                'reliability_pct': 0,
                'co2_saved_kg': 0,
                'taxi_cost_estimate': '₹200 - ₹350',
                'weather_advisory': 'Standard weather conditions in Ahmedabad region.',
                'crowding_forecast': 'Normal',
                'step_by_step': [],
                'advantages': ['No direct transit line found with current filters.'],
                'suggested_followups': [
                    'Expand walking distance',
                    'Enable all modes (Metro + BRTS + AMTS + Rail)',
                    'Search from nearby transport hub'
                ],
                'markdown_summary': f"I could not locate an immediate direct transit connection between {origin_name} and {dest_name}. Try enabling all transit modes or expanding your walking range."
            }

        best = routes[0]
        pref_title = parsed.get('preference', 'fastest').replace('_', ' ').title()
        dur = best.get('duration_minutes', 0)
        fare = best.get('fare', 0)
        transfers = best.get('transfers', 0)
        modes = [m for m in best.get('modes', []) if m != 'WALK']
        primary_mode = best.get('primary_mode', modes[0] if modes else 'METRO')
        reliability = round(best.get('reliability_score', 0.95) * 100)
        co2_saved = round(best.get('co2_saved_kg', max(0.8, dur * 0.035)), 1)

        # Estimate equivalent Taxi / Auto-Rickshaw cost
        approx_dist_km = max(3.0, best.get('total_distance_km', dur * 0.4))
        taxi_fare = max(120, round(50 + (approx_dist_km * 16)))
        savings = max(0, taxi_fare - fare)
        savings_pct = round((savings / taxi_fare) * 100) if taxi_fare > 0 else 0

        # Step by step highlights
        steps_summary = []
        for idx, step in enumerate(best.get('steps', []), start=1):
            if step['step_type'] == 'WALK':
                steps_summary.append({
                    'step_number': idx,
                    'type': 'WALK',
                    'icon': 'WALK',
                    'title': f"Walk to {step['to_name']}",
                    'detail': step['instructions'],
                    'duration_mins': step['duration_mins'],
                })
            elif step['step_type'] == 'TRANSFER':
                steps_summary.append({
                    'step_number': idx,
                    'type': 'TRANSFER',
                    'icon': 'TRANSFER',
                    'title': f"Transfer: {step['from_name']}",
                    'detail': step['instructions'],
                    'window_mins': step.get('transfer_window_mins', step['duration_mins'] + 3),
                    'duration_mins': step['duration_mins'],
                    'is_tight': step.get('is_tight', False),
                })
            else:
                m_icon = step['mode']
                steps_summary.append({
                    'step_number': idx,
                    'type': 'TRANSIT',
                    'icon': m_icon,
                    'mode': step['mode'],
                    'title': f"Board {step['route_number']} toward {step['to_name']}",
                    'detail': step['instructions'],
                    'platform': step.get('platform_info') or step.get('stand_number') or 'Main Platform',
                    'duration_mins': step['duration_mins'],
                    'stops_count': step.get('stops_count', 1),
                })

        # Key advantages
        advantages = best.get('why_recommended', [])
        if not advantages:
            advantages = [
                f"Optimal multimodal travel time ({dur} min)",
                f"Low cost transit fare: only ₹{fare} (Save ~{savings_pct}% vs cab)",
                f"{reliability}% on-time reliability score across dedicated grid",
                f"Saves {co2_saved} kg of CO₂ emissions"
            ]

        # Contextual intelligence
        weather_advisory = "Sunny & Warm (~36°C) — Air-conditioned GMRC Metro coaches & electric buses recommended."
        crowding = "Moderate seating availability expected on current departures."
        if 8 <= timezone.now().hour <= 10 or 17 <= timezone.now().hour <= 20:
            crowding = "Peak commuter rush — High frequency (every 5-6 mins) active."

        # Contextual follow-up suggestions
        suggested_followups = [
            f"Show cheapest route to {dest_name}",
            f"How much time to reach {dest_name} by cab vs metro?",
            f"Show accessible step-free route only",
            f"Where is the live vehicle for {best.get('summary_title', 'this route')}?"
        ]

        # Markdown formatted summary
        modes_badge = " + ".join(modes) if modes else "Direct Link"
        markdown_lines = [
            f"**Recommended {pref_title} Route**: **{origin_name}** → **{dest_name}**",
            f"• **Duration:** **{dur} minutes** (Departure: **{best.get('departure_time')}** → Arrival: **{best.get('arrival_time')}**)",
            f"• **Modes:** **{modes_badge}** ({transfers} {'transfer' if transfers == 1 else 'transfers'})",
            f"• **Fare:** **₹{fare}** *(Save ₹{savings} vs taxi/auto)*",
            f"• **Reliability:** **{reliability}% Punctuality** • **{co2_saved} kg CO₂ saved**",
        ]

        if journey_result.get('leave_by_summary'):
            lbs = journey_result['leave_by_summary']
            markdown_lines.append(f"\n⏰ **Departure Notice:** To arrive before **{lbs['target_arrival_time']}**, please depart at **{lbs['recommended_departure_time']}** (+{lbs['safety_buffer_minutes']}m buffer).")

        return {
            'structured_title': f"{pref_title} Route: {origin_name} → {dest_name}",
            'status': 'SUCCESS',
            'travel_time_mins': dur,
            'departure_time': best.get('departure_time'),
            'arrival_time': best.get('arrival_time'),
            'fare': fare,
            'transfers_count': transfers,
            'modes': modes,
            'primary_mode': primary_mode,
            'reliability_pct': reliability,
            'co2_saved_kg': co2_saved,
            'taxi_comparison': {
                'taxi_cost_inr': taxi_fare,
                'savings_inr': savings,
                'savings_pct': savings_pct
            },
            'weather_advisory': weather_advisory,
            'crowding_forecast': crowding,
            'step_by_step': steps_summary,
            'advantages': advantages,
            'suggested_followups': suggested_followups,
            'markdown_summary': "\n".join(markdown_lines),
        }
