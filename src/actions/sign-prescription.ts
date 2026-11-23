'use server'

import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import { refreshDashboard } from '@/lib/revalidate'
import { nowInClinic } from '@/lib/date-utils'
import { isEncryptionConfigured } from '@/lib/crypto/secret-box'
import {
  loadPrescriptionPdfData,
  renderPrescriptionPdf
} from '@/lib/pdf/prescription-pdf'
import { getPrescriptionGroup } from '@/lib/services/prescriptions-service'
import { isAal2 } from '@/lib/services/mfa'
import { CertificateError, readP12 } from '@/lib/signing/certificate'
import { loadOwnCertificate } from '@/lib/signing/certificate-store'
import { SIGNED_BUCKET } from '@/lib/signing/constants'
import {
  forgetCertificatePassword,
  readRememberedPassword,
  rememberCertificatePassword,
  sessionIdOf
} from '@/lib/signing/password-session'
import { signPdf } from '@/lib/signing/sign-pdf'
import { createClient } from '@/lib/supabase/server'

const NOT_SIGNED_IN = 'Tu sesión expiró. Inicia sesión de nuevo.'


/**
 * Firma electrónicamente una receta con el certificado del médico.
 *
 * Seguridad en capas: sesión con segundo factor (AAL2) + código vigente del autenticador en este momento
 * + contraseña del certificado. La contraseña se pide UNA vez por sesión (queda cifrada en una cookie
 * httpOnly ligada a tu inicio de sesión); `certificatePassword` puede ir vacío si ya está recordada.
 * Después de firmar, la receta queda inmutable.
 */
export async function signPrescription(
  groupId: string,
  certificatePassword: string,
  totpCode: string
) {
  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) return { error: NOT_SIGNED_IN }
  const userId = claims.claims.sub
  const sessionId = sessionIdOf(claims.claims)

  if (!(await isAal2(supabase))) {
    return { error: 'Verifica tu identidad con el código de dos pasos para continuar.' }
  }
  if (!isEncryptionConfigured()) {
    return { error: 'El servidor no tiene configurada la clave de cifrado del certificado.' }
  }

  // Contraseña escrita ahora o, si no, la recordada en esta sesión
  const typed = certificatePassword
  const password = typed || (await readRememberedPassword(userId, sessionId)) || ''
  if (!password) {
    return {
      error: 'Ingresa la contraseña de tu certificado.',
      code: 'password_required' as const
    }
  }
  if (!/^\d{6}$/.test(totpCode)) return { error: 'Ingresa el código de 6 dígitos del autenticador.' }

  // Confirmación fresca del segundo factor: firmar es un acto con valor legal
  const { data: factors } = await supabase.auth.mfa.listFactors()
  const factor = factors?.totp?.[0]
  if (!factor) return { error: 'No tienes un autenticador activo.' }
  const { error: mfaError } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code: totpCode
  })
  if (mfaError) return { error: 'El código del autenticador es incorrecto o venció.' }

  const group = await getPrescriptionGroup(supabase, groupId)
  if (!group) return { error: 'Receta no encontrada.' }
  if (group.patient.doctor_profile_id !== userId) {
    return { error: 'Solo el médico del paciente puede firmar la receta.' }
  }
  if (group.signedAt) return { error: 'Esta receta ya está firmada.' }
  if (group.status === 'Anulada') return { error: 'No se puede firmar una receta anulada.' }

  const p12 = await loadOwnCertificate(supabase, userId)
  if (!p12) {
    return { error: 'Primero guarda tu certificado de firma en Ajustes.' }
  }

  let info
  try {
    info = readP12(p12, password)
  } catch (error) {
    // La recordada ya no sirve (p. ej. se cambió el certificado): se olvida y se vuelve a pedir
    if (!typed) await forgetCertificatePassword()
    return {
      code: 'password_required' as const,
      error:
        error instanceof CertificateError
          ? error.message
          : 'No se pudo leer el certificado.'
    }
  }
  const now = new Date()
  if (info.validTo < now) {
    return { error: 'Tu certificado está vencido. Súbelo renovado en Ajustes.' }
  }

  // Contraseña verificada: se recuerda durante esta sesión
  if (typed) await rememberCertificatePassword(userId, sessionId, typed)

  try {
    const clinicNow = nowInClinic()
    const [year, month, day] = clinicNow.date.split('-')
    const signedAtLabel = `${day}/${month}/${year} ${clinicNow.time} (hora de Ecuador)`

    // La constancia visible se imprime ANTES de firmar, para que la firma cubra todo el documento
    const data = await loadPrescriptionPdfData(supabase, group, {
      signerName: info.commonName,
      signedAt: signedAtLabel
    })
    const pdf = await renderPrescriptionPdf(data)
    const signed = await signPdf(pdf, p12, password, {
      reason: 'Receta médica',
      name: info.commonName,
      contactInfo: data.doctor.email ?? '',
      location: data.doctor.city ?? ''
    })
    const sha256 = createHash('sha256').update(signed).digest('hex')

    const path = `${group.patient.id}/${groupId}.pdf`
    const { error: uploadError } = await supabase.storage
      .from(SIGNED_BUCKET)
      .upload(path, signed, { contentType: 'application/pdf', upsert: false })
    if (uploadError) {
      return {
        error: `No se pudo guardar el PDF firmado: ${uploadError.message}`
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('prescriptions')
      .update({
        signed_at: now.toISOString(),
        signed_by: userId,
        signed_pdf_path: path,
        signed_pdf_sha256: sha256,
        signer_subject: info.subject,
        status: 'Firmada'
      })
      .eq('prescription_group_id', groupId)
      .is('signed_at', null)
      .select('id')

    if (updateError || !updated || updated.length === 0) {
      return {
        error:
          updateError?.message ??
          'No se pudo registrar la firma de la receta. Inténtalo de nuevo.'
      }
    }

    refreshDashboard()
    return { success: true as const, sha256 }
  } catch (error) {
    console.error('Error al firmar la receta', error)
    return { error: 'No se pudo firmar la receta. Inténtalo de nuevo.' }
  }
}

/** Anula una receta ya firmada (no se elimina: queda el registro y el PDF firmado original) */
export async function annulPrescription(groupId: string, reason: string) {
  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) return { error: NOT_SIGNED_IN }
  if (!(await isAal2(supabase))) {
    return { error: 'Verifica tu identidad con el código de dos pasos para continuar.' }
  }
  if (reason.trim().length < 5) {
    return { error: 'Escribe el motivo de la anulación (mínimo 5 caracteres).' }
  }

  const { data, error } = await supabase
    .from('prescriptions')
    .update({
      status: 'Anulada',
      discontinued_at: new Date().toISOString(),
      discontinued_reason: reason.trim()
    })
    .eq('prescription_group_id', groupId)
    .not('signed_at', 'is', null)
    .select('patient_id')

  if (error) return { error: error.message }
  if (!data || data.length === 0) {
    return { error: 'No se pudo anular: la receta no está firmada o no tienes permiso.' }
  }

  refreshDashboard()
  return { success: true as const }
}

/** Olvida la contraseña recordada (por ejemplo en un computador compartido) */
export async function forgetRememberedPassword() {
  await forgetCertificatePassword()
  return { success: true as const }
}
