import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CommandCenter from './pages/CommandCenter'
import LiveFleet from './pages/LiveFleet'
import UrbanMap from './pages/UrbanMap'
import RoadIntelligence from './pages/RoadIntelligence'
import TrafficAnalytics from './pages/TrafficAnalytics'
import IncidentCenter from './pages/IncidentCenter'
import IncidentDetails from './pages/IncidentDetails'
import VehicleTracking from './pages/VehicleTracking'
import Reports from './pages/Reports'
import Architecture from './pages/Architecture'
import About from './pages/About'
import JourneyPlanner from './pages/JourneyPlanner'
import BigDataPipeline from './pages/BigDataPipeline'
import PredictionEngine from './pages/PredictionEngine'
import UserProfile from './pages/UserProfile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useEffect } from 'react'
import { UserProvider } from './context/UserContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import MitraAiAssistant from './components/common/MitraAiAssistant'
import RouteLoadingBar from './components/common/RouteLoadingBar'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <RouteLoadingBar />
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/journey-planner" element={<JourneyPlanner />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Signup />} />

          {/* Protected Console & Operations Pages */}
          <Route
            path="/command-center"
            element={
              <ProtectedRoute>
                <CommandCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/live-fleet"
            element={
              <ProtectedRoute>
                <LiveFleet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/urban-map"
            element={
              <ProtectedRoute>
                <UrbanMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/road-intelligence"
            element={
              <ProtectedRoute>
                <RoadIntelligence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/traffic-analytics"
            element={
              <ProtectedRoute>
                <TrafficAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bigdata-pipeline"
            element={
              <ProtectedRoute>
                <BigDataPipeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prediction-engine"
            element={
              <ProtectedRoute>
                <PredictionEngine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/predictions"
            element={
              <ProtectedRoute>
                <PredictionEngine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incident-center"
            element={
              <ProtectedRoute>
                <IncidentCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incident/:id"
            element={
              <ProtectedRoute>
                <IncidentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicle-tracking"
            element={
              <ProtectedRoute>
                <VehicleTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
        <MitraAiAssistant />
      </Router>
    </UserProvider>
  )
}

export default App
