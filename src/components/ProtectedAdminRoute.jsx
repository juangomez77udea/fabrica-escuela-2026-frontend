import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAdmin } from '../contexts/AdminContext'

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const { isAdmin } = useAdmin()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedAdminRoute
