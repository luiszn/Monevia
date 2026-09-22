import type { ReactNode } from 'react'

export function Alerta({
  tipo,
  children,
}: {
  tipo: 'error' | 'exito' | 'info'
  children: ReactNode
}) {
  const estilos = {
    error: 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
    exito: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
    info: 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
  }
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${estilos[tipo]}`}>
      {children}
    </div>
  )
}