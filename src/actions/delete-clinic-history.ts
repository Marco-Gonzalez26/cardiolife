'use server'

import { cookies } from 'next/headers'
import { refreshDashboard } from '@/lib/revalidate'
import { createClient } from '@/lib/supabase/server'

/**
 * Elimina una historia clínica y sus exámenes (función SQL transaccional).
 * Falla si tiene evoluciones o recetas asociadas, o si el usuario no tiene permiso.
 */
export async function deleteClinicHistory(id: number) {
  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) return { error: 'Tu sesión expiró. Inicia sesión de nuevo.' }

  const { error } = await supabase.rpc('delete_clinic_history', { p_id: id })

  if (error) {
    return {
      error:
        error.code === '23503'
          ? 'No se puede eliminar: tiene recetas asociadas.'
          : error.message
    }
  }

  refreshDashboard()
  return { success: true as const }
}
