import { supabase } from '@/lib/supabase'
import { calculateAge } from '@/lib/validations/patient'

export interface Patient {
  id: string
  created_at: string
  names: string
  lastnames: string
  identification: string
  birthdate: Date | string
  age: string
  phoneNumber?: string
  job?: string
  email?: string
}

export interface CreatePatientData {
  names: string
  lastnames: string
  identification: string
  birthdate: string
  phoneNumber: string
  job: string
  email?: string
}

export interface UpdatePatientData extends Partial<CreatePatientData> {}

/**
 *  Create patient
 */

export async function createPatient(
  data: CreatePatientData
): Promise<Patient | null> {
  const age = calculateAge(new Date(data.birthdate))

  const { data: patient, error } = await supabase
    .from('patient')
    .insert({
      names: data.names,
      lastnames: data.lastnames,
      identification: data.identification,
      birthdate: data.birthdate,
      age: age.toString(),
      phoneNumber: data.phoneNumber || null,
      job: data.job || null,
      email: data.email || null
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return patient
}

/**
 *  Get  patient by id
 */

export async function getPatientById(id: string): Promise<Patient | null> {
  try {
    const { data, error } = await supabase
      .from('patient')
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
 *  Update patient
 */

export async function updatePatient(id: string, data: UpdatePatientData) {
  console.log('update patient', data)
  try {
    const updateData: any = { ...data }
    if (updateData.birthdate) {
      const age = calculateAge(new Date(updateData.birthdate))
      updateData.age = age.toString()
    }
    const { data: patient, error } = await supabase
      .from('patient')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return patient
  } catch (error) {
    return null
  }
}

/**
 * Get all patients
 */

export async function getAllPatients() {
  const { data, error } = await supabase
    .from('patient')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data || []
}

/**
 * Validate if identification is unique
 */

export async function validateIdentification(
  identification: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('patient')
    .select('id')
    .eq('identification', identification)
    .single()

  if (error) throw new Error(error.message)

  return data ? false : true
}
