export type TipoMovimiento = 'Ingreso' | 'Gasto'
export type TipoPeriodo = 'Semanal' | 'Mensual'
export type EstadoPresupuesto = 'Disponible' | 'Cerca' | 'Superado'

export interface AuthResponse {
  token: string
  usuarioId: string
  nombre: string
  email: string
}

export interface Categoria {
  id: number
  nombre: string
  tipo: TipoMovimiento
  icono?: string | null
  color?: string | null
  esSistema: boolean
}

export interface MetodoPago {
  id: number
  nombre: string
  esSistema: boolean
}

export interface Movimiento {
  id: number
  tipo: TipoMovimiento
  monto: number
  fecha: string
  categoriaId: number
  categoriaNombre: string
  metodoPagoId: number
  metodoPagoNombre: string
  descripcion?: string | null
}

export interface MovimientoPayload {
  tipo: TipoMovimiento
  monto: number
  fecha: string
  categoriaId: number
  metodoPagoId: number
  descripcion?: string
}

export interface MovimientoFiltros {
  periodo?: string
  desde?: string
  hasta?: string
  categoriaId?: number
  tipo?: TipoMovimiento | ''
  busqueda?: string
  ordenarPor?: string
  direccion?: 'asc' | 'desc'
}

export interface Presupuesto {
  id: number
  categoriaId: number
  categoriaNombre: string
  periodo: TipoPeriodo
  monto: number
  gastado: number
  disponible: number
  porcentaje: number
  estado: EstadoPresupuesto
}

export interface PresupuestoPayload {
  categoriaId: number
  periodo: TipoPeriodo
  monto: number
}

export interface GastoPorCategoria {
  categoria: string
  monto: number
  porcentaje: number
}

export interface EvolucionDiaria {
  fecha: string
  ingresos: number
  gastos: number
}

export interface Comparacion {
  actual: number
  anterior: number
  variacionPorcentaje: number
}

export interface Dashboard {
  ingresos: number
  gastos: number
  balance: number
  numMovimientos: number
  comparacionIngresos: Comparacion
  comparacionGastos: Comparacion
  gastosPorCategoria: GastoPorCategoria[]
  evolucionDiaria: EvolucionDiaria[]
  movimientosRecientes: Movimiento[]
}

export interface AnalisisIa {
  resumenTexto: string
  ingresos: number
  gastos: number
  balance: number
  mayorGastoCategoria: string
  mayorGastoMonto: number
  comparacionMensaje?: string | null
  insights: string[]
}

export type PeriodoSeleccion = 'Semana' | 'SemanaAnterior' | 'Mes' | 'MesAnterior' | 'Rango'