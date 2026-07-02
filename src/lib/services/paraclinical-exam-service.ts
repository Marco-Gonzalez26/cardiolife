/* eslint-disable @typescript-eslint/no-explicit-any */
import { DB_TABLES } from '../constants'
import { ParaclinicalExamFormData } from '../validations/clinic-history'
import { supabase } from '@/lib/supabase'

export interface ParaclinicalExam {
  id: string
  created_at: string
  rs?: string
  pWave?: string
  bloodPreassure?: string
  qrs?: string
  axis?: string
  qtc?: string
  ts?: string
  observations?: string
  height?: string
  imc?: string
  findings?: string
}

export interface CreateParaclinicalExamData {
  rs?: string
  pWave?: string
  bloodPreassure?: string
  qrs?: string
  axis?: string
  qtc?: string
  ts?: string
  observations?: string
  height?: string
  imc?: string
  findings?: string
}

export type UpdateParaclinicalExamData = Partial<CreateParaclinicalExamData>

/**
 *  Create paraclinical exam
 */

export async function createParaclinicalExam(
  data: CreateParaclinicalExamData
): Promise<ParaclinicalExam | null> {
  const { data: paraclinicalExam, error } = await supabase
    .from(DB_TABLES.PARACLINICAL_EXAM)
    .insert({
      rs: data.rs || null,
      p_wave: data.pWave || null,
      blood_pressure: data.bloodPreassure || null,
      qrs: data.qrs || null,
      axis: data.axis || null,
      qtc: data.qtc || null,
      ts: data.ts || null,
      observations: data.observations || null
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return paraclinicalExam
}

/**
 *  Get  paraclinical exam by id
 */

export async function getParaclinicalExamById(
  id: string
): Promise<ParaclinicalExam | null> {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.PARACLINICAL_EXAM)
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
 *  Update paraclinical exam
 */

export async function updateParaclinicalExam(
  id: string,
  data: UpdateParaclinicalExamData
) {
  console.log('update paraclinical exam', data)
  try {
    const updateData: any = { ...data }
    if (updateData.rs) {
      updateData.rs = updateData.rs.trim()
    }
    if (updateData.pWave) {
      updateData.pWave = updateData.pWave.trim()
    }
    if (updateData.bloodPreassure) {
      updateData.bloodPreassure = updateData.bloodPreassure.trim()
    }
    if (updateData.qrs) {
      updateData.qrs = updateData.qrs.trim()
    }
    if (updateData.axis) {
      updateData.axis = updateData.axis.trim()
    }
    if (updateData.qtc) {
      updateData.qtc = updateData.qtc.trim()
    }
    if (updateData.ts) {
      updateData.ts = updateData.ts.trim()
    }
    if (updateData.observations) {
      updateData.observations = updateData.observations.trim()
    }

    const { data: paraclinicalExam, error } = await supabase
      .from(DB_TABLES.PARACLINICAL_EXAM)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return paraclinicalExam
  } catch (error) {
    return null
  }
}

/**
 * Get all paraclinical exams
 */

export async function getAllParaclinicalExams() {
  const { data, error } = await supabase
    .from(DB_TABLES.PARACLINICAL_EXAM)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data || []
}

/**
 * Get paraclinical exam by clinic history id
 */

export async function getParaclinicalExamByClinicHistoryId(
  clinicHistoryId: string
) {
  const { data, error } = await supabase
    .from(DB_TABLES.PARACLINICAL_EXAM)
    .select('*')
    .eq('clinic_history_id', clinicHistoryId)

  if (error) throw new Error(error.message)

  return data || []
}
