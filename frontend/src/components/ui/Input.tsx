import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string
}

export function Input({ etiqueta, className = '', ...props }: InputProps) {
  return (
    <label className="block">
      {etiqueta && (
        <span className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {etiqueta}
        </span>
      )}
      <input
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${className}`}
        {...props}
      />
    </label>
  )
}