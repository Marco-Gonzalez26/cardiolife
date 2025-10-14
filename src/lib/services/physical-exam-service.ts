/* eslint-disable @typescript-eslint/no-explicit-any */

import { PhysicalExamFormData } from '../validations/clinic-history'
import { supabase } from '@/lib/supabase'

export interface PhysicalExam {
  id: string
  created_at: string
  systolicBp?: string
  dyastolicBp?: string
  heartRate?: string
  respiratoryRate?: string
  weight?: string
  height?: string
  imc?: string
  findings?: string
}

export interface CreatePhysicalExamData {
  systolicBp?: string
  dyastolicBp?: string
  heartRate?: string
  respiratoryRate?: string
  weight?: string
  height?: string
  imc?: string
  findings?: string
}

export type UpdatePhysicalExamData = Partial<CreatePhysicalExamData>

/**
 *  Create physical exam
 */

export async function createPhysicalExam(
  data: CreatePhysicalExamData
): Promise<PhysicalExam | null> {
  const { data: physicalExam, error } = await supabase
    .from('physicalExam')
    .insert({
      systolicBp: data.systolicBp || null,
      dyastolicBp: data.dyastolicBp || null,
      heartRate: data.heartRate || null,
      respiratoryRate: data.respiratoryRate || null,
      weight: data.weight || null,
      height: data.height || null,
      imc: data.imc || null,
      findings: data.findings || null
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return physicalExam
}

/**
 *  Get  physical exam by id
 */

export async function getPhysicalExamById(
  id: string
): Promise<PhysicalExam | null> {
  try {
    const { data, error } = await supabase
      .from('physicalExam')
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
 *  Update physical exam
 */

export async function updatePhysicalExam(
  id: string,
  data: UpdatePhysicalExamData
) {
  console.log('update physical exam', data)
  try {
    const updateData: any = { ...data }
    if (updateData.systolicBp) {
      updateData.systolicBp = updateData.systolicBp.trim()
    }
    if (updateData.dyastolicBp) {
      updateData.dyastolicBp = updateData.dyastolicBp.trim()
    }
    if (updateData.heartRate) {
      updateData.heartRate = updateData.heartRate.trim()
    }
    if (updateData.respiratoryRate) {
      updateData.respiratoryRate = updateData.respiratoryRate.trim()
    }
    if (updateData.weight) {
      updateData.weight = updateData.weight.trim()
    }
    if (updateData.height) {
      updateData.height = updateData.height.trim()
    }
    if (updateData.imc) {
      updateData.imc = updateData.imc.trim()
    }
    if (updateData.findings) {
      updateData.findings = updateData.findings.trim()
    }
    const { data: physicalExam, error } = await supabase
      .from('physicalExam')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return physicalExam
  } catch (error) {
    return null
  }
}

/**
 * Get all physical exams
 */

export async function getAllPhysicalExams() {
  const { data, error } = await supabase
    .from('physicalExam')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data || []
}

/**
 * Get physical exam by clinic history id
 */

export async function getPhysicalExamByClinicHistoryId(
  clinicHistoryId: string
) {
  const { data, error } = await supabase
    .from('physicalExam')
    .select('*')
    .eq('clinic_history_id', clinicHistoryId)

  if (error) throw new Error(error.message)

  return data || []
}
