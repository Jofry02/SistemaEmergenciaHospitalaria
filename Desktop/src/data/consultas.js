let consultasData = []
let nextId = 1

export function getConsultas() {
  return consultasData
}

export function getConsultasByStatus(status) {
  const today = new Date().toISOString().slice(0, 10)
  return consultasData.filter(
    (c) => c.status === status && c.fecha === today,
  )
}

export function getConsultasResumen() {
  const today = new Date().toISOString().slice(0, 10)
  const hoy = consultasData.filter((c) => c.fecha === today)
  return {
    total: hoy.length,
    enEspera: hoy.filter((c) => c.status === 'pendiente').length,
    enAtencion: hoy.filter((c) => c.status === 'en_atencion').length,
    atendidos: hoy.filter((c) => c.status === 'atendido').length,
  }
}

export function addConsulta(consulta) {
  const newConsulta = {
    ...consulta,
    pacienteCedula: (consulta.pacienteCedula || '').replace(/[^0-9]/g, ''),
    fechaHoraLlegada: consulta.fechaHoraLlegada || consulta.FechaHoraLlegada || consulta.horaLlegada || '',
    horaLlegada: consulta.horaLlegada || consulta.fechaHoraLlegada || consulta.FechaHoraLlegada || '',
    id: nextId++,
    fecha: new Date().toISOString().slice(0, 10),
    status: consulta.status || 'pendiente',
    createdAt: new Date().toISOString(),
  }
  consultasData = [...consultasData, newConsulta]
  return newConsulta
}

export function updateConsultaStatus(id, newStatus) {
  if (id == null) return null
  consultasData = consultasData.map((c) =>
    (c.id === id || c.consultaID === id || c.ConsultaID === id) ? { ...c, status: newStatus } : c,
  )
  return consultasData.find((c) => c.id === id || c.consultaID === id || c.ConsultaID === id)
}

export function removeConsulta(id) {
  if (id == null) return
  consultasData = consultasData.filter((c) => c.id !== id && c.consultaID !== id && c.ConsultaID !== id)
}

export function updateConsultaField(id, field, value) {
  consultasData = consultasData.map((c) =>
    c.id === id ? { ...c, [field]: value } : c,
  )
  return consultasData.find((c) => c.id === id)
}

export function getConsultasByPaciente(cedula) {
  const limpia = (cedula || '').replace(/[^0-9]/g, '')
  return consultasData
    .filter((c) => (c.pacienteCedula || '').replace(/[^0-9]/g, '') === limpia)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getConsultasDelDia() {
  const today = new Date().toISOString().slice(0, 10)
  return consultasData.filter((c) => c.fecha === today).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )
}

function initMockData() {
  const today = new Date().toISOString().slice(0, 10)
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const hora = `${h}:${m}`

  const mockConsultas = [
    {
      pacienteCedula: '00134567890',
      pacienteNombre: 'Ana Lucía Jiménez Castro',
      fechaHoraLlegada: '08:30',
      horaLlegada: '08:30',
      modoLlegada: 'Por pie propio',
      triage: 'Naranja',
      motivoConsulta: 'Dolor abdominal intenso de 3 horas de evolución.',
      alergias: 'Ninguna conocida',
      presionArterial: '',
      frecuenciaCardiaca: '',
      frecuenciaRespiratoria: '',
      temperatura: '',
      saturacionO2: '',
      peso: '',
      talla: '',
      observaciones: '',
      signosVitalesBypass: false,
      status: 'pendiente',
      id: nextId++,
      fecha: today,
      createdAt: new Date().toISOString(),
    },
    {
      pacienteCedula: '00112345678',
      pacienteNombre: 'Carlos Mendoza',
      fechaHoraLlegada: '08:45',
      horaLlegada: '08:45',
      modoLlegada: 'Ambulancia',
      triage: 'Rojo',
      motivoConsulta: 'Dolor torácico y dificultad respiratoria.',
      alergias: 'Ninguna',
      presionArterial: '150/95',
      frecuenciaCardiaca: '110',
      frecuenciaRespiratoria: '22',
      temperatura: '37.2',
      saturacionO2: '91',
      peso: '180',
      talla: '1.75',
      observaciones: 'Paciente diaforético, se traslada a resucitación de inmediato.',
      signosVitalesBypass: false,
      status: 'pendiente',
      id: nextId++,
      fecha: today,
      createdAt: new Date().toISOString(),
    },
    {
      pacienteCedula: '00145678901',
      pacienteNombre: 'Pedro Ramírez',
      fechaHoraLlegada: '09:00',
      horaLlegada: '09:00',
      modoLlegada: 'Por pie propio',
      triage: 'Azul',
      motivoConsulta: 'Esguince de tobillo leve.',
      alergias: 'Penicilina',
      presionArterial: '110/70',
      frecuenciaCardiaca: '68',
      frecuenciaRespiratoria: '14',
      temperatura: '36.5',
      saturacionO2: '99',
      peso: '160',
      talla: '1.78',
      observaciones: '',
      signosVitalesBypass: false,
      status: 'pendiente',
      id: nextId++,
      fecha: today,
      createdAt: new Date().toISOString(),
    },
  ]

  consultasData = mockConsultas
}

initMockData()
