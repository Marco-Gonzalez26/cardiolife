import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'
import type { createClient } from '@/lib/supabase/server'

type ServerClient = ReturnType<typeof createClient>

export type SecretaryItem = {
  id: string
  email: string
  fullName: string
  createdAt: string
  lastSignInAt: string | null
}

/** Secretarias del médico de la sesión (el correo y el nombre salen de Auth, por eso se usa la clave de servicio) */
export async function getMySecretaries(
  supabase: ServerClient,
  doctorId: string
): Promise<SecretaryItem[]> {
  const { data: links } = await supabase
    .from('doctor_secretaries')
    .select('secretary_id')
    .eq('doctor_id', doctorId)
  if (!links?.length || !isAdminConfigured()) return []

  const admin = createAdminClient()
  const users = await Promise.all(
    links.map(async ({ secretary_id }) => {
      const { data } = await admin.auth.admin.getUserById(secretary_id)
      return data.user
    })
  )
  return users.flatMap((user) =>
    user
      ? [
          {
            id: user.id,
            email: user.email ?? '',
            fullName: (user.user_metadata?.full_name as string) ?? user.email ?? '',
            createdAt: user.created_at,
            lastSignInAt: user.last_sign_in_at ?? null
          }
        ]
      : []
  )
}
