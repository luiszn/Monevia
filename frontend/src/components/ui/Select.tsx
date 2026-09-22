import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta?: string
}

export function Select({ etiqueta, className = '', children, ...props }: SelectProps) {
  return (
    <label className="block">
      {etiqueta && (
        <span className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {etiqueta}
        </span>
      )}
      <select
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}