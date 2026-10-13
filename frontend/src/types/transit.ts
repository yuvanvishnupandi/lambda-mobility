export type TransportMode = 'METRO' | 'BRTS' | 'AMTS' | 'RAIL' | 'BUS' | 'WALK' | 'GANDHINAGAR_ELECTRIC_BUS' | 'MTC_ELECTRIC_BUS' | 'TNSTC_EXPRESS'

export type RouteCategoryBadge =
  | 'FASTEST'
  | 'CHEAPEST'
  | 'LEAST WALKING'
  | 'FEWEST TRANSFERS'
  | 'MOST RELIABLE'
  | 'MINIMUM WAIT'
  | '⏱ MINIMIZE WAITING'
  | 'ELECTRIC EXPRESS'
  | 'ZERO EMISSION'
  | 'BRTS BUSWAY'
  | 'SUBURBAN RAIL'
  | 'CITY FEEDER'
  | 'MULTIMODAL'
  | 'RECOMMENDED'
  | 'ACCESSIBLE'
  | 'ALTERNATIVE'

export interface TransitStop {
  id?: number
  stop_id: string
  name: string
  name_gu?: string
  name_hi?: string
  code?: string
  agency?: number
  agency_name?: string
  city?: string
  mode: TransportMode
  latitude: number
  longitude: number
  coordinates?: [number, number]
  zone?: string
  is_interchange: boolean
  wheelchair_accessible: boolean
  has_elevator?: boolean
  has_escalator?: boolean
  platform_info?: string
  stand_number?: string
  distance_m?: number
  distance_km?: number
  walking_time_mins?: number
}

export interface TransitRoute {
  id: number
  route_id: string
  route_number: string
  route_name: string
  agency_name: string
  agency_code: string
  mode: TransportMode
  color: string
  text_color: string
  headway_peak_mins: number
  headway_offpeak_mins: number
  first_trip_time: string
  last_trip_time: string
  average_speed_kmh: number
  reliability_score: number
  is_active: boolean
  stops?: {
    sequence: number
    stop_name: string
    latitude: number
    longitude: number
    travel_time_mins: number
  }[]
}

export interface LiveVehicleInfo {
  vehicle_id: string
  registration?: string
  speed_kmh: number
  status: 'ON_TIME' | 'SLIGHT_DELAY' | 'DELAYED' | 'AHEAD' | 'DISRUPTED'
  delay_minutes: number
  is_live: boolean
  data_source: string
  current_location_name: string
}

export interface JourneyStep {
  step_type: 'WALK' | 'TRANSIT' | 'TRANSFER'
  mode: TransportMode
  title: string
  instructions: string
  from_name: string
  from_stop_id?: string
  to_name: string
  to_stop_id?: string
  agency_code?: string
  agency_name?: string
  route_id?: string
  route_number?: string
  route_name?: string
  route_color?: string
  platform_info?: string
  from_platform?: string
  to_platform?: string
  stand_number?: string
  stops_count?: number
  duration_mins: number
  waiting_mins?: number
  distance_km: number
  fare?: number
  fare_currency?: string
  departure_time: string
  arrival_time: string
  coordinates: [number, number][]
  vehicle?: LiveVehicleInfo | null
  delay_minutes?: number
  is_transfer?: boolean
  is_step_free?: boolean
  transfer_window_mins?: number
  transfer_message?: string
  is_tight?: boolean
  tight_transfer_warning?: string
  protection_status?: 'GUARANTEED' | 'PROTECTED' | 'TIGHT'
}

export interface JourneyRouteOption {
  route_key: string
  type: string
  summary_title: string
  modes: TransportMode[]
  primary_mode: TransportMode
  duration_minutes: number
  walking_minutes: number
  waiting_minutes: number
  transfers: number
  fare: number
  fare_currency: string
  fare_breakdown: {
    mode: string
    mode_display?: string
    route_number: string
    distance_km: number
    fare: number
  }[]
  departure_time: string
  arrival_time: string
  total_distance_km: number
  walking_distance_km?: number
  reliability_score: number
  is_live: boolean
  delay_minutes: number
  category_badge: RouteCategoryBadge
  badge_color: string
  tag_label: string
  why_recommended?: string[]
  co2_saved_kg?: number
  steps: JourneyStep[]
  polyline: [number, number][]
}

