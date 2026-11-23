'use server'

import { cookies } from 'next/headers'
import { refreshDashboard } from '@/lib/revalidate'
import { createClient } from '@/lib/supabase/server'
import { toRpcPayload } from '@/lib/services/clinic-history-mapper'
import {
  clinicHistoryDraftSchema,
  clinicHistorySchema,
  type ClinicHistoryFormData,
  type ClinicHistoryStatus
} from '@/lib/validations/clinic-history'

interface SaveClinicHistoryInput {
  patientId: string
  status: ClinicHistoryStatus
  /** Presente al continuar un borrador existente */
  clinicHistoryId?: number
  data: ClinicHistoryFormData
}

/**
 * Guarda una historia clínica como borrador (secretaria o médico) o completa
 * (solo el médico; lo hace cumplir la RPC y la RLS). Antecedentes, examen físico,
 * paraclínico e historia se escriben en una sola transacción.
 */
export async function saveClinicHistory({
  patientId,
  status,
  clinicHistoryId,
  data
}: SaveClinicHistoryInput) {
  const schema =
    status === 'completed' ? clinicHistorySchema : clinicHistoryDraftSchema
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = createClient(await cookies())
  const { data: id, error } = await supabase.rpc('save_clinic_history', {
    p_patient_id: patientId,
    p_status: status,
    p_clinic_history_id: clinicHistoryId,
    ...toRpcPayload(data)
  })

  if (error) return { error: error.message }

  refreshDashboard()
  return { success: true as const, id }
}
