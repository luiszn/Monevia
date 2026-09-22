import type { ReactNode } from 'react'

type Color = 'gris' | 'verde' | 'ambar' | 'rojo' | 'indigo'

const colores: Record<Color, string> = {
  gris: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  verde: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  ambar: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  rojo: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
}

export function Badge({
  color = 'gris',
  children,
}: {
  color?: Color
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colores[color]}`}
    >
      {children}
    </span>
  )
}