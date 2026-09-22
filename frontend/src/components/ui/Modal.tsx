import type { ReactNode } from 'react'
import { Button } from './Button'

export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
  ancho = 'max-w-lg',
}: {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  ancho?: string
}) {
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onCerrar}
      />
      <div
        className={`relative w-full ${ancho} rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {titulo}
          </h2>
          <Button variante="fantasma" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}