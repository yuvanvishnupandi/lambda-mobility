import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'

export interface UserLocation {
  id: string
  city: string
  district: string
  corridor: string
  active_vehicles: number
  congestion_level: string
  weather: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  account_type?: 'ADMIN' | 'USER'
  department: string
  phone: string
  city: string
  district: string
  corridor: string
  home_hub: string
  work_hub: string
  preferred_transit: string[]
  alert_level: string
  theme_mode: string
  created_at?: string
}

interface UserContextType {
  user: UserProfile
  locations: UserLocation[]
  currentLocation: UserLocation
  isAuthenticated: boolean
  isLoading: boolean
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>
  register: (userData: {
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
  }) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  updateProfile: (updated: Partial<UserProfile>) => Promise<{ success: boolean; message?: string }>
  switchLocation: (locationId: string) => Promise<void>
}

const DEFAULT_LOCATIONS: UserLocation[] = [
  {
    id: 'LOC-CGL',
    city: 'Chennai / Chengalpattu',
    district: 'Chengalpattu',
    corridor: 'GST Road Corridor (NH 45)',
    active_vehicles: 248,
    congestion_level: 'Normal',
    weather: '29°C · Clear'
  },
  {
    id: 'LOC-CHN',
    city: 'Chennai Central',
    district: 'Chennai Metropolitan',
    corridor: 'Anna Salai & OMR IT Express',
    active_vehicles: 412,
    congestion_level: 'Moderate',
    weather: '31°C · Humid'
  },
  {
    id: 'LOC-CBE',
    city: 'Coimbatore',
    district: 'Coimbatore Metro',
    corridor: 'Avinashi Road & Trichy Highway',
    active_vehicles: 185,
    congestion_level: 'Fluid',
    weather: '26°C · Overcast'
  },
  {
    id: 'LOC-MDU',
    city: 'Madurai',
    district: 'Madurai Heritage',
    corridor: 'Ring Road Arterial',
    active_vehicles: 130,
    congestion_level: 'Normal',
    weather: '33°C · Sunny'
  },
  {
    id: 'LOC-TRICHY',
    city: 'Tiruchirappalli (Trichy)',
    district: 'Trichy Central',
    corridor: 'Thillai Nagar to Central Bus Stand (NH 83)',
    active_vehicles: 112,
    congestion_level: 'Free Flow',
    weather: '32°C · Clear'
  }
]

const DEFAULT_USER: UserProfile = {
  id: 'USR-1001',
  name: 'Urban Operations Admin',
  email: 'officer@lambda.tn.gov.in',
  account_type: 'ADMIN',
  role: 'Chief Urban Intelligence Officer',
  department: 'Smart Mobility & Municipal Operations',
  phone: '+91 98400 12345',
  city: 'Chennai / Chengalpattu',
  district: 'Chengalpattu',
  corridor: 'GST Road Arterial Corridor (NH 45)',
  home_hub: 'Tambaram Central Interchange',
  work_hub: 'Cybervale Technology Hub',
  preferred_transit: ['Suburban Rail', 'MTC Express', 'Metro Feeder'],
  alert_level: 'CRITICAL_AND_HIGH',
  theme_mode: 'system',
  created_at: '2026-01-15T09:00:00Z'
}

// Stored credential record for persistent auth
interface StoredUserCredential {
  user: UserProfile
  password?: string
}

function getStoredDirectory(): StoredUserCredential[] {
  try {
    const raw = localStorage.getItem('lambda_users_directory')
    if (raw) return JSON.parse(raw)
  } catch {}
  const initial = [
    {
      user: DEFAULT_USER,
      password: 'password123'
    }
  ]
  localStorage.setItem('lambda_users_directory', JSON.stringify(initial))
  return initial
}

