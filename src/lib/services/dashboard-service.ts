import type { createClient } from '@/lib/supabase/server'

type ServerClient = ReturnType<typeof createClient>

import { CLINIC_TIME_ZONE } from '@/lib/date-utils'

export { CLINIC_TIME_ZONE }

export type PatientSummary = {
  id: string
  names: string
  lastnames: string
  risk: string | null
  status: string | null
}

export type TodayAppointment = {
  id: string
  time: string
  type: string
  status: string
  notes: string | null
  patient: PatientSummary
}

export type DraftHistory = {
  id: number
  patient_id: string
  created_at: string
  patient: Pick<PatientSummary, 'names' | 'lastnames'>
}

export type DraftEvolution = {
  id: string
  patient_id: string
  created_at: string
  patient: Pick<PatientSummary, 'names' | 'lastnames'>
}

export type PendingAppointment = {
  id: string
  date: string
  time: string
  type: string
  patient: Pick<PatientSummary, 'names' | 'lastnames'>
}

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria del consultorio */
export const getTodayISO = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: CLINIC_TIME_ZONE })

/** Citas de hoy con su paciente. La RLS de `patient` filtra lo que el usuario puede ver. */
export async function getTodayAppointments(
  supabase: ServerClient,
  today: string,
  onlyCritical = false
): Promise<TodayAppointment[]> {
  let query = supabase
    .from('citas')
    .select(
      'id, time, type, status, notes, patient:patient_id!inner(id, names, lastnames, risk, status)'
    )
    .eq('date', today)
    .order('time', { ascending: true })

  if (onlyCritical) query = query.eq('patient.risk', 'Alto')

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as TodayAppointment[]
}

/** Historias clínicas guardadas como borrador, las más recientes primero */
export async function getDraftHistories(
  supabase: ServerClient,
  limit = 5
): Promise<DraftHistory[]> {
  const { data, error } = await supabase
    .from('clinic_history')
    .select('id, patient_id, created_at, patient:patient_id!inner(names, lastnames)')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as DraftHistory[]
}

/** Evoluciones guardadas como borrador, las más recientes primero */
export async function getDraftEvolutions(
  supabase: ServerClient,
  limit = 5
): Promise<DraftEvolution[]> {
  const { data, error } = await supabase
    .from('evolution')
    .select('id, patient_id, created_at, patient:patient_id!inner(names, lastnames)')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as DraftEvolution[]
}

/** Citas solicitadas (p. ej. por el paciente desde el portal) que aún esperan confirmación */
export async function getPendingAppointments(
  supabase: ServerClient,
  today: string,
  limit = 5
): Promise<PendingAppointment[]> {
  const { data, error } = await supabase
    .from('citas')
    .select('id, date, time, type, patient:patient_id!inner(names, lastnames)')
    .eq('status', 'Pendiente')
    .gte('date', today)
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as PendingAppointment[]
}

/** Pacientes marcados con riesgo alto */
export async function getHighRiskPatients(
  supabase: ServerClient,
  limit = 5
): Promise<PatientSummary[]> {
  const { data, error } = await supabase
    .from('patient')
    .select('id, names, lastnames, risk, status')
    .eq('risk', 'Alto')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as PatientSummary[]
}
