import { decryptSecret } from '@/lib/crypto/secret-box'
import type { createClient } from '@/lib/supabase/server'

/**
 * Certificado .p12 del médico logueado, descifrado en memoria. SOLO para uso interno del servidor
 * (no debe vivir en un archivo 'use server': cualquier export de esos archivos es invocable desde el navegador).
 */
export async function loadOwnCertificate(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<Buffer | null> {
  const { data } = await supabase
    .from('doctor_signing_certificate')
    .select('encrypted_p12')
    .eq('doctor_id', userId)
    .maybeSingle()
  return data ? decryptSecret(data.encrypted_p12) : null
}
