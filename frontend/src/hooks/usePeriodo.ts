import { useCallback, useMemo, useState } from 'react'
import { fechaLocal, hoy, sumarDias } from '../utils/fechas'

export type PeriodoClave = 'Semana' | 'SemanaAnterior' | 'Mes' | 'MesAnterior' | 'Rango'

export interface PeriodoConfig {
  clave: PeriodoClave
  desde: string
  hasta: string
  etiqueta: string
}

function inicioSemana(fecha: Date): Date {
  const d = new Date(fecha)
  const dia = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dia)
  return d
}

function construir(clave: PeriodoClave, desde?: string, hasta?: string): PeriodoConfig {
  const hoyDate = new Date(hoy())

  switch (clave) {
    case 'SemanaAnterior':
      return {
        clave,
        desde: fechaLocal(sumarDias(inicioSemana(hoyDate), -7)),
        hasta: fechaLocal(sumarDias(inicioSemana(hoyDate), -1)),
        etiqueta: 'Semana anterior',
      }
    case 'Mes':
      return {
        clave,
        desde: fechaLocal(new Date(hoyDate.getFullYear(), hoyDate.getMonth(), 1)),
        hasta: hoy(),
        etiqueta: 'Este mes',
      }
    case 'MesAnterior':
      return {
        clave,
        desde: fechaLocal(new Date(hoyDate.getFullYear(), hoyDate.getMonth() - 1, 1)),
        hasta: fechaLocal(new Date(hoyDate.getFullYear(), hoyDate.getMonth(), 0)),
        etiqueta: 'Mes anterior',
      }
    case 'Rango':
      return {
        clave,
        desde: desde ?? fechaLocal(sumarDias(hoyDate, -6)),
        hasta: hasta ?? hoy(),
        etiqueta: 'Rango personalizado',
      }
    default:
      return {
        clave,
        desde: fechaLocal(inicioSemana(hoyDate)),
        hasta: hoy(),
        etiqueta: 'Esta semana',
      }
  }
}

export function usePeriodo() {
  const [clave, setClave] = useState<PeriodoClave>('Semana')
  const [desdeManual, setDesdeManual] = useState<string>(fechaLocal(sumarDias(new Date(), -6)))
  const [hastaManual, setHastaManual] = useState<string>(hoy())

  const config = useMemo(
    () => construir(clave, desdeManual, hastaManual),
    [clave, desdeManual, hastaManual],
  )

  const seleccionarClave = useCallback((nueva: PeriodoClave) => {
    setClave(nueva)
  }, [])

  const cambiarRango = useCallback((desde: string, hasta: string) => {
    setDesdeManual(desde)
    setHastaManual(hasta)
    setClave('Rango')
  }, [])

  const parametros = useMemo(
    () => ({
      periodo: config.clave === 'Rango' ? 'Rango' : config.clave,
      desde: config.clave === 'Rango' ? config.desde : undefined,
      hasta: config.clave === 'Rango' ? config.hasta : undefined,
    }),
    [config.clave, config.desde, config.hasta],
  )

  return {
    ...config,
    parametros,
    seleccionarClave,
    cambiarRango,
    desdeManual,
    hastaManual,
  }
}