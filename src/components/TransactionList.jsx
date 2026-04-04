import { useState, useEffect } from 'react'
import { transactionService } from '../services/api'
import './TransactionList.css'

const TransactionList = ({ userId, refreshTrigger }) => {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  // Cargar transacciones
  useEffect(() => {
    loadTransactions()
  }, [userId, refreshTrigger])

  const loadTransactions = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await transactionService.getTransactionsByUser(userId)
      setTransactions(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar transacciones')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      return
    }

    try {
      await transactionService.deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      alert(err.message || 'Error al eliminar transacción')
    }
  }

  const filteredTransactions = filter === 'ALL'
    ? transactions
    : transactions.filter(t => t.type === filter)

  const calculateTotals = () => {
    const gastos = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const ingresos = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    return {
      gastos,
      ingresos,
      balance: ingresos - gastos
    }
  }

  const totals = calculateTotals()

  if (isLoading) {
    return (
      <div className="transaction-list-container">
        <div className="loading-state">
          <p>Cargando transacciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="transaction-list-container">
      <div>
        <h2>Resumen Financiero</h2>
        <div className="summary-grid">
          <div className="summary-card income">
            <h4>Ingresos</h4>
            <p className="summary-amount">+${totals.ingresos.toFixed(2)}</p>
          </div>
          <div className="summary-card expenses">
            <h4>Gastos</h4>
            <p className="summary-amount">-${totals.gastos.toFixed(2)}</p>
          </div>
          <div className={`summary-card balance ${totals.balance >= 0 ? 'positive' : 'negative'}`}>
            <h4>Balance</h4>
            <p className="summary-amount">${totals.balance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="transactions-header">
          <h2>Historial de Transacciones</h2>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              Todas ({transactions.length})
            </button>
            <button
              className={`filter-btn ${filter === 'INCOME' ? 'active' : ''}`}
              onClick={() => setFilter('INCOME')}
            >
              Ingresos
            </button>
            <button
              className={`filter-btn ${filter === 'EXPENSE' ? 'active' : ''}`}
              onClick={() => setFilter('EXPENSE')}
            >
              Gastos
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <p>
              {filter === 'ALL'
                ? '📊 No hay transacciones. ¡Comienza a registrar tus movimientos!'
                : `📊 No hay ${filter === 'INCOME' ? 'ingresos' : 'gastos'} registrados.`}
            </p>
          </div>
        ) : (
          <div className="transactions-table">
            <div className="table-header">
              <div className="col-date">Fecha</div>
              <div className="col-description">Descripción</div>
              <div className="col-category">Categoría</div>
              <div className="col-type">Tipo</div>
              <div className="col-amount">Monto</div>
              <div className="col-actions">Acción</div>
            </div>

            <div className="table-body">
              {filteredTransactions.map(transaction => (
                <div key={transaction.id} className="table-row">
                  <div className="col-date">
                    {new Date(transaction.transactionDate).toLocaleDateString('es-CO')}
                  </div>
                  <div className="col-description">
                    {transaction.description}
                  </div>
                  <div className="col-category">
                    <span className="category-badge">
                      {transaction.category.name}
                    </span>
                  </div>
                  <div className="col-type">
                    <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                      {transaction.type === 'INCOME' ? '⬆️ Ingreso' : '⬇️ Gasto'}
                    </span>
                  </div>
                  <div className={`col-amount ${transaction.type.toLowerCase()}`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                  </div>
                  <div className="col-actions">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="btn-delete"
                      title="Eliminar transacción"
                      aria-label={`Eliminar transacción de ${transaction.description}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionList
