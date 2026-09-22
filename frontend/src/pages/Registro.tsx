import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alerta } from '../components/ui/Alerta'

export default function Registro() {
  const { registro } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await registro(nombre, email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-4xl">💠</span>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Crea tu cuenta
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Empieza a registrar tus ingresos y gastos
          </p>
        </div>

        <form
          onSubmit={enviar}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="space-y-4">
            {error && <Alerta tipo="error">{error}</Alerta>}
            <Input
              etiqueta="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
              minLength={2}
            />
            <Input
              etiqueta="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              required
            />
            <Input
              etiqueta="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando ? 'Creando cuenta...' : 'Registrarme'}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}