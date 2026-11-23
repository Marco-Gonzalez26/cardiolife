'use server'

import { cookies } from 'next/headers'
import { refreshDashboard } from '@/lib/revalidate'
import { createClient } from '@/lib/supabase/server'
import {
  evolutionDraftSchema,
  evolutionSchema,
  type EvolutionFormData,
  type EvolutionStatus
} from '@/lib/validations/evolution'

const NOT_SIGNED_IN = 'Tu sesión expiró. Inicia sesión de nuevo.'
const DOCTOR_ONLY = 'Solo el médico del paciente puede completar evoluciones.'
const NOT_ALLOWED = 'No tienes permiso para esta evolución, o ya está completada.'

const parse = (data: EvolutionFormData, status: EvolutionStatus) =>
  (status === 'completed' ? evolutionSchema : evolutionDraftSchema).safeParse(
    data
  )

const getSession = async () => {
  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  return claims ? supabase : null
}

/** Quita los valores vacíos; devuelve null si no queda ninguno (no se guarda un jsonb vacío) */
const compact = (values: Record<string, string>) => {
  const entries = Object.entries(values)
    .map(([key, value]) => [key, value.trim()] as const)
    .filter(([, value]) => value !== '')
  return entries.length ? Object.fromEntries(entries) : null
}

const text = (value: string) => value.trim() || null

const toRow = (value: EvolutionFormData, status: EvolutionStatus) => ({
  status,
  diagnosis: text(value.diagnosis),
  sugestive: text(value.sugestive),
  treatment: text(value.treatment),
  treatment_plan: text(value.treatmentPlan),
  ekg_diagnosis: text(value.ekgDiagnosis),
  objective: compact(value.objective),
  ekg: compact(value.ekg)
})


/**
 * Registra una evolución de seguimiento, asociada a la última historia completada del paciente.
 * Médico o secretaria pueden guardarla como borrador; solo el médico la completa (lo hace cumplir la RLS).
 */
export async function createEvolution(
  patientId: string,
  data: EvolutionFormData,
  status: EvolutionStatus = 'completed'
) {
  const supabase = await getSession()
  if (!supabase) return { error: NOT_SIGNED_IN }

  const parsed = parse(data, status)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { data: history } = await supabase
    .from('clinic_history')
    .select('id')
    .eq('patient_id', patientId)
    .eq('status', 'completed')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!history) {
    return {
      error:
        'El paciente no tiene una historia clínica completada. Complétala antes de registrar evoluciones.'
    }
  }

  const { data: evolution, error } = await supabase
    .from('evolution')
    .insert({
      patient_id: patientId,
      clinic_history_id: history.id,
      ...toRow(parsed.data, status)
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.code === '42501' ? DOCTOR_ONLY : error.message }
  }

  refreshDashboard()
  return { success: true as const, id: evolution.id as string }
}

/**
 * Guarda cambios. Como borrador solo actúa sobre borradores (no degrada una evolución completada);
 * como completada solo el médico (la RLS lo impide a la secretaria).
 */
export async function updateEvolution(
  id: string,
  data: EvolutionFormData,
  status: EvolutionStatus = 'completed'
) {
  const supabase = await getSession()
  if (!supabase) return { error: NOT_SIGNED_IN }

  const parsed = parse(data, status)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  let query = supabase
    .from('evolution')
    .update(toRow(parsed.data, status))
    .eq('id', id)
  if (status === 'draft') query = query.eq('status', 'draft')

  const { data: row, error } = await query.select('patient_id').maybeSingle()

  if (error) {
    return { error: error.code === '42501' ? DOCTOR_ONLY : error.message }
  }
  // La RLS no devuelve error cuando no hay permiso: simplemente no actualiza nada
  if (!row) return { error: NOT_ALLOWED }

  refreshDashboard()
  return { success: true as const }
}

export async function deleteEvolution(id: string) {
  const supabase = await getSession()
  if (!supabase) return { error: NOT_SIGNED_IN }

  const { data: row, error } = await supabase
    .from('evolution')
    .delete()
    .eq('id', id)
    .select('patient_id')
    .maybeSingle()

  if (error) {
    return {
      error:
        error.code === '23503'
          ? 'No se puede eliminar: tiene recetas o archivos asociados.'
          : error.message
    }
  }
  if (!row) return { error: NOT_ALLOWED }

  refreshDashboard()
  return { success: true as const }
}
