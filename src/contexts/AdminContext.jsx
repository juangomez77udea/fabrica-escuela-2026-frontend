import { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'

const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
  const { user } = useAuth()

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AdminContext.Provider value={{ isAdmin, user }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin debe usarse dentro de AdminProvider')
  }
  return context
}
