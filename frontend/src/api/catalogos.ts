import { apiGet } from './client'
import type { Categoria, MetodoPago, TipoMovimiento } from '../types'

export const obtenerCategorias = (tipo?: TipoMovimiento) =>
  apiGet<Categoria[]>('/categorias', tipo ? { tipo } : undefined)

export const obtenerMetodosPago = () =>
  apiGet<MetodoPago[]>('/metodos-pago')