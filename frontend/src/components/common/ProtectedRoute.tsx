import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../../context/UserContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredAccountType?: 'ADMIN' | 'USER'
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredAccountType }) => {
  const { isAuthenticated, user } = useUser()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login preserving the attempted target destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // If a specific account type is required and user does not match
  if (requiredAccountType && user?.account_type !== requiredAccountType) {
    if (user?.account_type === 'USER') {
      return <Navigate to="/journey-planner" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
