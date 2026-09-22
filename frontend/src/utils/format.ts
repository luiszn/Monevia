const formateadorSoles = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

export const formatSoles = (monto: number): string =>
  formateadorSoles.format(monto)

export const formatFecha = (fecha: string): string => {
  const d = new Date(fecha)
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const formatFechaHora = (fecha: string): string =>
  new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })