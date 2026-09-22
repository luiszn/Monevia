import { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin, registro as apiRegistro } from '../api/auth'
import { getToken, setToken } from '../api/client'
import type { AuthResponse } from '../types'

interface AuthContextValue {
  usuario: { nombre: string; email: string; usuarioId: string } | null
  cargando: boolean
  login: (email: string, password: string) => Promise<void>
  registro: (nombre: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const USUARIO_KEY = 'finanzas_usuario'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<AuthContextValue['usuario']>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = getToken()
    const guardado = localStorage.getItem(USUARIO_KEY)

    if (token && guardado) {
      setUsuario(JSON.parse(guardado))
    } else {
      setToken(null)
      localStorage.removeItem(USUARIO_KEY)
    }
    setCargando(false)
  }, [])

  const guardarSesion = (data: AuthResponse) => {
    setToken(data.token)
    localStorage.setItem(USUARIO_KEY, JSON.stringify({
      nombre: data.nombre,
      email: data.email,
      usuarioId: data.usuarioId,
    }))
    setUsuario({ nombre: data.nombre, email: data.email, usuarioId: data.usuarioId })
  }

  const login = async (email: string, password: string) => {
    guardarSesion(await apiLogin(email, password))
  }

  const registro = async (nombre: string, email: string, password: string) => {
    guardarSesion(await apiRegistro(nombre, email, password))
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem(USUARIO_KEY)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}