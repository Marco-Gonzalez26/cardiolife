import type { createClient } from '@/lib/supabase/server'

type ServerClient = ReturnType<typeof createClient>

type PatientRef = {
  names: string
  lastnames: string
  identification: string | null
}

export type HistoryListItem = {
  id: number
  patient_id: string
  date: string | null
  created_at: string
  created_by: string | null
  status: 'draft' | 'completed'
  reason: string | null
  diagnosis: string | null
  patient: PatientRef
}

export type EvolutionListItem = {
  id: string
  patient_id: string
  clinic_history_id: number
  created_at: string
  created_by: string | null
  status: 'draft' | 'completed'
  diagnosis: string | null
  treatment: string | null
  treatment_plan: string | null
  ekg_diagnosis: string | null
  patient: PatientRef
}

const PATIENT_REF = 'patient:patient_id!inner(names, lastnames, identification)'
/** Tope de filas que se traen de una vez (un solo consultorio; búsqueda y paginación en el cliente) */
const MAX_ROWS = 1000

/** Historias clínicas de todos los pacientes visibles, las más recientes primero */
export async function getClinicHistoryList(
  supabase: ServerClient
): Promise<HistoryListItem[]> {
  const { data, error } = await supabase
    .from('clinic_history')
    .select(
      `id, patient_id, date, created_at, created_by, status, reason, diagnosis, ${PATIENT_REF}`
    )
    .order('date', { ascending: false, nullsFirst: false })
    .limit(MAX_ROWS)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as HistoryListItem[]
}

/** Evoluciones de todos los pacientes visibles, las más recientes primero */
export async function getEvolutionList(
  supabase: ServerClient
): Promise<EvolutionListItem[]> {
  const { data, error } = await supabase
    .from('evolution')
    .select(
      `id, patient_id, clinic_history_id, created_at, created_by, status, diagnosis, treatment, treatment_plan, ekg_diagnosis, ${PATIENT_REF}`
    )
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as EvolutionListItem[]
}