export interface DelayAlertCallout {
  affected_mode: string
  delayed_route_title: string
  delay_minutes: number
  recommended_alternative_title: string
  time_saved_minutes: number
  alert_message: string
}

export interface LeaveBySummary {
  target_arrival_time: string
  recommended_departure_time: string
  expected_arrival_time: string
  safety_buffer_minutes: number
}

export interface JourneyPlanResult {
  from: {
    name: string
    latitude: number
    longitude: number
  }
  to: {
    name: string
    latitude: number
    longitude: number
  }
  generated_at: string
  departure_time: string
  leave_by_summary?: LeaveBySummary | null
  delay_alert_callout?: DelayAlertCallout | null
  selected_preference: string
  routes: JourneyRouteOption[]
  total_options: number
}

export interface DepartureItem {
  route_id: string
  route_number: string
  route_name: string
  mode: TransportMode
  color: string
  destination: string
  eta_minutes: number
  departure_time: string
  is_live: boolean
  data_source: string
  status: 'LIVE' | 'SCHEDULED' | 'ESTIMATED'
  delay_minutes: number
  vehicle_id?: string | null
}

export interface StopDeparturesData {
  stop: TransitStop
  departures: DepartureItem[]
  generated_at: string
}

export interface LiveVehicle {
  vehicle_id: string
  registration: string
  mode: TransportMode
  operator?: string
  is_electric?: boolean
  battery_soc_pct?: number
  charging_status?: 'DISCHARGING' | 'CHARGING' | 'FAST_CHARGING' | 'IDLE' | 'STANDBY'
  agency_code: string
  agency_name: string
  route_id?: string
  route_number: string
  route_name?: string
  route_color?: string
  latitude: number
  longitude: number
  speed_kmh: number
  heading?: number
  current_location_name?: string
  next_stop_id?: string
  next_stop_name?: string
  eta_next_stop_seconds?: number
  eta_next_stop_mins?: number
  delay_minutes?: number
  status?: 'ON_TIME' | 'SLIGHT_DELAY' | 'DELAYED' | 'AHEAD' | 'DISRUPTED'
  is_live?: boolean
  data_source?: string
  telemetry_type?: string
  provenance?: string
  last_updated?: string
  freshness_seconds?: number
  freshness_label?: string
}

export interface ServiceAlertItem {
  id: number
  alert_id: string
  title: string
  description: string
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  status: 'ACTIVE' | 'RESOLVED' | 'UPCOMING'
  delay_impact_mins: number
  valid_from: string
  agency_name?: string
  route_number?: string
}

export interface DataSourceItem {
  source_name: string
  provider_type: string
  status: 'OPERATIONAL' | 'DEGRADED' | 'SYNCING' | 'ERROR'
  records_count: number
  is_live_telemetry: boolean
  freshness_seconds: number
  freshness_label: string
  last_sync: string
}

export interface TransitStatusData {
  system_status: string
  city: string
  agencies: string[]
  total_stops: number
  total_routes: number
  active_vehicles: number
  active_alerts: number
  sources: DataSourceItem[]
  server_time: string
}

export interface LocationSearchResult {
  id: string
  name: string
  name_gu?: string
  category: string
  type: string
  address: string
  latitude: number
  longitude: number
  is_popular?: boolean
}

export interface AiStepItem {
  step_number: number
  type: 'WALK' | 'TRANSIT' | 'TRANSFER'
  icon: string
  mode?: string
  title: string
  detail: string
  platform?: string
  duration_mins: number
  stops_count?: number
  window_mins?: number
  is_tight?: boolean
}

export interface AiStructuredCard {
  structured_title: string
  status: string
  travel_time_mins: number
  departure_time?: string
  arrival_time?: string
  fare: number
  transfers_count: number
  modes: string[]
  primary_mode?: string
  reliability_pct: number
  co2_saved_kg: number
  taxi_comparison: {
    taxi_cost_inr: number
    savings_inr: number
    savings_pct: number
  }
  weather_advisory: string
  crowding_forecast: string
  step_by_step: AiStepItem[]
  advantages: string[]
  suggested_followups: string[]
  markdown_summary: string
}

export interface AiJourneyResponse {
  query: string
  parsed_intent: {
    from_location: string
    to_location: string
    departure: string
    arrive_by?: string
    preference: string
    modes: string[]
    wheelchair: boolean
  }
  assistant_response: string
  structured_card?: AiStructuredCard
  journey_plan?: JourneyPlanResult
}

