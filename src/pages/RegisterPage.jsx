import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/api'
import './AuthForm.css'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { login, setAuthError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener mínimo 2 caracteres'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo no es válido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener mínimo 8 caracteres'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
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
    // Limpiar error del campo cuando el usuario empieza a escribir
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
    setSuccessMessage('')

    try {
      const response = await authService.register(
        formData.nombre,
        formData.email,
        formData.password
      )

      setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...')
      setFormData({ nombre: '', email: '', password: '', confirmPassword: '' })

      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      const errorMessage = error.message || 'Error al crear la cuenta'
      setAuthError(errorMessage)
      setErrors({ submit: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Crea tu Cuenta</h1>
            <p>Comienza a gestionar tus finanzas personales hoy</p>
          </div>

          {successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )}

          {errors.submit && (
            <div className="alert alert-error" role="alert">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan Pérez"
                aria-invalid={!!errors.nombre}
                aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                disabled={isLoading}
              />
              {errors.nombre && (
                <span id="nombre-error" className="error-message">{errors.nombre}</span>
              )}
            </div>

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
                placeholder="Mínimo 8 caracteres"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                disabled={isLoading}
              />
              {errors.password && (
                <span id="password-error" className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <span id="confirmPassword-error" className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <div className="auth-footer">
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
