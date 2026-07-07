import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import './HelpButton.css'

const triageLevels = [
  { id: 'Rojo', label: 'Resucitación', desc: 'Atención inmediata. Riesgo vital.', color: '#ef4444', bg: '#fef2f2' },
  { id: 'Naranja', label: 'Emergencia', desc: 'Condición seria pero estable.', color: '#f97316', bg: '#fff7ed' },
  { id: 'Amarillo', label: 'Urgencia', desc: 'Requiere evaluación en 30-60 min.', color: '#eab308', bg: '#fefce8' },
  { id: 'Verde', label: 'Menor', desc: 'Puede esperar. Sin riesgo inmediato.', color: '#22c55e', bg: '#f0fdf4' },
  { id: 'Azul', label: 'No urgente', desc: 'Consulta rutinaria o trámite.', color: '#3b82f6', bg: '#eff6ff' },
]

export default function HelpButton() {
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState(null)

  const shortcuts = [
    { key: 'Alt+1', desc: 'Ir a Inicio' },
    { key: 'Alt+2', desc: 'Ir a Registro' },
    { key: 'Alt+3', desc: 'Ir a Consulta' },
    { key: 'Ctrl+K', desc: 'Buscar paciente' },
    { key: 'Esc', desc: 'Cerrar ventanas / notificaciones' },
    { key: 'Alt+L', desc: 'Cerrar sesión' },
  ]

  const toggle = (s) => setSection((v) => (v === s ? null : s))

  return (
    <div className="help">
      <div className="help__btn" onClick={() => setOpen((v) => !v)}>
        <HelpCircle size={20} />
      </div>
      {open && (
        <div className="help__tooltip">
          <h4 className="help__title">Ayuda del Sistema</h4>

          {/* ── GUÍA RÁPIDA ── */}
          <div
            className="help__row"
            onClick={() => toggle('guia')}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <span style={{ fontWeight: 700, color: '#e2e8f0' }}>
              <FileText size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Guía rápida
            </span>
            {section === 'guia' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          {section === 'guia' && (
            <div style={{ marginTop: '4px', marginBottom: '8px' }}>
              <div className="help__text-block">
                <strong>1. Iniciar sesión</strong>
                <p>Ingrese con su cédula y contraseña. Hay usuarios de prueba (Enfermera, Médico, Administrador).</p>
              </div>
              <div className="help__text-block">
                <strong>2. Registrar paciente</strong>
                <p>Vaya a <kbd>Registro</kbd> (Alt+2). Busque si el paciente ya existe por cédula o nombre. Si no existe, presione "Nuevo paciente" y complete los datos obligatorios (*).</p>
              </div>
              <div className="help__text-block">
                <strong>3. Crear consulta</strong>
                <p>Vaya a <kbd>Consulta</kbd> (Alt+3). Seleccione un paciente, asigne el nivel de triage (Rojo a Azul) y complete signos vitales si aplica. Guarde para enviarlo a la sala de espera.</p>
              </div>
              <div className="help__text-block">
                <strong>4. Sala de espera</strong>
                <p>En <kbd>Inicio</kbd> (Alt+1) vea los pacientes organizados por estado: En Espera, En Atención, Atendidos. Los contadores se actualizan cada minuto.</p>
              </div>
              <div className="help__text-block">
                <strong>5. Editar / Eliminar</strong>
                <p>En <kbd>Registro</kbd>, seleccione un paciente del listado para editar sus datos o eliminarlo del sistema. En <kbd>Consulta</kbd>, el historial del paciente permite eliminar consultas previas.</p>
              </div>
            </div>
          )}

          <div className="help__sep" />

          {/* ── TRIAGE ── */}
          <div
            className="help__row"
            onClick={() => toggle('triage')}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <span style={{ fontWeight: 700, color: '#e2e8f0' }}>
              Sistema de Triage
            </span>
            {section === 'triage' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          {section === 'triage' && (
            <div style={{ marginTop: '6px' }}>
              <p className="help__text-hint">
                El triage clasifica a los pacientes por urgencia al llegar. El color determina el orden de atención.
              </p>
              {triageLevels.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '5px 6px',
                    marginBottom: '4px',
                    borderRadius: '6px',
                    background: t.bg,
                  }}
                >
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: t.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {t.id === 'Rojo' ? 'I' : t.id === 'Naranja' ? 'II' : t.id === 'Amarillo' ? 'III' : t.id === 'Verde' ? 'IV' : 'V'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e293b' }}>
                      {t.id} — {t.label}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#475569' }}>{t.desc}</div>
                  </div>
                </div>
              ))}
              <p className="help__text-hint" style={{ marginTop: 6 }}>
                Los niveles Verde y Azul pueden saltarse el registro de signos vitales.
              </p>
            </div>
          )}

          <div className="help__sep" />

          {/* ── FLUJO DE TRABAJO ── */}
          <div
            className="help__row"
            onClick={() => toggle('flujo')}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <span style={{ fontWeight: 700, color: '#e2e8f0' }}>
              Flujo del paciente
            </span>
            {section === 'flujo' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          {section === 'flujo' && (
            <div style={{ marginTop: '4px', marginBottom: '8px' }}>
              <div className="help__row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  1. <strong>Registro</strong> → Datos personales del paciente
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  2. <strong>Consulta / Triage</strong> → Clasificación y signos vitales
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  3. <strong>En Espera</strong> → Paciente en sala, pendiente de atención
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  4. <strong>En Atención</strong> → Siendo evaluado por el médico
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  5. <strong>Atendido</strong> → Consulta finalizada
                </span>
              </div>
            </div>
          )}

          <div className="help__sep" />

          {/* ── ATAJOS ── */}
          <div
            className="help__row"
            onClick={() => toggle('atajos')}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <span style={{ fontWeight: 700, color: '#e2e8f0' }}>
              Atajos de teclado
            </span>
            {section === 'atajos' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          {section === 'atajos' && (
            <div style={{ marginTop: '4px' }}>
              {shortcuts.map((s) => (
                <div key={s.key} className="help__row">
                  <kbd>{s.key}</kbd> {s.desc}
                </div>
              ))}
            </div>
          )}

          <div className="help__sep" />

          {/* ── INFO ADICIONAL ── */}
          <div className="help__row">
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Los campos con <span className="required">*</span> son obligatorios
            </span>
          </div>
          <div className="help__row">
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Cédula: 000-0000000-0 · Tel: (809) 000-0000
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
