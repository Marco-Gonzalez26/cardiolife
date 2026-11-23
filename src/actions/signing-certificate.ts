'use server'

import { cookies } from 'next/headers'
import { refreshDashboard } from '@/lib/revalidate'
import { encryptSecret, isEncryptionConfigured } from '@/lib/crypto/secret-box'
import { CertificateError, readP12 } from '@/lib/signing/certificate'
import { isAal2 } from '@/lib/services/mfa'
import { forgetCertificatePassword } from '@/lib/signing/password-session'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format-date'

const NOT_SIGNED_IN = 'Tu sesión expiró. Inicia sesión de nuevo.'
const NEEDS_MFA = 'Verifica tu identidad con el código de dos pasos para continuar.'
const MAX_BYTES = 256 * 1024

const getSession = async () => {
  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  return claims ? { supabase, userId: claims.claims.sub } : null
}

/**
 * Guarda el certificado .p12 del médico, cifrado. Se valida con su contraseña, pero la contraseña
 * NO se guarda: se pedirá cada vez que firme.
 */
export async function saveSigningCertificate(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: NOT_SIGNED_IN }
  const { supabase, userId } = session

  if (!(await isAal2(supabase))) return { error: NEEDS_MFA }
  if (!isEncryptionConfigured()) {
    return {
      error:
        'El servidor no tiene configurada la clave de cifrado (SIGNING_ENCRYPTION_KEY). Pide a quien administra el sistema que la configure.'
    }
  }

  const file = formData.get('certificate')
  const password = String(formData.get('password') ?? '')
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Selecciona el archivo de tu certificado (.p12 o .pfx).' }
  }
  if (!/\.(p12|pfx)$/i.test(file.name)) {
    return { error: 'El archivo debe ser un certificado .p12 o .pfx.' }
  }
  if (file.size > MAX_BYTES) {
    return { error: 'El archivo es demasiado grande para ser un certificado.' }
  }
  if (!password) return { error: 'Ingresa la contraseña del certificado.' }

  const p12 = Buffer.from(await file.arrayBuffer())
  let info
  try {
    info = readP12(p12, password)
  } catch (error) {
    if (error instanceof CertificateError) return { error: error.message }
    return { error: 'No se pudo leer el certificado.' }
  }

  const now = new Date()
  if (info.validTo < now) {
    return {
      error: `El certificado está vencido (venció el ${formatDate(info.validTo)}).`
    }
  }
  if (info.validFrom > now) {
    return { error: 'El certificado todavía no es válido (su vigencia aún no empieza).' }
  }

  const { error } = await supabase.from('doctor_signing_certificate').upsert({
    doctor_id: userId,
    encrypted_p12: encryptSecret(p12),
    subject: info.subject,
    issuer: info.issuer,
    serial_number: info.serialNumber,
    valid_from: info.validFrom.toISOString(),
    valid_to: info.validTo.toISOString(),
    fingerprint_sha256: info.fingerprintSha256,
    uploaded_at: now.toISOString()
  })
  if (error) {
    return {
      error:
        error.code === '42501'
          ? 'Solo el médico puede guardar el certificado de firma.'
          : error.message
    }
  }

  await forgetCertificatePassword()
  refreshDashboard()
  return { success: true as const, commonName: info.commonName }
}

export async function removeSigningCertificate() {
  const session = await getSession()
  if (!session) return { error: NOT_SIGNED_IN }
  const { supabase, userId } = session
  if (!(await isAal2(supabase))) return { error: NEEDS_MFA }

  const { error } = await supabase
    .from('doctor_signing_certificate')
    .delete()
    .eq('doctor_id', userId)
  if (error) return { error: error.message }

  await forgetCertificatePassword()
  refreshDashboard()
  return { success: true as const }
}
