const TOKEN_KEY = 'finanzas_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function api<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`/api${url}`, { ...options, headers })

  if (response.status === 401) {
    setToken(null)
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
    throw new Error('Sesión expirada')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const mensaje = (body as { mensaje?: string } | null)?.mensaje
    throw new Error(mensaje ?? `Error ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const apiGet = <T>(url: string, params?: Record<string, string | number | undefined>) => {
  const qs = new URLSearchParams()
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        qs.append(key, String(value))
      }
    }
  }
  const query = qs.toString()
  return api<T>(query ? `${url}?${query}` : url)
}

export const apiPost = <T>(url: string, body: unknown) =>
  api<T>(url, { method: 'POST', body: JSON.stringify(body) })

export const apiPut = <T>(url: string, body: unknown) =>
  api<T>(url, { method: 'PUT', body: JSON.stringify(body) })

export const apiDelete = <T>(url: string) =>
  api<T>(url, { method: 'DELETE' })