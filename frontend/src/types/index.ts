export interface Bus {
  id: string
  route: string
  location: string
  speed: number
  gps: [number, number]
  cameras: {
    front: boolean
    rear: boolean
    left: boolean
    right: boolean
    passenger: boolean
  }
  aiStatus: string
  lastUpdate: string
  status: 'online' | 'offline' | 'processing'
}

export interface Detection {
  id: string
  type: string
  confidence: number
  busId: string
  location: string
  gps: [number, number]
  timestamp: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export interface Incident {
  id: string
  type: string
  location: string
  busId: string
  time: string
  confidence: number
  status: 'open' | 'investigating' | 'assigned' | 'resolved'
  severity: 'low' | 'medium' | 'high' | 'critical'
  vehicleInfo?: {
    registration: string
    type: string
    color: string
    direction: string
  }
  gps: [number, number]
  description?: string
}

export interface Alert {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  location: string
  busId: string
  confidence: number
  timestamp: string
  gps: [number, number]
}

export interface RoadHazard {
  id: string
  type: string
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  busId: string
  gps: [number, number]
  confidence: number
  timestamp: string
  status: 'pending' | 'verified' | 'in-progress' | 'resolved'
}
