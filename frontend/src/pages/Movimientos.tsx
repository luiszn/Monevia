import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  actualizarMovimiento,
  crearMovimiento,
  eliminarMovimiento,
  obtenerMovimientos,
} from '../api/movimientos'
import { obtenerCategorias, obtenerMetodosPago } from '../api/catalogos'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Cargando } from '../components/ui/Cargando'
import { Alerta } from '../components/ui/Alerta'
import { usePeriodo } from '../hooks/usePeriodo'
import type {
  Categoria,
  MetodoPago,
  Movimiento,
  MovimientoPayload,
  TipoMovimiento,
} from '../types'
import { formatFecha, formatSoles } from '../utils/format'
import { hoy } from '../utils/fechas'

interface Formulario extends MovimientoPayload {
  id?: number
}

const FormularioVacio: Formulario = {
  tipo: 'Gasto',
  monto: 0,
  fecha: hoy(),
  categoriaId: 0,
  metodoPagoId: 0,
  descripcion: '',
}

export default function MovimientosPage() {
  const usePeriodoResult = usePeriodo()
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [metodos, setMetodos] = useState<MetodoPago[]>([])

  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('')
  const [tipoFiltro, setTipoFiltro] = useState<TipoMovimiento | ''>('')
  const [ordenarPor, setOrdenarPor] = useState('fecha')
  const [direccion, setDireccion] = useState<'asc' | 'desc'>('desc')

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [formulario, setFormulario] = useState<Formulario>(FormularioVacio)
  const [guardando, setGuardando] = useState(false)
  const [aEliminar, setAEliminar] = useState<Movimiento | null>(null)

  const estadoPeriodo = usePeriodoResult.parametros.periodo
  const desdePeriodo = usePeriodoResult.parametros.desde
  const hastaPeriodo = usePeriodoResult.parametros.hasta

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const datos = await obtenerMovimientos({
        periodo: estadoPeriodo,
        desde: desdePeriodo,
        hasta: hastaPeriodo,
        categoriaId: categoriaFiltro ? Number(categoriaFiltro) : undefined,
        tipo: tipoFiltro,
        busqueda: busqueda || undefined,
        ordenarPor,
        direccion,
      })
      setMovimientos(datos)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar movimientos')
    } finally {
      setCargando(false)
    }
  }, [estadoPeriodo, desdePeriodo, hastaPeriodo, categoriaFiltro, tipoFiltro, busqueda, ordenarPor, direccion])

  useEffect(() => {
    void cargar()
  }, [cargar])

  useEffect(() => {
    void obtenerCategorias().then(setCategorias).catch(() => {})
    void obtenerMetodosPago().then(setMetodos).catch(() => {})
  }, [])

  const categoriasFiltradas = useMemo(
    () => categorias.filter((c) => c.tipo === formulario.tipo),
    [categorias, formulario.tipo],
  )

  const abrirNuevo = () => {
    setFormulario({ ...FormularioVacio })
    setModalAbierto(true)
  }

  const abrirEditar = (mov: Movimiento) => {
    setFormulario({
      id: mov.id,
      tipo: mov.tipo,
      monto: mov.monto,
      fecha: mov.fecha.slice(0, 10),
      categoriaId: mov.categoriaId,
      metodoPagoId: mov.metodoPagoId,
      descripcion: mov.descripcion ?? '',
    })
    setModalAbierto(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const payload: MovimientoPayload = {
        tipo: formulario.tipo,
        monto: formulario.monto,
        fecha: new Date(formulario.fecha).toISOString(),
        categoriaId: formulario.categoriaId,
        metodoPagoId: formulario.metodoPagoId,
        descripcion: formulario.descripcion,
      }
      if (formulario.id) {
        await actualizarMovimiento(formulario.id, payload)
      } else {
        await crearMovimiento(payload)
      }
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
      await eliminarMovimiento(aEliminar.id)
      setAEliminar(null)
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Movimientos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Historias de tus ingresos y gastos
          </p>
        </div>
        <Button onClick={abrirNuevo}>+ Nuevo movimiento</Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="min-w-[200px] flex-1">
          <Input
            etiqueta="Buscar"
            placeholder="Buscar por descripción o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="w-52">
          <Select
            etiqueta="Categoría"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select
            etiqueta="Tipo"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value as TipoMovimiento | '')}
          >
            <option value="">Todos</option>
            <option value="Ingreso">Ingresos</option>
            <option value="Gasto">Gastos</option>
          </Select>
        </div>
        <div className="w-48">
          <Select
            etiqueta="Ordenar por"
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
          >
            <option value="fecha">Fecha</option>
            <option value="monto">Monto</option>
            <option value="categoria">Categoría</option>
          </Select>
        </div>
        <div className="w-36">
          <Select
            etiqueta="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </Select>
        </div>
      </div>

      {error && <Alerta tipo="error">{error}</Alerta>}

      {cargando ? (
        <Cargando texto="Cargando movimientos..." />
      ) : movimientos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
          No hay movimientos para estos filtros.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((mov) => (
                <tr
                  key={mov.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {formatFecha(mov.fecha)}
                  </td>
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                    {mov.descripcion || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {mov.categoriaNombre}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {mov.metodoPagoNombre}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge color={mov.tipo === 'Ingreso' ? 'verde' : 'rojo'}>
                      {mov.tipo === 'Ingreso' ? '+' : '−'} {formatSoles(mov.monto)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => abrirEditar(mov)}
                      className="mr-2 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setAEliminar(mov)}
                      className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        abierto={modalAbierto}
        titulo={formulario.id ? 'Editar movimiento' : 'Nuevo movimiento'}
        onCerrar={() => setModalAbierto(false)}
      >
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Tipo
              </span>
              <select
                value={formulario.tipo}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    tipo: e.target.value as TipoMovimiento,
                    categoriaId: 0,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="Gasto">Gasto</option>
                <option value="Ingreso">Ingreso</option>
              </select>
            </label>

            <Input
              etiqueta="Monto (S/)"
              type="number"
              step="0.01"
              min="0.01"
              value={formulario.monto || ''}
              onChange={(e) =>
                setFormulario({ ...formulario, monto: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              etiqueta="Fecha"
              type="date"
              value={formulario.fecha}
              max={hoy()}
              onChange={(e) =>
                setFormulario({ ...formulario, fecha: e.target.value })
              }
              required
            />

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Categoría
              </span>
              <select
                value={formulario.categoriaId || ''}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    categoriaId: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              >
                <option value="" disabled>
                  Selecciona...
                </option>
                {categoriasFiltradas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Método de pago
              </span>
              <select
                value={formulario.metodoPagoId || ''}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    metodoPagoId: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              >
                <option value="" disabled>
                  Selecciona...
                </option>
                {metodos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </label>

            <Input
              etiqueta="Descripción"
              value={formulario.descripcion ?? ''}
              onChange={(e) =>
                setFormulario({ ...formulario, descripcion: e.target.value })
              }
              placeholder="Opcional"
            />
          </div>

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
        titulo="Eliminar movimiento"
        onCerrar={() => setAEliminar(null)}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ¿Estás seguro de eliminar{' '}
          <span className="font-semibold">
            {aEliminar?.descripcion || aEliminar?.categoriaNombre}
          </span>{' '}
          por {aEliminar ? formatSoles(aEliminar.monto) : ''}? Esta acción no se
          puede deshacer.
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