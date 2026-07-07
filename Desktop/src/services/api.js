import { mapConsultaData, mapPacienteData } from '../utils/mappings'
import { pacientesData } from '../data/pacientes'
import {
  getConsultasDelDia,
  addConsulta,
  removeConsulta,
  updateConsultaStatus,
} from '../data/consultas'
import { usuarios } from '../data/usuarios'

class DataError extends Error {
  constructor(message, source) {
    super(message)
    this.name = 'DataError'
    this.source = source
  }
}

const DEV_API = import.meta.env.VITE_API_URL || ''

function getBridge() {
  if (window.chrome?.webview?.hostObjects?.backend) {
    return window.chrome.webview.hostObjects.backend
  }
  return null
}

async function invoke(channel, ...args) {
  const bridge = getBridge()

    if (bridge) {
    try {
      const result = await bridge[channel](...args)
      if (typeof result === 'string') {
        try { return JSON.parse(result) }
        catch { throw new DataError('Respuesta inválida del backend', channel) }
      }
      return result
    } catch (err) {
      throw new DataError(err?.message || `Error en ${channel}`, channel)
    }
  }

  if (DEV_API) {
    const res = await fetch(`${DEV_API}/api/${channel}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args[0]),
    })
    if (!res.ok) throw new DataError(`HTTP ${res.status}`, channel)
    return res.json()
  }

  return mockBackend(channel, ...args)
}

function mockBackend(channel, ...args) {
  switch (channel) {
    case 'BuscarPaciente': {
      const termino = (args[0] || '').toLowerCase().trim()
      const list = pacientesData.filter(
        (p) => p.nombre.toLowerCase().includes(termino) || p.cedula.includes(termino),
      )
      return { success: true, data: list }
    }
    case 'RegistrarPaciente': {
      const p = JSON.parse(args[0])
      const newId = pacientesData.length + 1
      pacientesData.push({
        pacienteId: newId,
        iniciales: (p.nombre || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        nombre: p.nombre || '',
        cedula: p.cedula || '',
        sangre: p.tipoSangre || '',
        edad: null,
        bgSangre: '#e0f2fe',
        colorSangre: '#0369a1',
        bgAvatar: '#e0f2fe',
        colorAvatar: '#0369a1',
        telefono: p.telefono || '',
        sexo: p.sexo || '',
        fechaNac: p.fechaNacimiento || '',
        alergias: p.alergias || '',
      })
      return { success: true, data: { pacienteId: newId } }
    }
    case 'ObtenerPacientes': {
      return { success: true, data: pacientesData }
    }
    case 'RegistrarConsulta': {
      const c = JSON.parse(args[0])
      addConsulta(c)
      return { success: true }
    }
    case 'ObtenerConsultasDelDia': {
      const consultas = getConsultasDelDia()
      return { success: true, data: consultas }
    }
    case 'ActualizarPaciente': {
      const pa = JSON.parse(args[0])
      const idx = pa.pacienteId
        ? pacientesData.findIndex((p) => (p.pacienteId || p.PacienteID) === pa.pacienteId)
        : pacientesData.findIndex((p) => p.cedula === pa.cedula)
      if (idx !== -1) {
        pacientesData[idx] = {
          ...pacientesData[idx],
          nombre: pa.nombre || pacientesData[idx].nombre,
          cedula: pa.cedula || pacientesData[idx].cedula,
          sangre: pa.tipoSangre || pacientesData[idx].sangre,
          telefono: pa.telefono || pacientesData[idx].telefono,
          sexo: pa.sexo || pacientesData[idx].sexo,
          fechaNac: pa.fechaNacimiento || pacientesData[idx].fechaNac,
          alergias: pa.alergias !== undefined ? pa.alergias : pacientesData[idx].alergias,
        }
      }
      return { success: true }
    }
    case 'EliminarPaciente': {
      const [pacId] = args
      const pacIdx = pacientesData.findIndex((p) => p.cedula === pacId || p.Cedula === pacId)
      if (pacIdx !== -1) pacientesData.splice(pacIdx, 1)
      return { success: true }
    }
    case 'EliminarConsulta': {
      const [conId] = args
      removeConsulta(conId)
      return { success: true }
    }
    case 'ActualizarStatusConsulta': {
      const [id, status] = args
      updateConsultaStatus(id, status)
      return { success: true }
    }
    case 'ValidarLogin': {
      const [cedula, password] = args
      const found = usuarios.find((u) => u.cedula === cedula && u.password === password)
      if (found) {
        return {
          success: true,
          usuario: { cedula: found.cedula, nombre: found.nombre, rol: found.rol },
        }
      }
      return { success: false, error: 'Credenciales inválidas' }
    }
    default:
      throw new DataError(`Canal no implementado: ${channel}`, channel)
  }
}

const DataService = {
  async buscarPaciente(termino) {
    return invoke('BuscarPaciente', termino)
  },

  async registrarPaciente(data) {
    return invoke('RegistrarPaciente', JSON.stringify(mapPacienteData(data)))
  },

  async obtenerPacientes() {
    return invoke('ObtenerPacientes')
  },

  async actualizarPaciente(data) {
    return invoke('ActualizarPaciente', JSON.stringify(mapPacienteData(data)))
  },

  async eliminarPaciente(pacienteId) {
    return invoke('EliminarPaciente', pacienteId)
  },

  async eliminarConsulta(consultaId) {
    return invoke('EliminarConsulta', consultaId)
  },

  async registrarConsulta(data) {
    return invoke('RegistrarConsulta', JSON.stringify(mapConsultaData(data)))
  },

  async obtenerConsultasDelDia(fecha) {
    return invoke('ObtenerConsultasDelDia', fecha || new Date().toISOString().slice(0, 10))
  },

  async actualizarStatusConsulta(id, status) {
    return invoke('ActualizarStatusConsulta', id, status)
  },

  async validarLogin(cedula, password) {
    return invoke('ValidarLogin', cedula, password)
  },
}

export { DataError, DataService }
export default DataService
