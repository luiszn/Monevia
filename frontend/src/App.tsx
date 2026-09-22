import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/layout/Layout'
import { Cargando } from './components/ui/Cargando'

const Login = lazy(() => import('./pages/Login'))
const Registro = lazy(() => import('./pages/Registro'))
const DashboardPage = lazy(() => import('./pages/Dashboard'))
const MovimientosPage = lazy(() => import('./pages/Movimientos'))
const PresupuestosPage = lazy(() => import('./pages/Presupuestos'))
const IaPage = lazy(() => import('./pages/Ia'))

function RutaProtegida() {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return <Cargando texto="Cargando sesión..." />
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout>
      <Suspense fallback={<Cargando texto="Cargando..." />}>
        <Outlet />
      </Suspense>
    </Layout>
  )
}

function RutasPublicas() {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return <Cargando texto="Cargando sesión..." />
  }

  if (usuario) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Cargando texto="Cargando..." />}>
          <Routes>
            <Route element={<RutasPublicas />}>
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
            </Route>

            <Route element={<RutaProtegida />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/movimientos" element={<MovimientosPage />} />
              <Route path="/presupuestos" element={<PresupuestosPage />} />
              <Route path="/ia" element={<IaPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App