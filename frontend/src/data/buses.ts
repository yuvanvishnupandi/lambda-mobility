import { Bus } from '../types'
import { roadSimulator } from '../services/roadSimulator'

// All coordinates dynamically generated and constrained 100% to verified OpenStreetMap road centerlines
export const buses: Bus[] = roadSimulator.getLiveBuses()
