import { apiDelete, apiGet, apiPost, apiPut } from './client'
import type { Presupuesto, PresupuestoPayload } from '../types'

export const obtenerPresupuestos = () =>
  apiGet<Presupuesto[]>('/presupuestos')

export const guardarPresupuesto = (payload: PresupuestoPayload) =>
  apiPost<void>('/presupuestos', payload)

export const actualizarPresupuesto = (payload: PresupuestoPayload) =>
  apiPut<void>('/presupuestos', payload)

export const eliminarPresupuesto = (id: number) =>
  apiDelete<void>(`/presupuestos/${id}`)