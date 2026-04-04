import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Navegación principal">
      <div className="container">
        <div className="nav-content flex-between">
          <Link to="/" className="nav-logo">
            💰 Finanzas
          </Link>

          {user ? (
            <div className="nav-menu flex-center" style={{ gap: 'var(--spacing-lg)' }}>
              <div className="nav-user">
                <span className="user-name">Hola, {user.nombre}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                aria-label="Cerrar sesión"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="nav-menu flex-center" style={{ gap: 'var(--spacing-md)' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Inicia Sesión
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Regístrate
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
