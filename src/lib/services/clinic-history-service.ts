/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClinicHistoryFormData } from '../validations/clinic-history'
import { supabase } from '@/lib/supabase'
import { createAntecedents } from './antecedents-service'
import { createPhysicalExam } from './physical-exam-service'
import { createParaclinicalExam } from './paraclinical-exam-service'
import { DB_TABLES } from '../constants'

export interface ClinicHistory {
  id: string
  created_at: string
  date: string
  reason: string
  treatment_plan: string
  diagnosis: string
  antecedents_id: string
  physical_exam_id: string
  paraclinical_exam_id: string
  patient_id: string
}


export interface CreateClinicHistoryData {
  date: Date
  reason: string
  treatmentPlan: string
  diagnosis: string
  antecedents: ClinicHistoryFormData['antecedents']
  physicalExam: ClinicHistoryFormData['physicalExam']
  paraclinicalExam: ClinicHistoryFormData['paraclinicalExam']
}

export type UpdateClinicHistoryData = Partial<CreateClinicHistoryData>

/**
 *  Create clinic history
 */

export async function createClinicHistory(
  data: CreateClinicHistoryData & { patientId: string }
): Promise<ClinicHistory | null> {
  const antecedents = await createAntecedents(data.antecedents)
  if (!antecedents) {
    throw new Error('Error al crear antecedentes')
  }

  const physicalExam = await createPhysicalExam(data.physicalExam)
  if (!physicalExam) {
    throw new Error('Error al crear examen físico')
  }

  const paraclinicalExam = await createParaclinicalExam(data.paraclinicalExam)
  if (!paraclinicalExam) {
    throw new Error('Error al crear examen paraclinico')
  }

  const { data: clinicHistory, error } = await supabase
    .from(DB_TABLES.CLINIC_HISTORY)
    .insert({
      patient: data.patientId,
      date: data.date,
      reason: data.reason,
      treatment_plan: data.treatmentPlan,
      diagnosis: data.diagnosis,
      antecedents_id: antecedents.id,
      physical_exam_id: physicalExam.id,
      paraclinical_exam_id: paraclinicalExam.id
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
      .from(DB_TABLES.CLINIC_HISTORY)
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
      .from(DB_TABLES.CLINIC_HISTORY)
      .update(updateData)
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
    .from(DB_TABLES.CLINIC_HISTORY)
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
    .from(DB_TABLES.CLINIC_HISTORY)
    .select('*')
    .eq('patient_id', patientId)

  if (error) throw new Error(error.message)

  return data || []
}
