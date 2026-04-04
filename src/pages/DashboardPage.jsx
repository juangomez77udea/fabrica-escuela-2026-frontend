import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import './DashboardPage.css'

const DashboardPage = () => {
  const { user } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Mi Panel Financiero</h1>
        <p className="dashboard-subtitle">Bienvenido, {user?.nombre}. Gestiona tus finanzas personales</p>
      </div>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <TransactionForm onTransactionAdded={handleTransactionAdded} />
        </aside>

        <main className="dashboard-main">
          <TransactionList userId={user?.id} refreshTrigger={refreshTrigger} />
        </main>
      </div>
    </div>
  )
}

export default DashboardPage
