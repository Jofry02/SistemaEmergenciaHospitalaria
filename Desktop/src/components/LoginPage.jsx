import { useState } from 'react'
import { Activity, LogIn, Loader } from 'lucide-react'
import { formatCedula } from '../utils/validators'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

export default function LoginPage({ onLogin }) {
  const { loading } = useAuth()
  const [cedula, setCedula] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!cedula.trim()) {
      setError('Ingrese su cédula')
      return
    }
    if (!password) {
      setError('Ingrese su contraseña')
      return
    }

    setError('')
    const limpia = cedula.replace(/[^0-9]/g, '')
    const ok = await onLogin(limpia, password)
    if (!ok) {
      setError('Credenciales inválidas')
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__brand">
          <Activity size={32} className="login__logo" />
          <h1 className="login__title">Genesis Emergency System</h1>
          <p className="login__subtitle">Hospital Francisco Moscoso Puello</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label">CÉDULA <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              className="login__input"
              placeholder="000-0000000-0"
              value={cedula}
              onChange={(e) => {
                setCedula(formatCedula(e.target.value))
                setError('')
              }}
              maxLength={12}
              autoFocus
            />
          </div>

          <div className="login__field">
            <label className="login__label">CONTRASEÑA <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="password"
              className="login__input"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
            />
          </div>

          {error && <p className="login__error">{error}</p>}

          <button
            type="submit"
            className="login__btn"
            disabled={!cedula.trim() || !password || loading}
          >
            {loading ? <Loader size={18} className="spin" /> : <LogIn size={18} />}
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
