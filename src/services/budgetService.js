import api from './api'

// ========================
// SERVICIOS DE PRESUPUESTOS
// ========================

export const budgetService = {
  createOrUpdateBudget: async (categoryId, amount, month, year) => {
    try {
      const response = await api.post('/budgets', {
        categoryId: parseInt(categoryId),
        amount: parseFloat(amount),
        month,
        year
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear/actualizar presupuesto' }
    }
  },

  getBudgetsForMonth: async (month, year) => {
    try {
      const response = await api.get(`/budgets?month=${month}&year=${year}`)
      return response.data || []
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener presupuestos' }
    }
  }
}

export default api