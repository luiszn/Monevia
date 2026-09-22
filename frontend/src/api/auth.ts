import { apiGet, apiPost } from './client'
import type { AuthResponse } from '../types'

export const login = (email: string, password: string) =>
  apiPost<AuthResponse>('/auth/login', { email, password })

export const registro = (nombre: string, email: string, password: string) =>
  apiPost<AuthResponse>('/auth/registro', { nombre, email, password })

export const obtenerUsuario = () =>
  apiGet<AuthResponse>('/auth/me')