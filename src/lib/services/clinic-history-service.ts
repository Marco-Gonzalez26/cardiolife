import { ClinicHistoryFormData } from '../validations/clinic-history'
import { supabase } from '@/lib/supabase'

export interface ClinicHistory {
  id: string
  created_at: string
  date: string
  reason: string
  treatmentPlan: string
  antecedents: string
  physicalExam: string
  paraclinicalExam: string
}

export interface CreateClinicHistoryData {
  date: string
  reason: string
  treatmentPlan: string
  antecedents: string
  physicalExam: string
  paraclinicalExam: string
}

export interface UpdateClinicHistoryData
  extends Partial<CreateClinicHistoryData> {}

/**
 *  Create clinic history
 */

export async function createClinicHistory(
  data: CreateClinicHistoryData
): Promise<ClinicHistory | null> {
  const { data: clinicHistory, error } = await supabase
    .from('clinic_history')
    .insert({
      date: data.date,
      reason: data.reason,
      treatmentPlan: data.treatmentPlan,
      antecedents: JSON.stringify(data.antecedents),
      physicalExam: JSON.stringify(data.physicalExam),
      paraclinicalExam: JSON.stringify(data.paraclinicalExam)
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return clinicHistory
}

/**
 *  Get  clinic history by id
 */

export async function getClinicHistoryById(
  id: string
): Promise<ClinicHistory | null> {
  try {
    const { data, error } = await supabase
      .from('clinic_history')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)

    return data
  } catch (error) {
    return null
  }
}

/**
 *  Update clinic history
 */

export async function updateClinicHistory(
  id: string,
  data: UpdateClinicHistoryData
) {
  console.log('update clinic history', data)
  try {
    const updateData: any = { ...data }
    if (updateData.date) {
      updateData.date = updateData.date.trim()
    }
    if (updateData.reason) {
      updateData.reason = updateData.reason.trim()
    }
    if (updateData.treatmentPlan) {
      updateData.treatmentPlan = updateData.treatmentPlan.trim()
    }
    const { data: clinicHistory, error } = await supabase
      .from('clinic_history')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return clinicHistory
  } catch (error) {
    return null
  }
}

/**
 * Get all clinic histories
 */

export async function getAllClinicHistories() {
  const { data, error } = await supabase
    .from('clinic_history')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data || []
}

/**
 * Get clinic history by patient id
 */

export async function getClinicHistoryByPatientId(patientId: string) {
  const { data, error } = await supabase
    .from('clinic_history')
    .select('*')
    .eq('patient_id', patientId)

  if (error) throw new Error(error.message)

  return data || []
}
