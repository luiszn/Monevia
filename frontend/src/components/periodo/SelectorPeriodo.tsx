import { hoy } from '../../utils/fechas'
import { usePeriodo, type PeriodoClave } from '../../hooks/usePeriodo'

const opciones: { clave: PeriodoClave; etiqueta: string }[] = [
  { clave: 'Semana', etiqueta: 'Esta semana' },
  { clave: 'SemanaAnterior', etiqueta: 'Semana anterior' },
  { clave: 'Mes', etiqueta: 'Este mes' },
  { clave: 'MesAnterior', etiqueta: 'Mes anterior' },
  { clave: 'Rango', etiqueta: 'Rango personalizado' },
]

export function SelectorPeriodo({
  usePeriodoResult,
}: {
  usePeriodoResult: ReturnType<typeof usePeriodo>
}) {
  const { clave, seleccionarClave, cambiarRango, desdeManual, hastaManual } =
    usePeriodoResult

  return (
    <div className="flex flex-wrap items-center gap-2">
      {opciones.map((opcion) => (
        <button
          key={opcion.clave}
          onClick={() => seleccionarClave(opcion.clave)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            clave === opcion.clave
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          {opcion.etiqueta}
        </button>
      ))}
      {clave === 'Rango' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={desdeManual}
            max={hoy()}
            onChange={(e) => cambiarRango(e.target.value, hastaManual)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <span className="text-slate-400">a</span>
          <input
            type="date"
            value={hastaManual}
            onChange={(e) => cambiarRango(desdeManual, e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      )}
    </div>
  )
}