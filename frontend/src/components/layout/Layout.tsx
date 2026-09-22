import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTema } from '../../hooks/useTema'

const enlaces = [
  { a: '/', etiqueta: 'Dashboard', icono: '📊' },
  { a: '/movimientos', etiqueta: 'Movimientos', icono: '💸' },
  { a: '/presupuestos', etiqueta: 'Presupuestos', icono: '🎯' },
  { a: '/ia', etiqueta: 'Análisis IA', icono: '✨' },
]

export function Sidebar({
  abierto,
  onCerrar,
}: {
  abierto: boolean
  onCerrar: () => void
}) {
  const { usuario, logout } = useAuth()

  return (
    <>
      {abierto && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={onCerrar}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform lg:static lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
          <span className="text-xl">💠</span>
          <span className="text-lg font-bold text-white">FinanzasIA</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.a}
              to={enlace.a}
              end={enlace.a === '/'}
              onClick={onCerrar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span>{enlace.icono}</span>
              {enlace.etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="truncate text-sm font-medium text-white">
            {usuario?.nombre}
          </p>
          <p className="truncate text-xs text-slate-400">{usuario?.email}</p>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { oscuro, alternar } = useTema()
  const { usuario } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuAbierto(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Hola, {usuario?.nombre?.split(' ')[0] ?? 'usuario'}
              </p>
              <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
                Tu resumen financiero
              </p>
            </div>
          </div>

          <button
            onClick={alternar}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {oscuro ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}