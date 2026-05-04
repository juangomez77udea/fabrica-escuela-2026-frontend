import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { budgetService, categoryService } from '../services/api'
import './BudgetManager.css'

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const BudgetManager = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: ''
  })

  // Cargar categorías y presupuestos
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [categoriesData, budgetsData] = await Promise.all([
          categoryService.getCategories(),
          budgetService.getBudgetsForMonth(currentMonth, currentYear)
        ])
        setCategories(categoriesData || [])
        setBudgets(budgetsData || [])
      } catch (err) {
        setError(err.message || 'Error al cargar datos')
      } finally {
        setIsLoading(false)
      }
    }
    if (user?.id) {
      loadData()
    }
  }, [user?.id, currentMonth, currentYear])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.categoryId || !formData.amount) {
      setError('Completa todos los campos')
      return
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await budgetService.createOrUpdateBudget(
        formData.categoryId,
        formData.amount,
        currentMonth,
        currentYear
      )

      // Actualizar lista de presupuestos
      setBudgets(prev => {
        const existingIndex = prev.findIndex(
          b => b.category.id === parseInt(formData.categoryId)
        )
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = response
          return updated
        }
        return [...prev, response]
      })

      setSuccessMessage(`✓ Presupuesto guardado para ${response.category.name}`)
      setFormData({ categoryId: '', amount: '' })

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.message || 'Error al guardar presupuesto')
    } finally {
      setIsLoading(false)
    }
  }

  // Obtener categorías sin presupuesto
  const getUnbudgetedCategories = () => {
    const budgetedCategoryIds = new Set(budgets.map(b => b.category.id))
    return categories.filter(cat => !budgetedCategoryIds.has(cat.id))
  }

  // Calcular porcentaje de gasto
  const getSpendingPercentage = (spent, amount) => {
    return Math.min((spent / amount) * 100, 100)
  }

  // Determinar color según el nivel de gasto
  const getSpendingColor = (percentage) => {
    if (percentage >= 100) return 'danger' // Rojo
    if (percentage >= 80) return 'warning' // Naranja
    return 'success' // Verde
  }

  if (isLoading && budgets.length === 0) {
    return (
      <div className="budget-container">
        <p className="loading-state">Cargando presupuestos...</p>
      </div>
    )
  }

  return (
    <div className="budget-container">
      <div className="budget-header">
        <h2>💰 Gestión de Presupuestos</h2>
        <p className="subtitle">
          {new Date(currentYear, currentMonth - 1).toLocaleDateString('es-CO', {
            month: 'long',
            year: 'numeric'
          }).toUpperCase()}
        </p>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      {/* Formulario para agregar presupuesto */}
      <div className="budget-form-container">
        <h3>Crear o Actualizar Presupuesto</h3>

        <form onSubmit={handleSubmit} className="budget-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categoryId">Categoría</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Selecciona una categoría</option>
                {getUnbudgetedCategories().map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Monto Presupuestado</label>
              <div className="input-with-currency">
                <span className="currency-symbol">$</span>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar Presupuesto'}
          </button>
        </form>
      </div>

      {/* Lista de presupuestos (HU-13) */}
      {budgets.length === 0 ? (
        <div className="empty-budgets">
          <p>📊 No tienes presupuestos configurados para este mes.</p>
          <p>Comienza creando un presupuesto arriba.</p>
        </div>
      ) : (
        <div className="budgets-list">
          <h3>Presupuestos Configurados</h3>

          <div className="budgets-grid">
            {budgets.map(budget => {
              const percentage = getSpendingPercentage(budget.spent, budget.amount)
              const color = getSpendingColor(percentage)

              return (
                <div key={budget.id} className={`budget-card ${color}`}>
                  <div className="budget-header-card">
                    <h4>{budget.category.name}</h4>
                    <span className="spending-percentage">{Math.round(percentage)}%</span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  {/* Información de gasto */}
                  <div className="budget-details">
                    <div className="detail-row">
                      <span className="detail-label">Presupuestado:</span>
                      <span className="detail-value">
                        {formatCurrency(parseFloat(budget.amount))}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Gastado:</span>
                      <span className={`detail-value spent ${color}`}>
                        {formatCurrency(parseFloat(budget.spent))}
                      </span>
                    </div>

                    <div className="detail-row highlight">
                      <span className="detail-label">Disponible:</span>
                      <span className={`detail-value remaining ${color}`}>
                        {formatCurrency(parseFloat(budget.remaining))}
                      </span>
                    </div>
                  </div>

                  {/* Alerta si se supera (HU-13) */}
                  {percentage >= 100 && (
                    <div className="budget-alert" role="alert">
                      ⚠️ Has superado el presupuesto de esta categoría
                    </div>
                  )}

                  {percentage >= 80 && percentage < 100 && (
                    <div className="budget-warning" role="alert">
                      ℹ️ Ya gastaste el {Math.round(percentage)}% de tu presupuesto
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Resumen total de presupuestos */}
      {budgets.length > 0 && (
        <div className="budget-summary">
          <h3>Resumen Total de Presupuestos</h3>

          <div className="summary-stats">
            <div className="stat-card">
              <span className="stat-label">Presupuestado Total</span>
              <span className="stat-value">
                {formatCurrency(
                  budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0)
                )}
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Gastado Total</span>
              <span className="stat-value spent">
                {formatCurrency(
                  budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0)
                )}
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Disponible Total</span>
              <span className="stat-value remaining">
                {formatCurrency(
                  budgets.reduce((sum, b) => sum + parseFloat(b.remaining), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BudgetManager
