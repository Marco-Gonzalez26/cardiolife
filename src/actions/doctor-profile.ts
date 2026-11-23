'use server'

import { cookies } from 'next/headers'
import { refreshDashboard } from '@/lib/revalidate'
import { createClient } from '@/lib/supabase/server'
import {
  doctorProfileSchema,
  type DoctorProfileFormData
} from '@/lib/validations/doctor-profile'

const text = (value: string) => value.trim() || null

/** Actualiza el perfil del médico logueado (la RLS solo permite editar el propio) */
export async function updateDoctorProfile(data: DoctorProfileFormData) {
  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) return { error: 'Tu sesión expiró. Inicia sesión de nuevo.' }

  const parsed = doctorProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }
  const value = parsed.data

  const { data: updated, error } = await supabase
    .from('doctor_profile')
    .update({
      full_name: value.fullName.trim(),
      specialty: text(value.specialty),
      license: text(value.license),
      identification: text(value.identification),
      phone: text(value.phone),
      email: value.email.trim(),
      address: text(value.address),
      city: text(value.city)
    })
    .eq('id', claims.claims.sub)
    .select('id')
    .maybeSingle()

  if (error) return { error: error.message }
  if (!updated) return { error: 'Solo el médico puede editar este perfil.' }

  refreshDashboard()
  return { success: true as const }
}
