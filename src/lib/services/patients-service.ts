'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { calculateAge } from '@/lib/validations/patient'
import { DB_TABLES } from '../constants'
import { getDoctorContext } from './doctor-context'
import { refreshDashboard } from '@/lib/revalidate'
import type {
  PatientListItem,
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

  // La RLS exige que el paciente pertenezca a un médico (el propio o el de la secretaria)
  const context = await getDoctorContext(supabase)
  if (!context?.doctorId) {
    throw new Error('No se pudo determinar el médico responsable del paciente')
  }

  const { data: patient, error } = await supabase
    .from(DB_TABLES.PATIENTS)
    .insert({
      doctor_profile_id: context.doctorId,
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
  refreshDashboard()
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
    refreshDashboard()
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

/** Pacientes visibles para el usuario, con la fecha de su última historia completada */
export async function getPatientsForList(): Promise<PatientListItem[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from(DB_TABLES.PATIENTS)
    .select(
      'id, created_at, names, lastnames, identification, age, phone_number, job, risk, status, clinic_history(date, status)'
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map(({ clinic_history, ...patient }) => {
    const dates = ((clinic_history ?? []) as { date: string | null; status: string }[])
      .filter((history) => history.status === 'completed' && history.date)
      .map((history) => history.date as string)
      .sort()
    return { ...patient, last_visit: dates.at(-1) ?? null } as PatientListItem
  })
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
