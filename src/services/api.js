import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  config => {
    const user = localStorage.getItem('user')

    if (user) {
      const parsedUser = JSON.parse(user)

      if (parsedUser.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`
        console.log('Sending token:', parsedUser.token.substring(0, 20) + '...')
      } else {
        console.log('No token found in user data')
      }
    } else {
      console.log('No user data in localStorage')
    }

    return config
  },
  error => Promise.reject(error)
)

export const authService = {
  register: async (nombre, email, password) => {
    const response = await api.post('/auth/register', {
      nombre,
      email,
      password
    })
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    })
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  }
}

export const transactionService = {
  getAll: async () => {
    const response = await api.get('/transactions')
    return response.data
  },

  getTransactionsByUser: async (userId) => {
    const response = await api.get(`/transactions/user/${userId}`)
    return response.data
  },

  createTransaction: async (userId, transaction) => {
    const response = await api.post(`/transactions?userId=${userId}`, transaction)
    return response.data
  },

  create: async transaction => {
    const response = await api.post('/transactions', transaction)
    return response.data
  },

  update: async (id, transaction) => {
    const response = await api.put(`/transactions/${id}`, transaction)
    return response.data
  },

  delete: async (id) => {
    await api.delete(`/transactions/${id}`)
  }
}

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories')
    return response.data
  },

  getCategories: async () => {
    const response = await api.get('/categories')
    return response.data
  },

  createCategory: async (name, descripcion, type) => {
    const response = await api.post('/categories', {
      name,
      descripcion,
      type
    })
    return response.data
  },

  updateCategory: async (id, name, descripcion, type) => {
    const response = await api.put(`/categories/${id}`, {
      name,
      descripcion,
      type
    })
    return response.data
  },

  deleteCategory: async id => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  }
}

export const budgetService = {
  getAll: async () => {
    const response = await api.get('/budgets')
    return response.data
  },

  getBudgetsForMonth: async (month, year) => {
    const response = await api.get(`/budgets?month=${month}&year=${year}`)
    return response.data
  },

  create: async budget => {
    const response = await api.post('/budgets', budget)
    return response.data
  },

  createOrUpdateBudget: async (categoryId, amount, month, year) => {
    const response = await api.post('/budgets', {
      categoryId: parseInt(categoryId),
      amount: parseFloat(amount),
      month,
      year
    })
    return response.data
  },

  update: async (id, budget) => {
    const response = await api.put(`/budgets/${id}`, budget)
    return response.data
  },

  delete: async id => {
    const response = await api.delete(`/budgets/${id}`)
    return response.data
  }
}

export default api