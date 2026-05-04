import { useState, useEffect } from 'react'
import { transactionService, categoryService } from '../services/api'
import './TransactionList.css'

// Función para formatear moneda con separadores de miles
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const TransactionList = ({ userId, refreshTrigger }) => {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editErrors, setEditErrors] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [editFormData, setEditFormData] = useState({
    amount: '',
    transactionDate: '',
    categoryId: '',
    description: ''
  })

  // Cargar transacciones
  useEffect(() => {
    if (userId) {
      loadTransactions()
      loadCategories()
    }
  }, [userId, refreshTrigger])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories()
      setCategories(data || [])
    } catch (err) {
      console.error('Error cargando categorías:', err)
      setCategories([])
    }
  }

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
      await transactionService.delete(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      alert(err.message || 'Error al eliminar transacción')
    }
  }

  const handleEditClick = (transaction) => {
    setEditingId(transaction.id)
    setEditFormData({
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      categoryId: transaction.category.id,
      description: transaction.description
    })
    setEditErrors({})
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateEditForm = () => {
    const newErrors = {}

    if (!editFormData.amount || parseFloat(editFormData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    if (!editFormData.transactionDate) {
      newErrors.transactionDate = 'La fecha es obligatoria'
    } else {
      const selectedDate = new Date(editFormData.transactionDate)
      const today = new Date()
      if (selectedDate > today) {
        newErrors.transactionDate = 'No puedes seleccionar una fecha futura'
      }
    }

    if (!editFormData.categoryId) {
      newErrors.categoryId = 'Selecciona una categoría'
    }

    if (!editFormData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria'
    }

    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    if (!validateEditForm()) {
      return
    }

    setEditLoading(true)

    try {
      const updateData = {
        type: transactions.find(t => t.id === editingId).type,
        amount: parseFloat(editFormData.amount),
        transactionDate: editFormData.transactionDate,
        categoryId: parseInt(editFormData.categoryId),
        description: editFormData.description.trim()
      }

      const response = await transactionService.update(editingId, updateData)
      
      setTransactions(prev => prev.map(t => t.id === editingId ? response : t))
      setEditingId(null)
      setEditFormData({
        amount: '',
        transactionDate: '',
        categoryId: '',
        description: ''
      })
    } catch (err) {
      setEditErrors({
        submit: err.message || 'Error al actualizar transacción'
      })
    } finally {
      setEditLoading(false)
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditFormData({
      amount: '',
      transactionDate: '',
      categoryId: '',
      description: ''
    })
    setEditErrors({})
  }

  // Obtener todas las categorías únicas de las transacciones
  const getUniqueCategories = () => {
    const categories = new Map()
    transactions.forEach(t => {
      if (t.category && !categories.has(t.category.id)) {
        categories.set(t.category.id, t.category)
      }
    })
    return Array.from(categories.values())
  }

  // Filtrado combinado por tipo, categoría y fecha (HU-11)
  const filteredTransactions = transactions.filter(transaction => {
    // Filtro por tipo (INGRESO/GASTO/ALL)
    if (filterType !== 'ALL' && transaction.type !== filterType) {
      return false
    }

    // Filtro por categoría (HU-11)
    if (filterCategory !== 'ALL' && transaction.category.id !== parseInt(filterCategory)) {
      return false
    }

    // Filtro por rango de fechas (HU-11)
    if (filterStartDate) {
      const transactionDate = new Date(transaction.transactionDate)
      const startDate = new Date(filterStartDate)
      if (transactionDate < startDate) {
        return false
      }
    }

    if (filterEndDate) {
      const transactionDate = new Date(transaction.transactionDate)
      const endDate = new Date(filterEndDate)
      // Ajustar endDate al final del día
      endDate.setHours(23, 59, 59, 999)
      if (transactionDate > endDate) {
        return false
      }
    }

    return true
  })

  // Calcular totales solo de las transacciones filtradas
  const calculateTotalsFiltered = () => {
    const gastos = filteredTransactions
      .filter(t => t.type === 'GASTO')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const ingresos = filteredTransactions
      .filter(t => t.type === 'INGRESO')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    return {
      gastos,
      ingresos,
      balance: ingresos - gastos
    }
  }

  const resetFilters = () => {
    setFilterType('ALL')
    setFilterCategory('ALL')
    setFilterStartDate('')
    setFilterEndDate('')
  }

  const hasActiveFilters = filterType !== 'ALL' || filterCategory !== 'ALL' || filterStartDate || filterEndDate

  const calculateTotals = () => {
    const gastos = transactions
      .filter(t => t.type === 'GASTO')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const ingresos = transactions
      .filter(t => t.type === 'INGRESO')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    return {
      gastos,
      ingresos,
      balance: ingresos - gastos
    }
  }

  const totals = calculateTotals()
  const totalsFiltered = calculateTotalsFiltered()

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
        <h2>Resumen Financiero {hasActiveFilters && <span className="summary-badge">(Filtrado)</span>}</h2>
        <div className="summary-grid">
          <div className="summary-card income">
            <h4>Ingresos</h4>
            <p className="summary-amount">+{formatCurrency(hasActiveFilters ? totalsFiltered.ingresos : totals.ingresos)}</p>
          </div>
          <div className="summary-card expenses">
            <h4>Gastos</h4>
            <p className="summary-amount">-{formatCurrency(hasActiveFilters ? totalsFiltered.gastos : totals.gastos)}</p>
          </div>
          <div className={`summary-card balance ${(hasActiveFilters ? totalsFiltered.balance : totals.balance) >= 0 ? 'positive' : 'negative'}`}>
            <h4>Balance</h4>
            <p className="summary-amount">{formatCurrency(hasActiveFilters ? totalsFiltered.balance : totals.balance)}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="transactions-header">
          <h2>Historial de Transacciones</h2>
          <button
            className="btn-toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
            title="Mostrar/ocultar filtros"
            aria-label={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          >
            🔍 {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            {hasActiveFilters && <span className="filter-badge">{' ✓'}</span>}
          </button>
        </div>

        {/* Panel de Filtros Avanzados (HU-11) */}
        {showFilters && (
          <div className="filter-panel">
            <h3>Filtrar Transacciones</h3>

            <div className="filters-grid">
              {/* Filtro por Tipo */}
              <div className="filter-group">
                <label htmlFor="filterType">Tipo de Transacción</label>
                <select
                  id="filterType"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">Todas</option>
                  <option value="INGRESO">Ingresos</option>
                  <option value="GASTO">Gastos</option>
                </select>
              </div>

              {/* Filtro por Categoría (HU-11) */}
              <div className="filter-group">
                <label htmlFor="filterCategory">Categoría</label>
                <select
                  id="filterCategory"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">Todas las categorías</option>
                  {getUniqueCategories().map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Fecha Inicial (HU-11) */}
              <div className="filter-group">
                <label htmlFor="filterStartDate">Desde</label>
                <input
                  id="filterStartDate"
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="filter-input"
                />
              </div>

              {/* Filtro por Fecha Final (HU-11) */}
              <div className="filter-group">
                <label htmlFor="filterEndDate">Hasta</label>
                <input
                  id="filterEndDate"
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            {/* Botón para resetear filtros */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn btn-secondary"
                title="Limpiar todos los filtros"
              >
                🔄 Limpiar Filtros
              </button>
            )}
          </div>
        )}

        {/* Resumen por tipo (filtrado) */}
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            Todas ({filteredTransactions.length})
          </button>
          <button
            className={`filter-btn ${filterType === 'INGRESO' ? 'active' : ''}`}
            onClick={() => setFilterType('INGRESO')}
          >
            Ingresos
          </button>
          <button
            className={`filter-btn ${filterType === 'GASTO' ? 'active' : ''}`}
            onClick={() => setFilterType('GASTO')}
          >
            Gastos
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <p>
              {filterType === 'ALL'
                ? '📊 No hay transacciones. ¡Comienza a registrar tus movimientos!'
                : `📊 No hay ${filterType === 'INGRESO' ? 'ingresos' : 'gastos'} registrados.`}
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
                <div key={transaction.id}>
                  <div className="table-row">
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
                      {transaction.type === 'INGRESO' ? '⬆️ Ingreso' : '⬇️ Gasto'}
                    </span>
                  </div>
                  <div className={`col-amount ${transaction.type.toLowerCase()}`}>
                    {transaction.type === 'INGRESO' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                  </div>
                  <div className="col-actions">
                    <button
                      onClick={() => handleEditClick(transaction)}
                      className="btn-edit"
                      title="Editar transacción"
                      aria-label={`Editar transacción de ${transaction.description}`}
                      disabled={editingId !== null}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="btn-delete"
                      title="Eliminar transacción"
                      aria-label={`Eliminar transacción de ${transaction.description}`}
                      disabled={editingId !== null}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Formulario de Edición Inline (HU-09) */}
                {editingId === transaction.id && (
                  <div className="edit-form-row">
                    <form onSubmit={handleEditSubmit} className="edit-form" noValidate>
                      <div className="edit-form-fields">
                        <div className="edit-form-group">
                          <label htmlFor="edit-amount">Monto</label>
                          <div className="input-with-icon">
                            <span className="input-prefix">$</span>
                            <input
                              id="edit-amount"
                              type="number"
                              name="amount"
                              value={editFormData.amount}
                              onChange={handleEditChange}
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              disabled={editLoading}
                              aria-invalid={!!editErrors.amount}
                            />
                          </div>
                          {editErrors.amount && (
                            <span className="error-message">{editErrors.amount}</span>
                          )}
                        </div>

                        <div className="edit-form-group">
                          <label htmlFor="edit-date">Fecha</label>
                          <input
                            id="edit-date"
                            type="date"
                            name="transactionDate"
                            value={editFormData.transactionDate}
                            onChange={handleEditChange}
                            max={new Date().toISOString().split('T')[0]}
                            disabled={editLoading}
                            aria-invalid={!!editErrors.transactionDate}
                          />
                          {editErrors.transactionDate && (
                            <span className="error-message">{editErrors.transactionDate}</span>
                          )}
                        </div>

                        <div className="edit-form-group">
                          <label htmlFor="edit-category">Categoría</label>
                          <select
                            id="edit-category"
                            name="categoryId"
                            value={editFormData.categoryId}
                            onChange={handleEditChange}
                            disabled={editLoading}
                            aria-invalid={!!editErrors.categoryId}
                          >
                            <option value="">Selecciona una categoría</option>
                            {categories
                              .filter(cat => cat.type === transaction.type)
                              .map(cat => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                          </select>
                          {editErrors.categoryId && (
                            <span className="error-message">{editErrors.categoryId}</span>
                          )}
                        </div>

                        <div className="edit-form-group">
                          <label htmlFor="edit-description">Descripción</label>
                          <input
                            id="edit-description"
                            type="text"
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditChange}
                            placeholder="Ejemplo: Compra en supermercado"
                            disabled={editLoading}
                            aria-invalid={!!editErrors.description}
                          />
                          {editErrors.description && (
                            <span className="error-message">{editErrors.description}</span>
                          )}
                        </div>
                      </div>

                      {editErrors.submit && (
                        <div className="alert alert-error">
                          {editErrors.submit}
                        </div>
                      )}

                      <div className="edit-form-actions">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={editLoading}
                          aria-busy={editLoading}
                        >
                          {editLoading ? 'Guardando...' : '💾 Guardar'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleEditCancel}
                          disabled={editLoading}
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}
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
