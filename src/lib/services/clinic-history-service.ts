import { createClient } from '@/lib/supabase/components-client'
import { DB_TABLES } from '../constants'
import type { ClinicHistoryWithRelations } from './clinic-history-mapper'

/**
 * Lecturas de historia clínica (cliente del navegador, con la sesión por cookies).
 * Las escrituras van por la Server Action `saveClinicHistory` (RPC transaccional).
 */
const SELECT_WITH_RELATIONS =
  '*, antecedents(*), physical_exam(*), paraclinical_exam(*)'

export async function getClinicHistoryById(
  id: number
): Promise<ClinicHistoryWithRelations | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(DB_TABLES.CLINIC_HISTORY)
    .select(SELECT_WITH_RELATIONS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export async function getClinicHistoryByPatientId(
  patientId: string
): Promise<ClinicHistoryWithRelations[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(DB_TABLES.CLINIC_HISTORY)
    .select(SELECT_WITH_RELATIONS)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
