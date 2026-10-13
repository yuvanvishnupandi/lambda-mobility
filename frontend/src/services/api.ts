import { Bus, Alert, Incident, RoadHazard } from '../types'
import { alerts as localAlerts } from '../data/alerts'
import { incidents as localIncidents } from '../data/incidents'
import { roadHazards as localRoadHazards } from '../data/roadHazards'
import { roadSimulator } from './roadSimulator'

const RAW_API_URL = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '')
const API_BASE_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`

let cachedToken: string | null = null

// Helper to authenticate with backend if token missing
async function getAuthToken(): Promise<string | null> {
  if (cachedToken) return cachedToken
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'operator', password: 'Admin@1234' })
    })
    if (res.ok) {
      const data = await res.json()
      cachedToken = data.access || null
      return cachedToken
    }
  } catch (err) {
    // Backend offline or unreachable
  }
  return null
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const token = await getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })

    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    // Graceful fallback on network error
  }
  return null
}

export const apiService = {
  // Check backend health
  async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/docs/`, { method: 'HEAD' })
      return res.status < 500
    } catch {
      return false
    }
  },

  // Dashboard summary KPIs
  async getDashboardSummary() {
    const res = await apiFetch<{
      active_buses: number
      online_buses: number
      ai_detections_today: number
      road_hazards: number
      open_incidents: number
      critical_alerts: number
      average_confidence: number
    }>('/dashboard/summary/')

    if (res) {
      return {
        activeBuses: res.active_buses,
        onlineBuses: res.online_buses,
        detections: res.ai_detections_today,
        roadHazards: res.road_hazards,
        incidents: res.open_incidents,
        criticalAlerts: res.critical_alerts,
        averageConfidence: res.average_confidence
      }
    }

    // Local fallback
    return {
      activeBuses: 248,
      onlineBuses: 236,
      detections: 12846,
      roadHazards: 327,
      incidents: 18,
      criticalAlerts: 4,
      averageConfidence: 94.6
    }
  },

  // Live Alerts
  async getLiveAlerts(): Promise<Alert[]> {
    const res = await apiFetch<any[]>('/dashboard/live-alerts/')
    if (res && Array.isArray(res) && res.length > 0) {
      return res.map(a => ({
        id: String(a.id || a.alert_type),
        severity: (a.severity || 'medium').toLowerCase() as any,
        type: a.type || a.alert_type || 'Alert',
        location: a.location || 'GST Road (Potheri Central)',
        busId: a.busId || a.bus_id || 'BUS-104',
        confidence: a.confidence || 0.95,
        timestamp: a.timestamp || 'Just now',
        gps: a.gps || [12.8231, 80.0444]
      }))
    }
    return localAlerts
  },

  // Detailed Notifications from /api/alerts/
  async getNotifications() {
    const res = await apiFetch<{ count: number; results: any[] }>('/alerts/')
    if (res && res.results) {
      return res.results
    }
    // Fallback based on local alerts
    return localAlerts.map(a => ({
      id: Number(a.id.replace(/\D/g, '')) || Math.floor(Math.random() * 1000),
      alert_type: a.type,
      title: `${a.type} Alert`,
      message: `${a.type} detected at ${a.location} with ${(a.confidence * 100).toFixed(0)}% confidence`,
      severity: a.severity.toUpperCase(),
      location: a.location,
      bus_id: a.busId,
      timestamp: a.timestamp,
      is_read: false,
      acknowledged: false
    }))
  },

  async markAlertRead(id: number | string) {
    return await apiFetch(`/alerts/${id}/read/`, { method: 'PATCH' })
  },

  async acknowledgeAlert(id: number | string) {
    return await apiFetch(`/alerts/${id}/acknowledge/`, { method: 'POST' })
  },

  async markAllAlertsRead() {
    return await apiFetch('/alerts/mark-all-read/', { method: 'POST' })
  },


  // Fleet buses
  async getBuses(status?: string): Promise<Bus[]> {
    const query = status && status !== 'all' ? `?status=${status.toUpperCase()}` : ''
    const res = await apiFetch<{ results: any[] }>(`/fleet/buses/${query}`)
    if (res && res.results && res.results.length > 0) {
      return res.results.map(b => ({
        id: b.bus_id || `BUS-${b.id}`,
        route: b.route_name ? `Route ${b.route_number}` : (b.current_location_name || 'Route 500'),
        location: b.location || b.current_location_name || 'GST Road (Potheri Sector)',
        speed: b.speed || 0,
        gps: b.gps || [b.latitude || 12.8231, b.longitude || 80.0444],
        cameras: b.cameras || { front: true, rear: true, left: true, right: true, passenger: true },
        aiStatus: b.ai_status || 'Processing',
        lastUpdate: b.lastUpdate || 'Just now',
        status: (b.status || 'online').toLowerCase() as any
      }))
    }
    return roadSimulator.getLiveBuses(status)
  },

  // Incidents
  async getIncidents(): Promise<Incident[]> {
    const res = await apiFetch<{ results: any[] }>('/incidents/')
    if (res && res.results && res.results.length > 0) {
      return res.results.map(inc => ({
        id: inc.incident_id || `INC-${inc.id}`,
        type: inc.type || inc.incident_type,
        location: inc.location,
        busId: inc.busId || (inc.bus ? `BUS-${inc.bus}` : 'BUS-104'),
        time: inc.time || '10 min ago',
        confidence: inc.confidence || 0.95,
        status: (inc.status || 'open').toLowerCase() as any,
        severity: (inc.severity || 'high').toLowerCase() as any,
        vehicleInfo: inc.vehicleInfo || inc.vehicle_info,
        gps: inc.gps || [inc.latitude, inc.longitude],
        description: inc.description
      }))
    }
    return localIncidents
  },

  // Road Hazards
  async getRoadHazards(): Promise<RoadHazard[]> {
    const res = await apiFetch<{ results: any[] }>('/roads/hazards/')
    if (res && res.results && res.results.length > 0) {
      return res.results.map(h => ({
        id: String(h.id),
        type: h.type || h.hazard_type,
        location: h.location || h.road_name,
        severity: (h.severity || 'medium').toLowerCase() as any,
        busId: h.busId || 'BUS-104',
        gps: h.gps || [h.latitude, h.longitude],
        confidence: h.confidence,
        timestamp: h.timestamp || 'Today',
        status: (h.status || 'pending').toLowerCase() as any
      }))
    }
    return localRoadHazards
  },

  // Road Intelligence Analytics & Priorities
  async getRoadAnalytics() {
    const res = await apiFetch<{
      hazards_by_category: any[]
      confidence_distribution: any[]
      total_hazards: number
    }>('/analytics/road-conditions/')
    return res
  },

  async getMaintenancePriorities() {
    const res = await apiFetch<{ results: any[] }>('/roads/maintenance-priority/')
    return res?.results || null
  },

  // Traffic Analytics
  async getTrafficAnalytics() {
    const res = await apiFetch<{
      summary: any
      hourly_density: any[]
      congestion_by_zone: any[]
      vehicle_classification: any[]
    }>('/analytics/traffic/')
    return res
  },

  async getRouteDelays() {
    const res = await apiFetch<any[]>('/analytics/route-delays/')
    return res
  },

  // AI Insights
  async getAIInsights(): Promise<string[] | null> {
    const res = await apiFetch<{ insights: string[] }>('/analytics/insights/')
    return res?.insights || null
  },

  // Reports
  async getReports() {
    const res = await apiFetch<{ results: any[] }>('/reports/')
    return res?.results || null
  },

  // GIS Map All Objects
  async getMapAll() {
    const res = await apiFetch<{
      buses: any[]
      hazards: any[]
      incidents: any[]
      traffic: any[]
      infrastructure: any[]
    }>('/map/all/')
    return res
  },

  // Vehicle Search
  async searchVehicle(registration: string) {
    const clean = registration.replace(/\s+/g, '')
    const res = await apiFetch<{
      vehicle: any
      route: [number, number][]
      sightings: any[]
    }>(`/vehicles/search/?registration=${encodeURIComponent(clean)}`)
    return res
  },

  // Demo Mode Simulation
  async startDemoMode() {
    return await apiFetch<{ success: boolean; message: string }>('/demo/start/', { method: 'POST' })
  },

  async stopDemoMode() {
    return await apiFetch<{ success: boolean; message: string }>('/demo/stop/', { method: 'POST' })
  },

  async getDemoStatus() {
    return await apiFetch<{ is_running: boolean; events_generated: number }>('/demo/status/')
  },

  // User Profile & Authentication API
  async login(credentials: { email?: string; password?: string }) {
    return await apiFetch<{ access: string; refresh: string; user: any }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  },

  async register(userData: {
    name: string
    email: string
    password?: string
    account_type?: 'ADMIN' | 'USER'
    role?: string
    department?: string
    city?: string
    district?: string
    corridor?: string
    phone?: string
  }) {
    return await apiFetch<{ access: string; refresh: string; user: any }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },

  async getUserProfile(userId?: string, email?: string) {
    const params = new URLSearchParams()
    if (userId) params.append('user_id', userId)
    if (email) params.append('email', email)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return await apiFetch<any>(`/user/profile/${qs}`)
  },

  async updateUserProfile(profileData: any) {
    return await apiFetch<{ status: string; message: string; user: any }>('/user/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  },

  async getLocations() {
    return await apiFetch<any[]>('/user/locations/')
  },

  async switchLocation(locationId: string) {
    return await apiFetch<{ status: string; current_location: any }>('/user/switch-location/', {
      method: 'POST',
      body: JSON.stringify({ location_id: locationId })
    })
  }
}

