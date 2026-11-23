import type { createClient } from '@/lib/supabase/server'

type ServerClient = ReturnType<typeof createClient>

export type AppointmentPatient = {
  id: string
  names: string
  lastnames: string
  identification: string | null
  age: string | null
}

export type AppointmentWithPatient = {
  id: string
  date: string
  /** "HH:MM:SS" */
  time: string
  type: string
  status: string
  notes: string | null
  patient: AppointmentPatient
}

const SELECT =
  'id, date, time, type, status, notes, patient:patient_id!inner(id, names, lastnames, identification, age)'

/** Citas entre dos fechas "YYYY-MM-DD" (ambas incluidas). La RLS limita a los pacientes visibles. */
export async function getAppointmentsBetween(
  supabase: ServerClient,
  from: string,
  to: string
): Promise<AppointmentWithPatient[]> {
  const { data, error } = await supabase
    .from('citas')
    .select(SELECT)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as AppointmentWithPatient[]
}

/**
 * Citas de cualquier fecha, las más recientes primero, para buscarlas por texto.
 * Se filtra después con `filterAppointments`: así la búsqueda ignora tildes (en el servidor no).
 */
export async function getAppointmentsForSearch(
  supabase: ServerClient
): Promise<AppointmentWithPatient[]> {
  const { data, error } = await supabase
    .from('citas')
    .select(SELECT)
    .order('date', { ascending: false })
    .order('time', { ascending: false })
    .limit(2000)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as AppointmentWithPatient[]
}

export async function getAppointmentById(
  supabase: ServerClient,
  id: string
): Promise<AppointmentWithPatient | null> {
  const { data } = await supabase
    .from('citas')
    .select(SELECT)
    .eq('id', id)
    .maybeSingle()
  return (data as unknown as AppointmentWithPatient) ?? null
}

/** Pacientes para el selector de "Nueva cita" */
export async function getPatientOptions(
  supabase: ServerClient
): Promise<AppointmentPatient[]> {
  const { data, error } = await supabase
    .from('patient')
    .select('id, names, lastnames, identification, age')
    .order('lastnames', { ascending: true })
    .limit(500)

  if (error) throw new Error(error.message)
  return (data ?? []) as AppointmentPatient[]
}
