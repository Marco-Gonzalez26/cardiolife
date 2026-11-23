import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TermsContact } from '@/lib/terms'

type ServerClient = ReturnType<typeof createClient>

export type PortalPatient = {
  id: string
  names: string
  lastnames: string
  identification: string | null
  birthdate: string | null
  email: string | null
  doctor_profile_id: string
}

/** Paciente vinculado a la cuenta de la sesión (la RLS solo deja ver la propia ficha) */
export async function getPortalPatient(
  supabase: ServerClient,
  userId: string
): Promise<PortalPatient | null> {
  const { data } = await supabase
    .from('patient')
    .select(
      'id, names, lastnames, identification, birthdate, email, doctor_profile_id'
    )
    .eq('user_id', userId)
    .maybeSingle()
  return (data as PortalPatient | null) ?? null
}

/**
 * Datos de contacto del consultorio para los términos. Se piden solo estas columnas:
 * el perfil del médico también guarda su cédula y otros datos que el paciente no necesita.
 */
export async function getTermsContact(supabase: ServerClient): Promise<TermsContact> {
  const { data } = await supabase
    .from('doctor_profile')
    .select('full_name, email, phone')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  return { doctorName: data?.full_name, email: data?.email, phone: data?.phone }
}

/** Para las páginas del portal: cliente de la sesión + paciente propio (null si no hay cuenta vinculada) */
export async function getCurrentPortalPatient() {
  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')
  const patient = await getPortalPatient(supabase, claims.claims.sub)
  return patient ? { supabase, patient } : null
}
