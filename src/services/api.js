import axios from 'axios'

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
            'Content-Type': 'application/json'
      }
})

// Interceptor para agregar token si existe
api.interceptors.request.use(
      config => {
            const user = localStorage.getItem('user')
            if (user) {
                  // Si en el futuro implementas JWT, agrega aquí el token
                  // config.headers.Authorization = `Bearer ${token}`
            }
            return config
      },
      error => Promise.reject(error)
)

// ========================
// SERVICIOS DE AUTENTICACIÓN
// ========================

export const authService = {
      register: async (nombre, email, password) => {
            try {
                  const response = await api.post('/auth/register', {
                        nombre,
                        email,
                        password
                  })
                  return response.data
            } catch (error) {
                  throw error.response?.data || { message: 'Error en registro' }
            }
      },

      login: async (email, password) => {
            try {
                  const response = await api.post('/auth/login', {
                        email,
                        password
                  })
                  return response.data
            } catch (error) {
                  throw error.response?.data || { message: 'Error en inicio de sesión' }
            }
      },

      logout: () => {
            localStorage.removeItem('user')
            localStorage.removeItem('userId')
      }
}

// ========================
// SERVICIOS DE TRANSACCIONES
// ========================

export const transactionService = {
      createTransaction: async (userId, transactionData) => {
            try {
                  const response = await api.post(
                        `/transactions?userId=${userId}`,
                        transactionData
                  )
                  return response.data
            } catch (error) {
                  throw error.response?.data || { message: 'Error al crear transacción' }
            }
      },

      getTransactionsByUser: async (userId) => {
            try {
                  const response = await api.get(`/transactions/user/${userId}`)
                  return response.data
            } catch (error) {
                  throw error.response?.data || { message: 'Error al obtener transacciones' }
            }
      },

      getTransaction: async (id) => {
            try {
                  const response = await api.get(`/transactions/${id}`)
                  return response.data
            } catch (error) {
                  throw error.response?.data || { message: 'Error al obtener transacción' }
            }
      },

      deleteTransaction: async (id) => {
            try {
                  await api.delete(`/transactions/${id}`)
                  return true
            } catch (error) {
                  throw error.response?.data || { message: 'Error al eliminar transacción' }
            }
      }
}

// ========================
// SERVICIOS DE CATEGORÍAS
// ========================

export const categoryService = {
      createCategory: async (name, descripcion, type) => {
            try {
                  const response = await api.post('/categories', {
                        name,
                        descripcion,
                        type
                  })
                  return response.data
            } catch (error) {
                  throw error.response?.data || { message: 'Error al crear categoría' }
            }
      },

      getCategories: async () => {
            try {
                  const response = await api.get('/categories')
                  return response.data
            } catch (error) {
                  throw error.response?.data || { message: 'Error al obtener categorías' }
            }
      },

      getCategory: async (id) => {
            try {
                  const response = await api.get(`/categories/${id}`)
                  return response.data
            } catch (error) {
                  throw error.response?.data || { message: 'Error al obtener categoría' }
            }
      },

      updateCategory: async (id, name, descripcion, type) => {
            try {
                  const response = await api.put(`/categories/${id}`, {
                        name,
                        descripcion,
                        type
                  })
                  return response.data
            } catch (error) {
                  throw error.response?.data || { message: 'Error al actualizar categoría' }
            }
      },

      deleteCategory: async (id) => {
            try {
                  await api.delete(`/categories/${id}`)
                  return true
            } catch (error) {
                  throw error.response?.data || { message: 'Error al eliminar categoría' }
            }
      }
}

export default api
