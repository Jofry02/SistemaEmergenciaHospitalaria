import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, CheckCircle, Loader, Trash2, Save, AlertTriangle } from 'lucide-react'
import DataService from '../services/api'
import { useForm } from '../hooks/useForm'
import PersonalDataForm from './PersonalDataForm'

export default function RegistroPage() {
  const navigate = useNavigate()
  const {
    formData,
    errors,
    updateField,
    validatePersonalData,
    resetForm,
    loadPatient,
    setFormData,
  } = useForm()

  const [search, setSearch] = useState('')
  const [pacientes, setPacientes] = useState([])
  const [selectedPaciente, setSelectedPaciente] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [searching, setSearching] = useState(false)
  const [apiError, setApiError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isEditing = selectedPaciente && (selectedPaciente.pacienteId || selectedPaciente.PacienteID)

  useEffect(() => {
    if (!search.trim()) {
      setPacientes([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await DataService.buscarPaciente(search)
        const list = res?.data || []
        setPacientes(Array.isArray(list) ? list : [])
      } catch {
        setPacientes([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  function handleSelectPatient(p) {
    setSelectedPaciente(p)
    setSaved(false)
    setApiError('')
    setConfirmDelete(false)
    loadPatient({
      nombre: p.nombreCompleto || p.NombreCompleto || p.nombre || '',
      cedula: p.cedula || p.Cedula || '',
      fechaNac: p.fechaNacimiento || p.FechaNacimiento || p.fechaNac || '',
      sangre: p.tipoSangre || p.TipoSangre || p.sangre || '',
      sexo: p.sexo || p.Sexo || '',
      telefono: p.telefonoContacto || p.TelefonoContacto || p.telefono || '',
    }, formData)
  }

  function handleNewPatient() {
    setSelectedPaciente(null)
    setSaved(false)
    setApiError('')
    setConfirmDelete(false)
    resetForm()
  }

  async function handleSave() {
    if (!validatePersonalData()) return
    setSaving(true)
    setApiError('')
    setSaved(false)
    try {
      if (isEditing) {
        const pacienteId = selectedPaciente.pacienteId || selectedPaciente.PacienteID
        const res = await DataService.actualizarPaciente({ ...formData, pacienteId })
        if (res?.success) {
          setSaved(true)
          const res2 = await DataService.buscarPaciente(search)
          const list = res2?.data || []
          setPacientes(Array.isArray(list) ? list : [])
        } else {
          setApiError(res?.error || 'Error al actualizar paciente')
        }
      } else {
        const res = await DataService.registrarPaciente(formData)
        if (res?.success) {
          setSaved(true)
          if (search) {
            const res2 = await DataService.buscarPaciente(search)
            const list = res2?.data || []
            setPacientes(Array.isArray(list) ? list : [])
          }
        } else {
          setApiError(res?.error || 'Error al registrar paciente')
        }
      }
    } catch (err) {
      setApiError(err?.message || 'Error de conexión con el backend')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    setApiError('')
    try {
      const pacienteId = selectedPaciente.pacienteId || selectedPaciente.PacienteID || selectedPaciente.cedula || selectedPaciente.Cedula
      const res = await DataService.eliminarPaciente(pacienteId)
      if (res?.success) {
        handleNewPatient()
        if (search) {
          const res2 = await DataService.buscarPaciente(search)
          const list = res2?.data || []
          setPacientes(Array.isArray(list) ? list : [])
        } else {
          setPacientes([])
        }
      } else {
        setApiError(res?.error || 'Error al eliminar paciente')
      }
    } catch (err) {
      setApiError(err?.message || 'Error de conexión con el backend')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  function handleCancel() {
    if (confirmDelete) {
      setConfirmDelete(false)
      return
    }
    if (formData.nombre || formData.cedula || formData.fechaNacimiento || formData.motivoConsulta) {
      if (!window.confirm('Se perderán los cambios no guardados. ¿Continuar?'))
        return
    }
    handleNewPatient()
  }

  const termino = search.toLowerCase().trim()

  return (
    <div className="app__layout">
      <aside className="pl">
        <div className="pl-header">
          <div>
            <h3 className="pl-title">PACIENTES</h3>
            <p className="pl-subtitle">{pacientes.length} en sistema</p>
          </div>
          <span className="pl-badge">
            Hoy:{' '}
            {new Date().toLocaleDateString('es-DO', {
              day: '2-digit',
              month: 'short',
            }).replace('.', '')}
          </span>
        </div>
        <div style={{ padding: '0.5rem 1rem' }}>
          <div className="subbar-search" style={{ width: '100%' }}>
            <Search size={15} className="subbar-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              className="subbar-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="pl-list">
          {searching ? (
            <div className="pl-empty">
              <Loader size={24} className="spin" />
              <p>Buscando...</p>
            </div>
          ) : pacientes.length > 0 ? (
            pacientes.map((p, idx) => {
              const nombre = p.nombreCompleto || p.NombreCompleto || p.nombre || ''
              const cedula = p.cedula || p.Cedula || ''
              const iniciales = nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '--'
              return (
                <div
                  key={cedula || idx}
                  className={`pl-item${selectedPaciente?.cedula === cedula ? ' pl-item--active' : ''}`}
                  onClick={() => handleSelectPatient(p)}
                >
                  <div className="pl-avatar" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                    {iniciales}
                  </div>
                  <div className="pl-info">
                    <p className="pl-name">{nombre}</p>
                    <p className="pl-id">{cedula}</p>
                  </div>
                </div>
              )
            })
          ) : termino ? (
            <div className="pl-empty">
              <Search size={36} className="pl-empty-icon" />
              <p>No se encontraron pacientes</p>
              <p className="pl-empty-hint">Intente con otro término de búsqueda</p>
            </div>
          ) : (
            <div className="pl-empty">
              <Search size={36} className="pl-empty-icon" />
              <p>Escriba para buscar pacientes</p>
            </div>
          )}
        </div>
        <div className="pl-footer">
          <button className="pl-new-btn" onClick={handleNewPatient}>
            <UserPlus size={16} />
            Nuevo paciente sin registro
          </button>
        </div>
      </aside>

      <main className="app__main">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button className="btn-back" onClick={() => navigate('/inicio')}>
            ← Volver al inicio
          </button>
        </div>

        {saved && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              {isEditing ? 'Paciente actualizado exitosamente' : 'Paciente registrado exitosamente'}
            </p>
          </div>
        )}

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.85rem' }}>{apiError}</p>
          </div>
        )}

        <div className="app__grid--single">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isEditing && (
              <div style={{
                background: '#eff6ff',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                  Editando paciente: {selectedPaciente.nombreCompleto || selectedPaciente.NombreCompleto || selectedPaciente.nombre || ''}
                </span>
              </div>
            )}

            <PersonalDataForm
              formData={formData}
              errors={errors}
              onFieldChange={updateField}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0 0 1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isEditing && (
                  <button
                    className="footer-btn footer-btn--delete"
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      background: confirmDelete ? '#dc2626' : '#fef2f2',
                      color: confirmDelete ? '#fff' : '#dc2626',
                      border: `1px solid ${confirmDelete ? '#dc2626' : '#fecaca'}`,
                    }}
                  >
                    {deleting ? (
                      <Loader size={16} className="spin" />
                    ) : confirmDelete ? (
                      <AlertTriangle size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    {deleting ? 'Eliminando...' : confirmDelete ? 'Confirmar eliminación' : 'Eliminar'}
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="footer-btn footer-btn--cancel" onClick={handleCancel}>
                  {confirmDelete ? 'Cancelar' : 'Cancelar'}
                </button>
                <button className="footer-btn footer-btn--save" onClick={handleSave} disabled={saving || deleting}>
                  {saving ? <Loader size={16} className="spin" /> : isEditing ? <Save size={16} /> : <UserPlus size={16} />}
                  {saving ? 'Guardando...' : isEditing ? 'Actualizar Paciente' : 'Registrar Paciente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
