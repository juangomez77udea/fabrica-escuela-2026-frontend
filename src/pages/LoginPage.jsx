import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/api'
import './AuthForm.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, setAuthError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo no es válido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo
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

    setIsLoading(true)
    setApiError('')

    try {
      const response = await authService.login(
        formData.email,
        formData.password
      )

      // Guardar usuario en contexto
      login(response.user)

      // Redirigir al dashboard
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error.message || 'Correo o contraseña incorrectos'
      setAuthError(errorMessage)
      setApiError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Inicia Sesión</h1>
            <p>Accede a tu gestión financiera personal</p>
          </div>

          {apiError && (
            <div className="alert alert-error" role="alert">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@correo.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={isLoading}
              />
              {errors.email && (
                <span id="email-error" className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                disabled={isLoading}
              />
              {errors.password && (
                <span id="password-error" className="error-message">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="auth-footer">
            <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
