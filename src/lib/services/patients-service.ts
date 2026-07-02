'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { calculateAge } from '@/lib/validations/patient'
import { DB_TABLES } from '../constants'
import type {
  Patient,
  CreatePatientData,
  UpdatePatientData
} from '@/types/patient'

const getSupabase = async () => {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

export async function createPatient(
  data: CreatePatientData
): Promise<Patient | null> {
  const supabase = await getSupabase()
  const age = calculateAge(new Date(data.birthdate))

  const { data: patient, error } = await supabase
    .from(DB_TABLES.PATIENTS)
    .insert({
      names: data.names,
      lastnames: data.lastnames,
      identification: data.identification,
      birthdate: data.birthdate,
      age: age.toString(),
      phone_number: data.phone_number || null,
      job: data.job || null,
      email: data.email || null
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return patient
}

export async function getPatientById(id: string): Promise<Patient | null> {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from(DB_TABLES.PATIENTS)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data
  } catch {
    return null
  }
}

export async function updatePatient(id: string, data: UpdatePatientData) {
  try {
    const supabase = await getSupabase()
    const updateData: any = { ...data }

    if (updateData.birthdate) {
      updateData.age = calculateAge(new Date(updateData.birthdate)).toString()
    }

    const { data: patient, error } = await supabase
      .from(DB_TABLES.PATIENTS)
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(error.message)
    return { patient, error: null }
  } catch (error) {
    return {
      patient: null,
      error: error instanceof Error ? error.message : 'Error al actualizar'
    }
  }
}

export async function getAllPatients() {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from(DB_TABLES.PATIENTS)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function validateIdentification(
  identification: string
): Promise<boolean> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from(DB_TABLES.PATIENTS)
    .select('id')
    .eq('identification', identification)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data === null
}
