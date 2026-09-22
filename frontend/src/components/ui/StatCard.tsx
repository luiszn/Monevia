import type { ReactNode } from 'react'
import { Card } from './Card'

export function StatCard({
  titulo,
  valor,
  icono,
  variacion,
  variacionPositivaEsBuena = true,
  color,
}: {
  titulo: string
  valor: string
  icono: ReactNode
  variacion?: number | null
  variacionPositivaEsBuena?: boolean
  color: string
}) {
  const hayVariacion = variacion !== undefined && variacion !== null
  const estable = hayVariacion && variacion === 0
  const buena = variacionPositivaEsBuena ? (variacion ?? 0) > 0 : (variacion ?? 0) < 0

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {titulo}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {valor}
          </p>
        </div>
        <div className={`rounded-xl p-2 text-white ${color}`}>{icono}</div>
      </div>
      {hayVariacion && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {estable ? (
            'Igual que el período anterior'
          ) : (
            <>
              <span
                className={`font-semibold ${
                  buena
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {variacion! > 0 ? '▲' : '▼'} {Math.abs(variacion!)}%
              </span>{' '}
              vs período anterior
            </>
          )}
        </p>
      )}
    </Card>
  )
}