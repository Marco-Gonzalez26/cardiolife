'use server'

import { randomInt } from 'node:crypto'
import { cookies } from 'next/headers'
import { refreshDashboard } from '@/lib/revalidate'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/** Sin caracteres ambiguos (0/O, 1/l/I) para que se pueda dictar o leer por WhatsApp */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
const generatePassword = (length = 12) =>
  Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')

/** Médico o secretaria con acceso al paciente (lo comprueba la RLS al leer la fila) */
const requireStaffOf = async (patientId: string) => {
  const supabase = createClient(await cookies())
  const context = await getDoctorContext(supabase)
  if (!context?.role) {
    return { ok: false as const, error: 'No tienes permiso para esta acción.' as const }
  }
  if (!isAdminConfigured()) {
    return {
      ok: false as const,
      error:
        'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor para crear cuentas.' as const
    }
  }
  const { data: patient } = await supabase
    .from('patient')
    .select('id, names, lastnames, email, user_id')
    .eq('id', patientId)
    .maybeSingle()
  if (!patient) return { ok: false as const, error: 'Paciente no encontrado.' as const }
  return { ok: true as const, supabase, patient }
}

/**
 * Crea la cuenta del portal del paciente con una contraseña temporal que se muestra UNA vez
 * (el personal se la entrega al paciente). El correo debe estar registrado en la ficha.
 */
export async function grantPortalAccess(patientId: string) {
  const gate = await requireStaffOf(patientId)
  if (!gate.ok) return { error: gate.error }
  const { supabase, patient } = gate

  if (patient.user_id) return { error: 'El paciente ya tiene acceso al portal.' }
  const email = patient.email?.trim().toLowerCase()
  if (!email) {
    return { error: 'Registra primero el correo electrónico del paciente.' }
  }

  const password = generatePassword()
  const admin = createAdminClient()
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `${patient.names} ${patient.lastnames}`,
      role: 'patient',
      must_change_password: true
    }
  })
  if (error || !created.user) {
    return {
      error: /already|registered|exists/i.test(error?.message ?? '')
        ? 'Ese correo ya pertenece a otra cuenta.'
        : (error?.message ?? 'No se pudo crear la cuenta')
    }
  }

  const { error: linkError } = await supabase
    .from('patient')
    .update({ user_id: created.user.id })
    .eq('id', patientId)
  if (linkError) {
    await admin.auth.admin.deleteUser(created.user.id)
    return { error: linkError.message }
  }

  refreshDashboard()
  return { success: true as const, email, password }
}

/** Genera otra contraseña temporal (el paciente la olvidó) */
export async function resetPortalPassword(patientId: string) {
  const gate = await requireStaffOf(patientId)
  if (!gate.ok) return { error: gate.error }
  if (!gate.patient.user_id) return { error: 'El paciente no tiene acceso al portal.' }

  const password = generatePassword()
  const { error } = await createAdminClient().auth.admin.updateUserById(
    gate.patient.user_id,
    { password, user_metadata: { must_change_password: true } }
  )
  if (error) return { error: error.message }
  return {
    success: true as const,
    email: gate.patient.email ?? '',
    password
  }
}

/** Quita el acceso: se borra la cuenta; la ficha y la historia del paciente no se tocan */
export async function revokePortalAccess(patientId: string) {
  const gate = await requireStaffOf(patientId)
  if (!gate.ok) return { error: gate.error }
  const userId = gate.patient.user_id
  if (!userId) return { error: 'El paciente no tiene acceso al portal.' }

  const { error } = await gate.supabase
    .from('patient')
    .update({ user_id: null })
    .eq('id', patientId)
  if (error) return { error: error.message }

  await createAdminClient().auth.admin.deleteUser(userId)
  refreshDashboard()
  return { success: true as const }
}
