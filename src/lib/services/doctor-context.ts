import type { createClient } from '@/lib/supabase/server'

type ServerClient = ReturnType<typeof createClient>

export type DoctorContext = {
  userId: string
  email: string | null
  /** Médico dueño de los pacientes que ve este usuario (él mismo o su médico asignado) */
  doctorId: string | null
  role: 'doctor' | 'secretary' | null
  /** Nombre a mostrar en la barra superior */
  displayName: string
  /** Especialidad del médico, o "Secretaría" */
  roleLabel: string
}

/**
 * Resuelve quién es el usuario de la sesión respecto a los médicos:
 * - médico: tiene fila en `doctor_profile`
 * - secretaria: tiene fila en `doctor_secretaries` (trabaja para ese médico)
 */
export async function getDoctorContext(
  supabase: ServerClient
): Promise<DoctorContext | null> {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: ownProfile } = await supabase
    .from('doctor_profile')
    .select('id, full_name, specialty')
    .eq('id', user.id)
    .maybeSingle()

  if (ownProfile) {
    return {
      userId: user.id,
      email: user.email ?? null,
      doctorId: ownProfile.id,
      role: 'doctor',
      displayName: ownProfile.full_name,
      roleLabel: ownProfile.specialty ?? 'Médico'
    }
  }

  const { data: link } = await supabase
    .from('doctor_secretaries')
    .select('doctor_id')
    .eq('secretary_id', user.id)
    .limit(1)
    .maybeSingle()

  return {
    userId: user.id,
    email: user.email ?? null,
    doctorId: link?.doctor_id ?? null,
    role: link ? 'secretary' : null,
    displayName:
      (user.user_metadata?.full_name as string | undefined) ??
      user.email ??
      'Usuario',
    roleLabel: link ? 'Secretaría' : ''
  }
}
