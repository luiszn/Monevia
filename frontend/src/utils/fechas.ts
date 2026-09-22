export function fechaLocal(d: Date): string {
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}

export function hoy(): string {
  return fechaLocal(new Date())
}

export function sumarDias(fecha: Date, dias: number): Date {
  const d = new Date(fecha)
  d.setDate(d.getDate() + dias)
  return d
}