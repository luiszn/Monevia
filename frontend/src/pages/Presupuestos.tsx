import { useCallback, useEffect, useState } from 'react'
import {
  eliminarPresupuesto,
  guardarPresupuesto,
  obtenerPresupuestos,
} from '../api/presupuestos'
import { obtenerCategorias } from '../api/catalogos'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Cargando } from '../components/ui/Cargando'
import { Alerta } from '../components/ui/Alerta'
import type {
  Categoria,
  EstadoPresupuesto,
  Presupuesto,
  TipoPeriodo,
} from '../types'
import { formatSoles } from '../utils/format'

function colorEstado(estado: EstadoPresupuesto): 'gris' | 'verde' | 'ambar' | 'rojo' {
  switch (estado) {
    case 'Disponible':
      return 'verde'
    case 'Cerca':
      return 'ambar'
    case 'Superado':
      return 'rojo'
  }
}

function colorBarra(estado: EstadoPresupuesto): string {
  switch (estado) {
    case 'Disponible':
      return 'bg-emerald-500'
    case 'Cerca':
      return 'bg-amber-500'
    case 'Superado':
      return 'bg-rose-500'
  }
}

const estadosTexto: Record<EstadoPresupuesto, string> = {
  Disponible: 'En orden',
  Cerca: 'Cerca del límite',
  Superado: 'Superado',
}

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [categoriaId, setCategoriaId] = useState(0)
  const [periodo, setPeriodo] = useState<TipoPeriodo>('Semanal')
  const [monto, setMonto] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState<Presupuesto | null>(null)
  const [aEliminar, setAEliminar] = useState<Presupuesto | null>(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      setPresupuestos(await obtenerPresupuestos())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar presupuestos')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
    void obtenerCategorias('Gasto')
      .then(setCategorias)
      .catch(() => {})
  }, [cargar])

  const abrirNuevo = () => {
    setEditando(null)
    setCategoriaId(0)
    setPeriodo('Semanal')
    setMonto('')
    setModalAbierto(true)
  }

  const abrirEditar = (p: Presupuesto) => {
    setEditando(p)
    setCategoriaId(p.categoriaId)
    setPeriodo(p.periodo)
    setMonto(String(p.monto))
    setModalAbierto(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      await guardarPresupuesto({
        categoriaId,
        periodo,
        monto: Number(monto),
      })
      setModalAbierto(false)
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    try {
      await eliminarPresupuesto(aEliminar.id)
      setAEliminar(null)
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const categoriasConPresupuesto = new Set(
    presupuestos.map((p) => p.categoriaId),
  )
  const categoriasDisponibles = categorias.filter(
    (c) => c.tipo === 'Gasto' && !categoriasConPresupuesto.has(c.id),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Presupuestos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Controla tu gasto por categoría
          </p>
        </div>
        <Button onClick={abrirNuevo}>+ Nuevo presupuesto</Button>
      </div>

      {error && <Alerta tipo="error">{error}</Alerta>}

      {cargando ? (
        <Cargando texto="Cargando presupuestos..." />
      ) : presupuestos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
          No tienes presupuestos. Crea uno para controlar tus gastos.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {presupuestos.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {p.categoriaNombre}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {p.periodo === 'Semanal' ? 'Semanal' : 'Mensual'}
                  </p>
                </div>
                <Badge color={colorEstado(p.estado)}>{estadosTexto[p.estado]}</Badge>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    S/ {formatSoles(p.gastado)} de {formatSoles(p.monto)}
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {p.porcentaje}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${colorBarra(p.estado)}`}
                    style={{ width: `${Math.min(p.porcentaje, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  Disponible:{' '}
                  <span className="font-semibold">{formatSoles(p.disponible)}</span>
                </span>
                <div className="space-x-1">
                  <button
                    onClick={() => abrirEditar(p)}
                    className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setAEliminar(p)}
                    className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        abierto={modalAbierto}
        titulo={editando ? `Editar presupuesto de ${editando.categoriaNombre}` : 'Nuevo presupuesto'}
        onCerrar={() => setModalAbierto(false)}
      >
        <form onSubmit={guardar} className="space-y-4">
          {!editando && (
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Categoría
              </span>
              <select
                value={categoriaId || ''}
                onChange={(e) => setCategoriaId(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              >
                <option value="" disabled>
                  Selecciona...
                </option>
                {categoriasDisponibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Select
            etiqueta="Período"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as TipoPeriodo)}
          >
            <option value="Semanal">Semanal</option>
            <option value="Mensual">Mensual</option>
          </Select>

          <Input
            etiqueta="Monto (S/)"
            type="number"
            step="0.01"
            min="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variante="secundario"
              onClick={() => setModalAbierto(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={Boolean(aEliminar)}
        titulo="Eliminar presupuesto"
        onCerrar={() => setAEliminar(null)}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ¿Eliminar el presupuesto de{' '}
          <span className="font-semibold">{aEliminar?.categoriaNombre}</span>?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setAEliminar(null)}>
            Cancelar
          </Button>
          <Button variante="peligro" onClick={() => void confirmarEliminar()}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}