import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { obtenerDashboard } from '../api/ia'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Cargando } from '../components/ui/Cargando'
import { SelectorPeriodo } from '../components/periodo/SelectorPeriodo'
import { Badge } from '../components/ui/Badge'
import { usePeriodo } from '../hooks/usePeriodo'
import type { Dashboard } from '../types'
import { formatFecha, formatSoles } from '../utils/format'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#eab308', '#06b6d4', '#ef4444']

const formatoMiles = (value: number) =>
  new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 }).format(value)

export default function DashboardPage() {
  const periodo = usePeriodo()
  const [datos, setDatos] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    setCargando(true)
    obtenerDashboard(
      periodo.parametros.periodo,
      periodo.parametros.desde,
      periodo.parametros.hasta,
    )
      .then((d) => {
        if (activo) setDatos(d)
      })
      .catch((e) => {
        if (activo) setError(e.message)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [periodo.parametros])

  if (cargando) return <Cargando texto="Calculando tu resumen..." />
  if (error) return <div className="text-rose-500">{error}</div>
  if (!datos) return null

  const variacionGastos = datos.comparacionGastos.variacionPorcentaje
  const variacionIngresos = datos.comparacionIngresos.variacionPorcentaje

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {periodo.etiqueta}
          </p>
        </div>
        <SelectorPeriodo usePeriodoResult={periodo} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Ingresos"
          valor={formatSoles(datos.ingresos)}
          variacion={variacionIngresos}
          color="bg-emerald-500"
          icono={<span>⬆️</span>}
        />
        <StatCard
          titulo="Gastos"
          valor={formatSoles(datos.gastos)}
          variacion={variacionGastos}
          variacionPositivaEsBuena={false}
          color="bg-rose-500"
          icono={<span>⬇️</span>}
        />
        <StatCard
          titulo="Balance disponible"
          valor={formatSoles(datos.balance)}
          color={datos.balance >= 0 ? 'bg-indigo-500' : 'bg-rose-500'}
          icono={<span>💼</span>}
        />
        <StatCard
          titulo="Movimientos"
          valor={String(datos.numMovimientos)}
          color="bg-slate-500"
          icono={<span>🧾</span>}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Evolución diaria
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={datos.evolucionDiaria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#47556944" />
              <XAxis
                dataKey="fecha"
                tickFormatter={(f: string) =>
                  new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
                }
                tick={{ fontSize: 11 }}
              />
              <YAxis tickFormatter={formatoMiles} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) => [
                  formatSoles(Number(value) || 0),
                  String(name) === 'ingresos' ? 'Ingresos' : 'Gastos',
                ]}
              />
              <Legend />
              <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="#f43f5e" name="Gastos" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Gastos por categoría
          </h2>
          {datos.gastosPorCategoria.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500">
              No hay gastos registrados en este período.
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={datos.gastosPorCategoria}
                    dataKey="monto"
                    nameKey="categoria"
                    innerRadius={50}
                    outerRadius={85}
                  >
                    {datos.gastosPorCategoria.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      formatSoles(Number(value) || 0),
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-2 space-y-1">
                {datos.gastosPorCategoria.map((g, i) => (
                  <li
                    key={g.categoria}
                    className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      {g.categoria}
                    </span>
                    <span className="font-medium">
                      {g.porcentaje}% · {formatSoles(g.monto)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Movimientos recientes
          </h2>
          {datos.movimientosRecientes.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500">
              Aún no hay movimientos en este período.
            </p>
          ) : (
            <ul className="space-y-3">
              {datos.movimientosRecientes.map((mov) => (
                <li
                  key={mov.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {mov.descripcion || mov.categoriaNombre}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {mov.categoriaNombre} · {formatFecha(mov.fecha)}
                    </p>
                  </div>
                  <Badge color={mov.tipo === 'Ingreso' ? 'verde' : 'rojo'}>
                    {mov.tipo === 'Ingreso' ? '+' : '−'} {formatSoles(mov.monto)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}