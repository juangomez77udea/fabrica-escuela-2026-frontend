import { useState, useEffect } from 'react'
import { categoryService } from '../services/api'
import './CategoryManager.css'

const CategoryManager = () => {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // State para formulario de creación
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    name: '',
    descripcion: '',
    type: 'GASTO'
  })
  const [createErrors, setCreateErrors] = useState({})

  // State para edición
  const [editingId, setEditingId] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    descripcion: '',
    type: 'GASTO'
  })
  const [editErrors, setEditErrors] = useState({})
  const [editLoading, setEditLoading] = useState(false)

  // Cargar categorías
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await categoryService.getCategories()
      setCategories(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar categorías')
    } finally {
      setIsLoading(false)
    }
  }

  // ========================
  // CREAR CATEGORÍA
  // ========================

  const validateCreateForm = () => {
    const newErrors = {}

    if (!createFormData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }

    if (!createFormData.type) {
      newErrors.type = 'Selecciona un tipo'
    }

    setCreateErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateChange = (e) => {
    const { name, value } = e.target
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (createErrors[name]) {
      setCreateErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()

    if (!validateCreateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const newCategory = await categoryService.createCategory(
        createFormData.name.trim(),
        createFormData.descripcion.trim(),
        createFormData.type
      )

      setCategories(prev => [...prev, newCategory])
      setCreateFormData({
        name: '',
        descripcion: '',
        type: 'GASTO'
      })
      setShowCreateForm(false)
      setSuccessMessage('✅ Categoría creada exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setCreateErrors({
        submit: err.message || 'Error al crear categoría'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ========================
  // EDITAR CATEGORÍA
  // ========================

  const validateEditForm = () => {
    const newErrors = {}

    if (!editFormData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }

    if (!editFormData.type) {
      newErrors.type = 'Selecciona un tipo'
    }

    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEditClick = (category) => {
    setEditingId(category.id)
    setEditFormData({
      name: category.name,
      descripcion: category.descripcion || '',
      type: category.type
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

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    if (!validateEditForm()) {
      return
    }

    setEditLoading(true)

    try {
      const updatedCategory = await categoryService.updateCategory(
        editingId,
        editFormData.name.trim(),
        editFormData.descripcion.trim(),
        editFormData.type
      )

      setCategories(prev =>
        prev.map(c => c.id === editingId ? updatedCategory : c)
      )
      setEditingId(null)
      setEditFormData({
        name: '',
        descripcion: '',
        type: 'GASTO'
      })
      setSuccessMessage('✅ Categoría actualizada exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setEditErrors({
        submit: err.message || 'Error al actualizar categoría'
      })
    } finally {
      setEditLoading(false)
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditFormData({
      name: '',
      descripcion: '',
      type: 'GASTO'
    })
    setEditErrors({})
  }

  // ========================
  // ELIMINAR CATEGORÍA
  // ========================

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      return
    }

    try {
      await categoryService.deleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
      setSuccessMessage('✅ Categoría eliminada exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      alert(err.message || 'Error al eliminar categoría')
    }
  }

  if (isLoading) {
    return (
      <div className="category-manager">
        <div className="loading-state">
          <p>Cargando categorías...</p>
        </div>
      </div>
    )
  }

  // Agrupar categorías por tipo
  const incomCategories = categories.filter(c => c.type === 'INGRESO')
  const expenseCategories = categories.filter(c => c.type === 'GASTO')

  return (
    <div className="category-manager">
      <div className="category-header">
        <h2>🏷️ Administrar Categorías</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '❌ Cancelar' : '➕ Nueva Categoría'}
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Formulario de Creación */}
      {showCreateForm && (
        <div className="category-form-container">
          <h3>Nueva Categoría</h3>
          <form onSubmit={handleCreateSubmit} className="category-form" noValidate>
            <div className="form-group">
              <label htmlFor="create-name">Nombre *</label>
              <input
                id="create-name"
                type="text"
                name="name"
                value={createFormData.name}
                onChange={handleCreateChange}
                placeholder="Ej: Alimentación"
                disabled={isLoading}
                aria-invalid={!!createErrors.name}
              />
              {createErrors.name && (
                <span className="error-message">{createErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="create-descripcion">Descripción</label>
              <input
                id="create-descripcion"
                type="text"
                name="descripcion"
                value={createFormData.descripcion}
                onChange={handleCreateChange}
                placeholder="Ej: Gastos de comida y supermercado"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="create-type">Tipo *</label>
              <select
                id="create-type"
                name="type"
                value={createFormData.type}
                onChange={handleCreateChange}
                disabled={isLoading}
                aria-invalid={!!createErrors.type}
              >
                <option value="GASTO">Gasto</option>
                <option value="INGRESO">Ingreso</option>
              </select>
              {createErrors.type && (
                <span className="error-message">{createErrors.type}</span>
              )}
            </div>

            {createErrors.submit && (
              <div className="alert alert-error">
                {createErrors.submit}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Creando...' : '💾 Crear Categoría'}
            </button>
          </form>
        </div>
      )}

      {/* Categorías de Ingresos */}
      <div className="categories-section">
        <h3>📈 Categorías de Ingresos ({incomCategories.length})</h3>
        {incomCategories.length === 0 ? (
          <p className="empty-message">No hay categorías de ingreso</p>
        ) : (
          <div className="categories-grid">
            {incomCategories.map(category => (
              <div key={category.id}>
                <div className="category-card">
                  <div className="category-header-card">
                    <h4>{category.name}</h4>
                    <div className="category-actions">
                      <button
                        className="btn-edit-small"
                        onClick={() => handleEditClick(category)}
                        disabled={editingId !== null}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete-small"
                        onClick={() => handleDelete(category.id)}
                        disabled={editingId !== null}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {category.descripcion && (
                    <p className="category-description">{category.descripcion}</p>
                  )}
                  <span className="category-type income">Ingreso</span>
                </div>

                {/* Formulario de Edición */}
                {editingId === category.id && (
                  <div className="category-edit-form">
                    <form onSubmit={handleEditSubmit} noValidate>
                      <div className="form-group">
                        <label htmlFor="edit-name">Nombre</label>
                        <input
                          id="edit-name"
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                          disabled={editLoading}
                        />
                        {editErrors.name && (
                          <span className="error-message">{editErrors.name}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="edit-descripcion">Descripción</label>
                        <input
                          id="edit-descripcion"
                          type="text"
                          name="descripcion"
                          value={editFormData.descripcion}
                          onChange={handleEditChange}
                          disabled={editLoading}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="edit-type">Tipo</label>
                        <select
                          id="edit-type"
                          name="type"
                          value={editFormData.type}
                          onChange={handleEditChange}
                          disabled={editLoading}
                        >
                          <option value="GASTO">Gasto</option>
                          <option value="INGRESO">Ingreso</option>
                        </select>
                      </div>

                      {editErrors.submit && (
                        <div className="alert alert-error">
                          {editErrors.submit}
                        </div>
                      )}

                      <div className="form-actions">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={editLoading}
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
        )}
      </div>

      {/* Categorías de Gastos */}
      <div className="categories-section">
        <h3>📉 Categorías de Gastos ({expenseCategories.length})</h3>
        {expenseCategories.length === 0 ? (
          <p className="empty-message">No hay categorías de gasto</p>
        ) : (
          <div className="categories-grid">
            {expenseCategories.map(category => (
              <div key={category.id}>
                <div className="category-card">
                  <div className="category-header-card">
                    <h4>{category.name}</h4>
                    <div className="category-actions">
                      <button
                        className="btn-edit-small"
                        onClick={() => handleEditClick(category)}
                        disabled={editingId !== null}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete-small"
                        onClick={() => handleDelete(category.id)}
                        disabled={editingId !== null}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {category.descripcion && (
                    <p className="category-description">{category.descripcion}</p>
                  )}
                  <span className="category-type expense">Gasto</span>
                </div>

                {/* Formulario de Edición */}
                {editingId === category.id && (
                  <div className="category-edit-form">
                    <form onSubmit={handleEditSubmit} noValidate>
                      <div className="form-group">
                        <label htmlFor="edit-name">Nombre</label>
                        <input
                          id="edit-name"
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                          disabled={editLoading}
                        />
                        {editErrors.name && (
                          <span className="error-message">{editErrors.name}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="edit-descripcion">Descripción</label>
                        <input
                          id="edit-descripcion"
                          type="text"
                          name="descripcion"
                          value={editFormData.descripcion}
                          onChange={handleEditChange}
                          disabled={editLoading}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="edit-type">Tipo</label>
                        <select
                          id="edit-type"
                          name="type"
                          value={editFormData.type}
                          onChange={handleEditChange}
                          disabled={editLoading}
                        >
                          <option value="GASTO">Gasto</option>
                          <option value="INGRESO">Ingreso</option>
                        </select>
                      </div>

                      {editErrors.submit && (
                        <div className="alert alert-error">
                          {editErrors.submit}
                        </div>
                      )}

                      <div className="form-actions">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={editLoading}
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
        )}
      </div>
    </div>
  )
}

export default CategoryManager
