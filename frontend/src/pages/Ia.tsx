import { useEffect, useRef, useState } from 'react'
import { analizarConIa, preguntarAIa } from '../api/ia'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Cargando } from '../components/ui/Cargando'
import { Alerta } from '../components/ui/Alerta'
import { Badge } from '../components/ui/Badge'
import { SelectorPeriodo } from '../components/periodo/SelectorPeriodo'
import { usePeriodo } from '../hooks/usePeriodo'
import type { AnalisisIa } from '../types'
import { formatSoles } from '../utils/format'

interface Mensaje {
  autor: 'usuario' | 'ia'
  texto: string
}

export default function IaPage() {
  const usePeriodoResult = usePeriodo()
  const [analisis, setAnalisis] = useState<AnalisisIa | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [pregunta, setPregunta] = useState('')
  const [preguntando, setPreguntando] = useState(false)
  const finChat = useRef<HTMLDivElement>(null)

  useEffect(() => {
    finChat.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const generarAnalisis = async () => {
    setCargando(true)
    setError('')
    try {
      const resultado = await analizarConIa(
        usePeriodoResult.parametros.periodo,
        usePeriodoResult.parametros.desde,
        usePeriodoResult.parametros.hasta,
      )
      setAnalisis(resultado)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al analizar')
    } finally {
      setCargando(false)
    }
  }

  const enviarPregunta = async (e: React.FormEvent) => {
    e.preventDefault()
    const texto = pregunta.trim()
    if (!texto || preguntando) return

    setMensajes((ms) => [...ms, { autor: 'usuario', texto }])
    setPregunta('')
    setPreguntando(true)
    try {
      const { respuesta } = await preguntarAIa(texto)
      setMensajes((ms) => [...ms, { autor: 'ia', texto: respuesta }])
    } catch (err) {
      setMensajes((ms) => [
        ...ms,
        {
          autor: 'ia',
          texto: err instanceof Error ? err.message : 'Error al consultar a la IA',
        },
      ])
    } finally {
      setPreguntando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Análisis con IA
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Insights basados en tus datos reales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SelectorPeriodo usePeriodoResult={usePeriodoResult} />
          <Button onClick={() => void generarAnalisis()} disabled={cargando}>
            {cargando ? 'Analizando...' : '✨ Generar análisis'}
          </Button>
        </div>
      </div>

      {error && <Alerta tipo="info">{error}</Alerta>}

      {cargando ? (
        <Cargando texto="La IA está analizando tus finanzas..." />
      ) : analisis ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
              Resumen {usePeriodoResult.etiqueta}
            </h2>
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300">
              {analisis.resumenTexto}
            </pre>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500">Ingresos</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatSoles(analisis.ingresos)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Gastos</p>
                <p className="font-semibold text-rose-600 dark:text-rose-400">
                  {formatSoles(analisis.gastos)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Balance</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatSoles(analisis.balance)}
                </p>
              </div>
            </div>

            {analisis.mayorGastoMonto > 0 && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Mayor gasto:{' '}
                <span className="font-semibold">{analisis.mayorGastoCategoria}</span>{' '}
                — {formatSoles(analisis.mayorGastoMonto)}
              </p>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
              Insights de la IA
            </h2>
            <ul className="space-y-3">
              {analisis.insights.map((insight, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                >
                  <span className="mt-0.5 text-indigo-500">✦</span>
                  {insight}
                </li>
              ))}
            </ul>
            {analisis.comparacionMensaje && (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {analisis.comparacionMensaje}
              </p>
            )}
          </Card>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
          Presiona "Generar análisis" para ver el resumen automático de tu{' '}
          {usePeriodoResult.etiqueta.toLowerCase()}.
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          💬 Pregunta sobre tus finanzas
        </h2>
        <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
          {mensajes.length === 0 && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              Pregunta lo que quieras sobre tus finanzas. Por ejemplo: "¿En qué
              gasté más esta semana?", "¿Cuánto gasté en comida este mes?",
              "¿Estoy respetando mis presupuestos?"
            </div>
          )}
          {mensajes.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.autor === 'usuario' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.autor === 'usuario'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  {m.autor === 'ia' && <Badge color="indigo">IA</Badge>}
                </div>
                {m.texto}
              </div>
            </div>
          ))}
          {preguntando && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500 dark:bg-slate-800">
                <span className="inline-block animate-pulse">Analizando...</span>
              </div>
            </div>
          )}
          <div ref={finChat} />
        </div>

        <form onSubmit={enviarPregunta} className="mt-4 flex gap-2">
          <input
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <Button type="submit" disabled={!pregunta.trim() || preguntando}>
            Enviar
          </Button>
        </form>
      </Card>
    </div>
  )
}