function saveToDirectory(newUser: UserProfile, password?: string) {
  try {
    const directory = getStoredDirectory()
    const existingIdx = directory.findIndex(u => u.user.email.toLowerCase() === newUser.email.toLowerCase())
    if (existingIdx >= 0) {
      directory[existingIdx] = { user: newUser, password: password || directory[existingIdx].password }
    } else {
      directory.push({ user: newUser, password: password || 'password123' })
    }
    localStorage.setItem('lambda_users_directory', JSON.stringify(directory))
  } catch (err) {
    console.error('Failed to save to local user directory:', err)
  }
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const isAuth = localStorage.getItem('lambda_is_authenticated')
      const activeUser = localStorage.getItem('lambda_active_user')
      return isAuth === 'true' && !!activeUser
    } catch {
      return false
    }
  })

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('lambda_active_user')
      return saved ? JSON.parse(saved) : DEFAULT_USER
    } catch {
      return DEFAULT_USER
    }
  })

  const [locations, setLocations] = useState<UserLocation[]>(DEFAULT_LOCATIONS)
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(() => {
    try {
      const savedLoc = localStorage.getItem('lambda_active_location')
      if (savedLoc) return JSON.parse(savedLoc)
    } catch {}
    return DEFAULT_LOCATIONS[0]
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('lambda_theme')
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme
      return 'light'
    } catch {
      return 'light'
    }
  })

  // Apply theme to document element
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('lambda_theme', theme)
    } catch (e) {
      console.warn('Failed to set theme:', e)
    }
  }, [theme])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
  }

  // Seed user directory on initial load
  useEffect(() => {
    getStoredDirectory()
  }, [])

  // Sync profile from backend on initial mount if available
  useEffect(() => {
    let isMounted = true
    const initData = async () => {
      try {
        const savedUser = localStorage.getItem('lambda_active_user')
        const parsed = savedUser ? JSON.parse(savedUser) : user
        const [profileRes, locsRes] = await Promise.all([
          apiService.getUserProfile(parsed?.id, parsed?.email).catch(() => null),
          apiService.getLocations().catch(() => null)
        ])

        if (isMounted) {
          if (profileRes && profileRes.name) {
            setUser((prev) => ({ ...prev, ...profileRes }))
            localStorage.setItem('lambda_active_user', JSON.stringify({ ...parsed, ...profileRes }))
          }
          if (locsRes && Array.isArray(locsRes) && locsRes.length > 0) {
            setLocations(locsRes)
            const matched = locsRes.find((l) => l.district === (profileRes?.district || user.district))
            if (matched) {
              setCurrentLocation(matched)
              localStorage.setItem('lambda_active_location', JSON.stringify(matched))
            }
          }
        }
      } catch (err) {
        console.warn('Backend sync warning:', err)
      }
    }

    if (isAuthenticated) {
      initData()
    }
    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  const login = async (email: string, password?: string) => {
    setIsLoading(true)
    const cleanEmail = email.trim().toLowerCase()
    const cleanPass = password?.trim() || ''

    // 1. Try remote backend login if server reachable
    try {
      const res = await apiService.login({ email: cleanEmail, password: cleanPass })
      if (res && res.user) {
        setUser(res.user)
        setIsAuthenticated(true)
        localStorage.setItem('lambda_active_user', JSON.stringify(res.user))
        localStorage.setItem('lambda_is_authenticated', 'true')
        localStorage.setItem('lambda_token', res.access || '')
        saveToDirectory(res.user, cleanPass)
        setIsLoading(false)
        return { success: true }
      }
    } catch {
      // Backend unavailable; proceed with local directory authentication
    }

    // 2. Validate against local persistent user directory
    const directory = getStoredDirectory()
    const matched = directory.find(entry => entry.user.email.toLowerCase() === cleanEmail)

    if (matched) {
      // Check password if provided
      if (cleanPass && matched.password && matched.password !== cleanPass) {
        setIsLoading(false)
        return { success: false, message: 'Incorrect password. Please verify your credentials.' }
      }

      setUser(matched.user)
      setIsAuthenticated(true)
      localStorage.setItem('lambda_active_user', JSON.stringify(matched.user))
      localStorage.setItem('lambda_is_authenticated', 'true')

      // Sync active location with user's corridor
      const locMatch = locations.find(l => l.district === matched.user.district || l.city.includes(matched.user.city))
      if (locMatch) {
        setCurrentLocation(locMatch)
        localStorage.setItem('lambda_active_location', JSON.stringify(locMatch))
      }

      setIsLoading(false)
      return { success: true }
    }

    setIsLoading(false)
    return {
      success: false,
      message: 'Account not found with this email. Please check spelling or create an account.'
    }
  }

  const register = async (userData: {
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
  }) => {
    setIsLoading(true)
    const cleanEmail = userData.email.trim().toLowerCase()

    const newUser: UserProfile = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: userData.name.trim(),
      email: cleanEmail,
      account_type: userData.account_type || 'ADMIN',
      role: userData.role || (userData.account_type === 'USER' ? 'Citizen Commuter' : 'Municipal Transit Command Officer'),
      department: userData.department || (userData.account_type === 'USER' ? 'Citizen Transit Passenger' : 'Chengalpattu District Transit Administration'),
      phone: userData.phone || '+91 98400 00000',
      city: userData.city || 'Chennai / Chengalpattu',
      district: userData.district || 'Chengalpattu',
      corridor: userData.corridor || 'GST Road Arterial Corridor (NH 45)',
      home_hub: 'Tambaram Central Interchange',
      work_hub: 'Cybervale Technology Hub',
      preferred_transit: ['Suburban Rail', 'MTC Express', 'Metro Feeder'],
      alert_level: 'CRITICAL_AND_HIGH',
      theme_mode: 'system',
      created_at: new Date().toISOString()
    }

    // Try backend registration if available
    try {
      await apiService.register(userData)
    } catch {
      // Backend offline; persist locally
    }

    // Save to local directory & authenticate
    saveToDirectory(newUser, userData.password || 'password123')
    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem('lambda_active_user', JSON.stringify(newUser))
    localStorage.setItem('lambda_is_authenticated', 'true')

    // Set or create matched location
    let locMatch = locations.find(l => l.district.toLowerCase() === newUser.district.toLowerCase() || l.city.toLowerCase().includes(newUser.city.toLowerCase()))
    if (!locMatch && newUser.city) {
      locMatch = {
        id: `LOC-${Date.now()}`,
        city: newUser.city,
        district: newUser.district || newUser.city,
        corridor: newUser.corridor || `${newUser.city} Arterial Network`,
        active_vehicles: Math.floor(180 + Math.random() * 80),
        congestion_level: 'Optimal',
        weather: '30°C · Clear'
      }
      setLocations(prev => [locMatch!, ...prev])
    }

    if (locMatch) {
      setCurrentLocation(locMatch)
      localStorage.setItem('lambda_active_location', JSON.stringify(locMatch))
    }

    setIsLoading(false)
    return { success: true }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('lambda_token')
    localStorage.removeItem('lambda_active_user')
    localStorage.removeItem('lambda_is_authenticated')
  }

  const updateProfile = async (updatedFields: Partial<UserProfile>) => {
    setIsLoading(true)
    try {
      const merged: UserProfile = { ...user, ...updatedFields }
      setUser(merged)
      localStorage.setItem('lambda_active_user', JSON.stringify(merged))

      // Also sync user location if city or corridor changed
      if (updatedFields.city || updatedFields.corridor) {
        const customLoc: UserLocation = {
          id: `LOC-${Date.now()}`,
          city: merged.city,
          district: merged.district || merged.city,
          corridor: merged.corridor || `${merged.city} Main Arterial`,
          active_vehicles: 248,
          congestion_level: 'Normal',
          weather: '29°C · Clear'
        }
        setLocations(prev => [customLoc, ...prev.filter(l => l.city !== customLoc.city)])
        setCurrentLocation(customLoc)
        localStorage.setItem('lambda_active_location', JSON.stringify(customLoc))
      }

      const res = await apiService.updateUserProfile(merged)
      if (res && res.user) {
        setUser((prev) => ({ ...prev, ...res.user }))
        localStorage.setItem('lambda_active_user', JSON.stringify({ ...merged, ...res.user }))
      }
      setIsLoading(false)
      return { success: true, message: 'Profile updated successfully' }
    } catch (err: any) {
      setIsLoading(false)
      return { success: false, message: err?.message || 'Failed to update profile' }
    }
  }

  const switchLocation = async (locationId: string) => {
    const loc = locations.find((l) => l.id === locationId)
    if (!loc) return

    setCurrentLocation(loc)
    localStorage.setItem('lambda_active_location', JSON.stringify(loc))

    // Update active user's location fields dynamically
    const updatedUser = {
      ...user,
      city: loc.city,
      district: loc.district,
      corridor: loc.corridor
    }
    setUser(updatedUser)
    localStorage.setItem('lambda_active_user', JSON.stringify(updatedUser))

    try {
      await apiService.switchLocation(locationId)
    } catch (err) {
      console.warn('Backend location switch warning:', err)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        locations,
        currentLocation,
        isAuthenticated,
        isLoading,
        theme,
        toggleTheme,
        setTheme,
        login,
        register,
        logout,
        updateProfile,
        switchLocation
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