export interface RouteComparisonMatrixItem {
  route_key: string
  summary_title: string
  category_badge: RouteCategoryBadge
  tag_label: string
  badge_color: string
  duration_minutes: number
  waiting_minutes: number
  walking_minutes: number
  transfers: number
  fare: number
  reliability_score: number
  delay_minutes: number
  status: 'ON_TIME' | 'DELAYED'
  modes: TransportMode[]
  co2_saved_kg?: number
  why_recommended?: string[]
}

export interface RouteComparisonData {
  origin: {
    name: string
    latitude: number
    longitude: number
  }
  destination: {
    name: string
    latitude: number
    longitude: number
  }
  total_options: number
  comparison_matrix: RouteComparisonMatrixItem[]
}

export interface AdminRegionStatus {
  region: string
  status: string
  health_pct: number
  transit_modes: string[]
}

export interface AdminNetworkStatus {
  network_status: string
  server_time: string
  regions: AdminRegionStatus[]
  data_sources: DataSourceItem[]
  active_delays_count: number
  fleet_summary: {
    active_vehicles: number
    on_time_pct: number
    live_gps_pct: number
  }
}

export interface ElectricBusRoute {
  route_id: string
  route_number: string
  route_name: string
  mode: TransportMode
  mode_name: string
  badge_icon: string
  operator: string
  operator_code: string
  operator_full_name: string
  origin: string
  destination: string
  color: string
  text_color: string
  is_electrified: boolean
  electrification_level: string
  ac_available: boolean
  low_floor: boolean
  wheelchair_accessible: boolean
  peak_frequency_minutes: number
  off_peak_frequency_minutes: number
  operating_hours: string
  stops_count: number
  stops?: {
    stop_id: string
    name: string
    tamil_name?: string
    regional_name?: string
    gujarati_name?: string
    latitude: number
    longitude: number
    sequence: number
    is_major_hub: boolean
    distance_from_start_km: number
  }[]
  fare_min: number
  fare_max: number
}

export interface ElectricBusStop {
  stop_id: string
  name: string
  tamil_name?: string
  regional_name?: string
  gujarati_name?: string
  latitude: number
  longitude: number
  city_region: string
  is_major_interchange: boolean
  wheelchair_accessible: boolean
  ev_charging_facility: boolean
  routes_count: number
  routes: {
    route_id: string
    route_number: string
    route_name: string
    mode: string
    operator: string
    color: string
  }[]
}

export interface ElectricBusVehicle {
  vehicle_id: string
  registration?: string
  route_id?: string
  route_number: string
  route_name: string
  destination: string
  operator: string
  agency: string
  latitude: number
  longitude: number
  speed_kmh: number
  heading?: number
  is_electric: boolean
  battery_soc_pct?: number
  battery_status?: string
  charging_status?: 'DISCHARGING' | 'CHARGING' | 'FAST_CHARGING' | 'IDLE'
  is_ac: boolean
  is_low_floor: boolean
  wheelchair_accessible: boolean
  fleet_number?: string
  registration_number?: string
  status: 'ON_TIME' | 'SLIGHT_DELAY' | 'DELAYED' | 'AHEAD' | 'DISRUPTED'
  delay_minutes: number
  provenance: 'REAL_TIME' | 'ESTIMATED' | 'SCHEDULED' | 'DEMO DATA' | 'LIVE TN TELEMETRY'
  last_updated?: string
}

export interface ElectricBusFleetMetrics {
  fleet_total: number
  fleet_deployed: number
  fleet_active: number
  active_routes_count: number
  electrified_stops_count: number
  ev_depots_count: number
  ev_depot_locations: string[]
}

export interface ElectricBusStats {
  network_name: string
  program: string
  operator: string
  partner_agency: string
  fleet_metrics: ElectricBusFleetMetrics
  environmental_impact: {
    clean_km_today: number
    co2_saved_kg_today: number
    diesel_saved_liters_today: number
    tree_equivalent_co2_offset: number
    zero_tailpipe_emissions: boolean
  }
  service_quality: {
    fleet_electrification_rate: string
    air_conditioned_pct: number
    low_floor_accessible_pct: number
    average_battery_soc_pct: number
    on_time_performance_pct: number
    average_peak_headway_mins: number
  }
  provenance: string
  last_updated: string
}


