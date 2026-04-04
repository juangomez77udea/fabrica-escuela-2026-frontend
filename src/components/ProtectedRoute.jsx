import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <h2>Cargando...</h2>
          <p className="mt-2">Por favor espera mientras se cargan tus datos</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
