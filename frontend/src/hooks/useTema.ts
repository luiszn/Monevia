import { useEffect, useState } from 'react'

const THEME_KEY = 'finanzas_tema'

function preferenciaSistema(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTema() {
  const [oscuro, setOscuro] = useState<boolean>(() => {
    const guardado = localStorage.getItem(THEME_KEY)
    return guardado ? guardado === 'dark' : preferenciaSistema()
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro)
    localStorage.setItem(THEME_KEY, oscuro ? 'dark' : 'light')
  }, [oscuro])

  const alternar = () => setOscuro(!oscuro)

  return { oscuro, alternar }
}