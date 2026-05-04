import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CategoryManager from '../components/CategoryManager'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('categories')

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="admin-dashboard">
      {/* Navbar de Admin */}
      <nav className="admin-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1>🛠️ Panel de Administración</h1>
          </div>
          <div className="navbar-user">
            <span className="user-greeting">
              👤 {user?.nombre || 'Admin'}
              <span className="admin-badge">ADMIN</span>
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="admin-container">
        {/* Sidebar de Navegación */}
        <aside className="admin-sidebar">
          <div className="sidebar-menu">
            <button
              className={`menu-item ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              🏷️ Categorías
            </button>
            {/* Aquí se pueden agregar más opciones de admin en el futuro */}
          </div>
        </aside>

        {/* Content Area */}
        <main className="admin-content">
          {activeTab === 'categories' && <CategoryManager />}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
