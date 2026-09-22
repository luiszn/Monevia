import { apiGet, apiPost } from './client'
import type { AnalisisIa, Dashboard } from '../types'

export const obtenerDashboard = (
  periodo?: string,
  desde?: string,
  hasta?: string,
) =>
  apiGet<Dashboard>('/dashboard', { periodo, desde, hasta })

export const analizarConIa = (
  periodo?: string,
  desde?: string,
  hasta?: string,
) =>
  apiGet<AnalisisIa>('/ia/analizar', { periodo, desde, hasta })

export const preguntarAIa = (pregunta: string) =>
  apiPost<{ respuesta: string }>('/ia/pregunta', { pregunta })