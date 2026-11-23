'use server'

import { cookies } from 'next/headers'
import { refreshDashboard } from '@/lib/revalidate'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { isAal2 } from '@/lib/services/mfa'
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  passwordSchema,
  secretarySchema,
  type SecretaryFormData
} from '@/lib/validations/team'

/** Solo el médico, con segundo factor verificado, gestiona su equipo */
const requireDoctor = async () => {
  const supabase = createClient(await cookies())
  const context = await getDoctorContext(supabase)
  if (context?.role !== 'doctor' || !context.doctorId) {
    return { ok: false as const, error: 'Solo el médico puede gestionar las secretarias.' as const }
  }
  if (!(await isAal2(supabase))) {
    return {
      ok: false as const,
      error: 'Verifica tu identidad con el código de dos pasos para continuar.' as const
    }
  }
  if (!isAdminConfigured()) {
    return {
      ok: false as const,
      error:
        'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor para crear cuentas.' as const
    }
  }
  return { ok: true as const, supabase, doctorId: context.doctorId }
}

/** Crea la cuenta de una secretaria (correo ya confirmado) y la vincula al médico */
export async function createSecretary(data: SecretaryFormData) {
  const gate = await requireDoctor()
  if (!gate.ok) return { error: gate.error }

  const parsed = secretarySchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const admin = createAdminClient()
  const { data: created, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName.trim(), role: 'secretary' }
  })
  if (error || !created.user) {
    return {
      error: /already|registered|exists/i.test(error?.message ?? '')
        ? 'Ya existe una cuenta con ese correo.'
        : (error?.message ?? 'No se pudo crear la cuenta')
    }
  }

  const { error: linkError } = await gate.supabase
    .from('doctor_secretaries')
    .insert({ doctor_id: gate.doctorId, secretary_id: created.user.id })
  if (linkError) {
    // Sin vínculo la cuenta no sirve: se deshace
    await admin.auth.admin.deleteUser(created.user.id)
    return { error: linkError.message }
  }

  refreshDashboard()
  return { success: true as const }
}

/** Cambia la contraseña de una secretaria del médico (por si la olvidó) */
export async function resetSecretaryPassword(
  secretaryId: string,
  password: string
) {
  const gate = await requireDoctor()
  if (!gate.ok) return { error: gate.error }

  const parsed = passwordSchema.safeParse(password)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Contraseña inválida' }
  }

  const { data: link } = await gate.supabase
    .from('doctor_secretaries')
    .select('secretary_id')
    .eq('doctor_id', gate.doctorId)
    .eq('secretary_id', secretaryId)
    .maybeSingle()
  if (!link) return { error: 'Esa persona no es tu secretaria.' }

  const { error } = await createAdminClient().auth.admin.updateUserById(
    secretaryId,
    { password: parsed.data }
  )
  if (error) return { error: error.message }
  return { success: true as const }
}

/** Quita el acceso de una secretaria: borra el vínculo y su cuenta (lo que ella creó se conserva) */
export async function removeSecretary(secretaryId: string) {
  const gate = await requireDoctor()
  if (!gate.ok) return { error: gate.error }

  const { data: link, error } = await gate.supabase
    .from('doctor_secretaries')
    .delete()
    .eq('doctor_id', gate.doctorId)
    .eq('secretary_id', secretaryId)
    .select('secretary_id')
    .maybeSingle()
  if (error) return { error: error.message }
  if (!link) return { error: 'Esa persona no es tu secretaria.' }

  await createAdminClient().auth.admin.deleteUser(secretaryId)
  refreshDashboard()
  return { success: true as const }
}
