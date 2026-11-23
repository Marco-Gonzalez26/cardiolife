import { createClient } from '@supabase/supabase-js'

/**
 * Cliente con la clave de servicio (service role): se salta la RLS y puede crear usuarios de Auth.
 * SOLO para Server Actions, después de comprobar quién llama. Nunca importarlo en componentes cliente;
 * la variable no empieza con NEXT_PUBLIC_, así que no llega al navegador.
 */
export const isAdminConfigured = () =>
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

export const createAdminClient = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
