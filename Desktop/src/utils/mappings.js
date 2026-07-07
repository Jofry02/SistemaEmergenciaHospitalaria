export const modoLlegadaToBackend = {
  'Propios medios': 'Por pie propio',
  'Ambulancia': 'Ambulancia',
  'Transferido': 'Traido por otros',
  'Policía': 'Otro',
  'Otro': 'Otro',
}

export const triageToBackend = {
  'I': 'Rojo',
  'II': 'Naranja',
  'III': 'Amarillo',
  'IV': 'Verde',
  'V': 'Azul',
}

export const statusToBackend = {
  'pendiente': 'En espera',
  'en_atencion': 'En atencion',
  'atendido': 'Atendido',
}

function nilIfEmpty(val) {
  return val && val.toString().trim() ? val : null
}

function cleanPresionArterial(val) {
  if (!val) return null
  let s = val.toString().replace(/\s+/g, '').replace(/[^0-9/]/g, '')
  if (!s) return null
  return s
}

export function mapConsultaData(data) {
  return {
    ...data,
    modoLlegada: modoLlegadaToBackend[data.modoLlegada] || data.modoLlegada,
    triage: triageToBackend[data.triage] || data.triage,
    status: statusToBackend[data.status] || data.status,
    presionArterial: cleanPresionArterial(data.presionArterial),
    frecuenciaCardiaca: nilIfEmpty(data.frecuenciaCardiaca),
    frecuenciaRespiratoria: nilIfEmpty(data.frecuenciaRespiratoria),
    temperatura: nilIfEmpty(data.temperatura),
    saturacionO2: nilIfEmpty(data.saturacionO2),
    peso: nilIfEmpty(data.peso),
    talla: nilIfEmpty(data.talla),
  }
}

export function mapPacienteData(data) {
  return {
    ...data,
    cedula: (data.cedula || '').replace(/[^0-9]/g, ''),
    presionArterial: cleanPresionArterial(data.presionArterial),
  }
}
