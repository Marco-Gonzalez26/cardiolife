import { cookies } from 'next/headers'
import { decryptSecret, encryptSecret } from '@/lib/crypto/secret-box'

/**
 * La contraseña del certificado se pide UNA vez por sesión: tras firmar la primera receta se guarda
 * cifrada (AES-256-GCM) en una cookie httpOnly. Medidas:
 *  - httpOnly + sameSite=strict (+ secure en producción): JavaScript no puede leerla ni se envía desde otros sitios.
 *  - Va ligada al usuario y al `session_id` de su sesión de Supabase: otro inicio de sesión no la reutiliza.
 *  - Es cookie de sesión del navegador y además vence a las 8 horas.
 *  - Se borra al cerrar sesión, al cambiar de certificado o si resulta incorrecta.
 * Aun así, firmar siempre exige un código vigente del autenticador.
 */
const COOKIE_NAME = 'cl_cert_session'
const MAX_AGE_MS = 8 * 60 * 60 * 1000

type Payload = { uid: string; sid: string; pw: string; exp: number }

export async function rememberCertificatePassword(
  userId: string,
  sessionId: string,
  password: string
) {
  const payload: Payload = {
    uid: userId,
    sid: sessionId,
    pw: password,
    exp: Date.now() + MAX_AGE_MS
  }
  const jar = await cookies()
  jar.set(COOKIE_NAME, encryptSecret(Buffer.from(JSON.stringify(payload))), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
    // sin maxAge: se borra al cerrar el navegador
  })
}

export async function readRememberedPassword(
  userId: string,
  sessionId: string
): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value
  if (!raw) return null
  try {
    const payload = JSON.parse(decryptSecret(raw).toString('utf8')) as Payload
    if (payload.uid !== userId || payload.sid !== sessionId) return null
    if (payload.exp < Date.now()) return null
    return payload.pw
  } catch {
    // alterada, de otra clave o ilegible
    return null
  }
}

export async function forgetCertificatePassword() {
  ;(await cookies()).delete(COOKIE_NAME)
}

/** `session_id` del JWT (identifica este inicio de sesión de Supabase) */
export const sessionIdOf = (claims: unknown) =>
  (claims as { session_id?: string }).session_id ?? ''
