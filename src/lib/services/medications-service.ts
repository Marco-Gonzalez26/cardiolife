import { supabase } from '@/lib/supabase'
import { DB_TABLES } from '../constants'


export interface MedicationCategoryInterface {
  id: string
  name: string
  description: string
  display_order: number
  active: boolean
  created_by: string
  updated_by: string
}

export interface MedicationInterface {
  id: string
  name: string
  genericname: string
  category: MedicationCategoryInterface
  requiresmonitoring: boolean
  notes: string
  warnings: string
  active: boolean
  created_by: string
  updated_by: string
  categoryid: string
}

export interface CreateMedicationData {
  name: string
  genericname: string
  category: string
  requiresmonitoring: boolean
  notes: string
  warnings: string
  active: boolean
}

export type UpdateMedicationData = Partial<CreateMedicationData>

/**
 *  Create medication
 */

export async function createMedication(
  data: CreateMedicationData
): Promise<MedicationInterface | null> {
  const { data: medication, error } = await supabase
    .from(DB_TABLES.MEDICATIONS)
    .insert({
      name: data.name,
      generic_name: data.genericname,
      category: data.category,
      requires_monitoring: data.requiresmonitoring,
      notes: data.notes,
      warnings: data.warnings,
      active: data.active
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return medication
}

/**
 *  Get  medication by id
 */

export async function getMedicationById(
  id: string
): Promise<MedicationInterface | null> {
  try {
    const { data, error } = await supabase
      .from(DB_TABLES.MEDICATIONS)
      .select('*, medication_categories(*)')
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)

    return data
  } catch (error) {
    return null
  }
}

/**
 *  Update medication
 */

export async function updateMedication(id: string, data: UpdateMedicationData) {
  console.log('update medication', data)
  try {
    const updateData: any = { ...data }
    if (updateData.name) {
      updateData.name = updateData.name.trim()
    }
    if (updateData.genericname) {
      updateData.genericname = updateData.genericname.trim()
    }
    if (updateData.category) {
      updateData.category = updateData.category.trim()
    }
    if (updateData.notes) {
      updateData.notes = updateData.notes.trim()
    }
    if (updateData.warnings) {
      updateData.warnings = updateData.warnings.trim()
    }
    const { data: medication, error } = await supabase
      .from(DB_TABLES.MEDICATIONS)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return medication
  } catch (error) {
    return null
  }
}

/**
 * Get all medications
 */

export async function getAllMedications() {
  const { data, error } = await supabase
    .from(DB_TABLES.MEDICATIONS)
    .select('*, medication_categories(*)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data || []
}

/**
 * Get medication by category id
 */

export async function getMedicationsByCategoryId(categoryId: string) {
  const { data, error } = await supabase
    .from('medications')
    .select('*, category(*)')
    .eq('category_id', categoryId)

  if (error) throw new Error(error.message)

  return data || []
}
