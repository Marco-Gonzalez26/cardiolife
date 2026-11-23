import { headers } from 'next/headers'

/**
 * Dirección pública del sistema (para el QR de verificación y enlaces).
 * Usa NEXT_PUBLIC_APP_URL si está definida; si no, la deduce de la petición actual.
 */
export async function getAppOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) return configured.replace(/\/+$/, '')

  const list = await headers()
  const host = list.get('x-forwarded-host') ?? list.get('host') ?? 'localhost:3000'
  const protocol =
    list.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}
