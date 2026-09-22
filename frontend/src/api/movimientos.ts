import { apiDelete, apiGet, apiPost, apiPut } from './client'
import type { Movimiento, MovimientoFiltros, MovimientoPayload } from '../types'

export const obtenerMovimientos = (filtros: MovimientoFiltros) =>
  apiGet<Movimiento[]>('/movimientos', {
    periodo: filtros.periodo,
    desde: filtros.desde,
    hasta: filtros.hasta,
    categoriaId: filtros.categoriaId,
    tipo: filtros.tipo as string,
    busqueda: filtros.busqueda,
    ordenarPor: filtros.ordenarPor,
    direccion: filtros.direccion,
  })

export const crearMovimiento = (payload: MovimientoPayload) =>
  apiPost<Movimiento>('/movimientos', payload)

export const actualizarMovimiento = (id: number, payload: MovimientoPayload) =>
  apiPut<Movimiento>(`/movimientos/${id}`, payload)

export const eliminarMovimiento = (id: number) =>
  apiDelete<void>(`/movimientos/${id}`)