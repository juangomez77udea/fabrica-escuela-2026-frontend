import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { transactionService, categoryService, budgetService } from '../services/api'
import './TransactionForm.css'

const TransactionForm = ({ onTransactionAdded }) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [budgetAlert, setBudgetAlert] = useState(null)
  const [formData, setFormData] = useState({
    type: 'GASTO',
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    categoryId: '',
    description: ''
  })

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategories()
        setCategories(data || [])
      } catch (error) {
        console.error('Error cargando categorías:', error)
        setCategories([])
      }
    }
    if (user?.id) {
      loadCategories()
    }
  }, [user?.id])

  // Cargar presupuestos del mes actual
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const today = new Date()
        const month = today.getMonth() + 1
        const year = today.getFullYear()
        const data = await budgetService.getBudgetsForMonth(month, year)
        setBudgets(data || [])
      } catch (error) {
        console.error('Error cargando presupuestos:', error)
        setBudgets([])
      }
    }
    if (user?.id) {
      loadBudgets()
    }
  }, [user?.id])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    if (!formData.transactionDate) {
      newErrors.transactionDate = 'La fecha es obligatoria'
    } else {
      const selectedDate = new Date(formData.transactionDate)
      const today = new Date()
      if (selectedDate > today) {
        newErrors.transactionDate = 'No puedes seleccionar una fecha futura'
      }
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Selecciona una categoría'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkBudgetAlert = () => {
    setBudgetAlert(null)
    
    // Solo validar presupuesto para gastos
    if (formData.type !== 'GASTO' || !formData.categoryId || !formData.amount) {
      return true
    }

    const categoryId = parseInt(formData.categoryId)
    const amount = parseFloat(formData.amount)
    const budget = budgets.find(b => b.category.id === categoryId)

    if (budget) {
      const newTotalSpending = budget.spent + amount
      if (newTotalSpending > budget.amount) {
        const exceededAmount = newTotalSpending - budget.amount
        setBudgetAlert({
          type: 'error',
          message: `⚠️ Alerta: Esta transacción supera el presupuesto de ${budget.category.name} por $${exceededAmount.toFixed(2)}`
        })
        return true // Permitir continuar pero con alerta
      } else if (newTotalSpending >= budget.amount * 0.8) {
        const percentage = Math.round((newTotalSpending / budget.amount) * 100)
        setBudgetAlert({
          type: 'warning',
          message: `⚠️ Advertencia: Ya habrás gastado el ${percentage}% del presupuesto de ${budget.category.name}`
        })
        return true // Permitir continuar pero con advertencia
      }
    }

    return true // Sin problemas de presupuesto
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Verificar alerta de presupuesto
    checkBudgetAlert()

    setIsLoading(true)
    setSuccessMessage('')

    try {
      const transactionData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        transactionDate: formData.transactionDate,
        categoryId: parseInt(formData.categoryId),
        description: formData.description.trim(),
      }

      const response = await transactionService.createTransaction(
        user.id,
        transactionData
      )

      setSuccessMessage('¡Transacción registrada exitosamente!')
      setFormData({
        type: 'GASTO',
        amount: '',
        transactionDate: new Date().toISOString().split('T')[0],
        categoryId: '',
        description: ''
      })
      setBudgetAlert(null)

      if (onTransactionAdded) {
        onTransactionAdded(response)
      }

      // Recargar presupuestos después de guardar exitosamente
      const today = new Date()
      const month = today.getMonth() + 1
      const year = today.getFullYear()
      const updatedBudgets = await budgetService.getBudgetsForMonth(month, year)
      setBudgets(updatedBudgets || [])

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrors({
        submit: error.message || 'Error al registrar transacción'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  return (
    <div className="transaction-form-container">
      <h2>Registrar Transacción</h2>

      {successMessage && (
        <div className="alert alert-success" role="alert">
          ✓ {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="alert alert-error" role="alert">
          ✕ {errors.submit}
        </div>
      )}

      {budgetAlert && (
        <div className={`alert alert-${budgetAlert.type}`} role="alert">
          {budgetAlert.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="transaction-form" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Tipo de Transacción</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={isLoading}
              aria-invalid={!!errors.type}
            >
              <option value="GASTO">Gasto</option>
              <option value="INGRESO">Ingreso</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Monto</label>
            <div className="input-with-icon">
              <span className="input-prefix">$</span>
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
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
              />
            </div>
            {errors.amount && (
              <span id="amount-error" className="error-message">{errors.amount}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="transactionDate">Fecha</label>
            <input
              id="transactionDate"
              type="date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              disabled={isLoading}
              aria-invalid={!!errors.transactionDate}
              aria-describedby={errors.transactionDate ? 'date-error' : undefined}
            />
            {errors.transactionDate && (
              <span id="date-error" className="error-message">{errors.transactionDate}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Categoría</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={isLoading || filteredCategories.length === 0}
              aria-invalid={!!errors.categoryId}
              aria-describedby={errors.categoryId ? 'category-error' : undefined}
            >
              <option value="">Selecciona una categoría</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span id="category-error" className="error-message">{errors.categoryId}</span>
            )}
            {filteredCategories.length === 0 && (
              <span className="text-sm text-warning">No hay categorías disponibles para este tipo</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <input
            id="description"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ejemplo: Compra en supermercado"
            disabled={isLoading}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <span id="description-error" className="error-message">{errors.description}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Registrar Transacción'}
        </button>
      </form>
    </div>
  )
}

export default TransactionForm
