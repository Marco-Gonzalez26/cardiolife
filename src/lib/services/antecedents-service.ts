/* eslint-disable @typescript-eslint/no-explicit-any */
import { AntecedentsFormData } from '../validations/clinic-history'
import { supabase } from '@/lib/supabase'

interface JsonData {
  status: boolean
  details?: string
}
export interface Antecedents {
  id: string
  created_at: string
  currentDisease?: string
  hta?: JsonData
  cigarette?: JsonData
  exercise?: JsonData
  religion?: JsonData
  alcohol?: JsonData
  stroke?: JsonData
  syncope?: JsonData
  diabetes?: JsonData
  cancer?: JsonData
  surgeries?: JsonData
  heartDisease?: JsonData
  dyslipidemia?: JsonData
  thyroidDisease?: JsonData
  alergies?: JsonData
  covid?: JsonData
  father?: JsonData
  mother?: JsonData
  gastricDisease?: JsonData
  neuropathy?: JsonData
  cardiovascularDisease?: JsonData
  cardiac?: JsonData
  kidneyDisease?: JsonData
  drugs?: JsonData
}

export interface CreateAntecedentsData {
  currentDisease?: string
  hta?: JsonData
  cigarette?: JsonData
  exercise?: JsonData
  religion?: JsonData
  alcohol?: JsonData
  stroke?: JsonData
  syncope?: JsonData
  diabetes?: JsonData
  cancer?: JsonData
  surgeries?: JsonData
  heartDisease?: JsonData
  dyslipidemia?: JsonData
  thyroidDisease?: JsonData
  alergies?: JsonData
  covid?: JsonData
  father?: JsonData
  mother?: JsonData
  gastricDisease?: JsonData
  neuropathy?: JsonData
  cardiovascularDisease?: JsonData
  cardiac?: JsonData
  kidneyDisease?: JsonData
  drugs?: JsonData
}

export type UpdateAntecedentsData = Partial<CreateAntecedentsData>

/**
 *  Create antecedents
 */

export async function createAntecedents(
  data: CreateAntecedentsData
): Promise<Antecedents | null> {
  const { data: antecedents, error } = await supabase
    .from('antecedents')
    .insert({
      current_disease: data.currentDisease || null,
      hta: data.hta || null,
      cigarette: data.cigarette || null,
      exercise: data.exercise || null,
      religion: data.religion || null,
      alcohol: data.alcohol || null,
      stroke: data.stroke || null,
      syncope: data.syncope || null,
      diabetes: data.diabetes || null,
      cancer: data.cancer || null,
      surgeries: data.surgeries || null,
      heart_disease: data.heartDisease || null,
      dyslipidemia: data.dyslipidemia || null,
      thyroid_disease: data.thyroidDisease || null,
      alergies: data.alergies || null,
      covid: data.covid || null,
      father: data.father || null,
      mother: data.mother || null,
      gastric_disease: data.gastricDisease || null,
      neuropathy: data.neuropathy || null,
      cardiovascular_disease: data.cardiovascularDisease || null,
      cardiac: data.cardiac || null,
      kidney_disease: data.kidneyDisease || null,
      drugs: data.drugs || null
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return antecedents
}

/**
 *  Get  antecedents by id
 */

export async function getAntecedentsById(
  id: string
): Promise<Antecedents | null> {
  try {
    const { data, error } = await supabase
      .from('antecedents')
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
 *  Update antecedents
 */

export async function updateAntecedents(
  id: string,
  data: UpdateAntecedentsData
) {
  console.log('update antecedents', data)
  try {
    const updateData: any = { ...data }
    if (updateData.currentDisease) {
      updateData.currentDisease = updateData.currentDisease.trim()
    }
    const { data: antecedents, error } = await supabase
      .from('antecedents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return antecedents
  } catch (error) {
    return null
  }
}

/**
 * Get all antecedents
 */

export async function getAllAntecedents() {
  const { data, error } = await supabase
    .from('antecedents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data || []
}

/**
 * Get antecedents by clinic history id
 */

export async function getAntecedentsByClinicHistoryId(clinicHistoryId: string) {
  const { data, error } = await supabase
    .from('antecedents')
    .select('*')
    .eq('clinic_history_id', clinicHistoryId)

  if (error) throw new Error(error.message)

  return data || []
}
