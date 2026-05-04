import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import BudgetManager from '../components/BudgetManager'
import './DashboardPage.css'

const DashboardPage = () => {
  const { user } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState('transactions')

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Mi Panel Financiero</h1>
        <p className="dashboard-subtitle">Bienvenido, {user?.nombre}. Gestiona tus finanzas personales</p>
      </div>

      {/* Tabs de navegación */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
          aria-selected={activeTab === 'transactions'}
        >
          📊 Transacciones
        </button>
        <button
          className={`tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
          onClick={() => setActiveTab('budgets')}
          aria-selected={activeTab === 'budgets'}
        >
          💰 Presupuestos
        </button>
      </div>

      <div className="dashboard-content">
        {/* Pestaña de Transacciones */}
        {activeTab === 'transactions' && (
          <>
            <aside className="dashboard-sidebar">
              <TransactionForm onTransactionAdded={handleTransactionAdded} />
            </aside>

            <main className="dashboard-main">
              <TransactionList userId={user?.id} refreshTrigger={refreshTrigger} />
            </main>
          </>
        )}

        {/* Pestaña de Presupuestos (HU-13) */}
        {activeTab === 'budgets' && (
          <main className="dashboard-main full-width">
            <BudgetManager />
          </main>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
