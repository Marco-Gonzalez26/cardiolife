'use server'

import { cookies } from 'next/headers'
import { refreshDashboard } from '@/lib/revalidate'
import { createClient } from '@/lib/supabase/server'
import { nowInClinic } from '@/lib/date-utils'
import {
  APPOINTMENT_STATUSES,
  appointmentSchema,
  rescheduleSchema,
  type AppointmentInput,
  type AppointmentStatus
} from '@/lib/validations/appointment'

const NOT_SIGNED_IN = 'Su sesión expiró. Inicie sesión de nuevo.'

const getSession = async () => {
  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  return claims ? supabase : null
}

/** Código de Postgres cuando el trigger rechaza un horario ya tomado (otra persona reservó antes) */
const UNIQUE_VIOLATION = '23505'
const SLOT_TAKEN =
  'Ese horario acaba de ser ocupado por otra persona. Elija otro horario.'


/** No se agenda en el pasado (fecha y hora del consultorio) */
const isInPast = (date: string, time: string) => {
  const now = nowInClinic()
  return date < now.date || (date === now.date && time <= now.time)
}

/** Horarios ("HH:MM") ya ocupados ese día por citas no canceladas */
export async function getBusySlots(
  date: string,
  excludeId?: string
): Promise<string[]> {
  const supabase = await getSession()
  if (!supabase || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return []

  // Función SECURITY DEFINER: devuelve solo las horas, sin datos de nadie (sirve también al portal)
  const { data } = await supabase.rpc('busy_slots', {
    p_date: date,
    p_exclude: excludeId ?? null
  })
  return ((data ?? []) as { slot: string }[]).map((row) =>
    String(row.slot).slice(0, 5)
  )
}

export async function createAppointment(input: AppointmentInput) {
  const supabase = await getSession()
  if (!supabase) return { error: NOT_SIGNED_IN }

  const parsed = appointmentSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }
  const { patientId, date, time, type, notes } = parsed.data

  if (isInPast(date, time)) {
    return { error: 'No se puede agendar en una fecha u hora que ya pasó' }
  }
  if ((await getBusySlots(date)).includes(time)) {
    return { error: 'Ese horario ya está ocupado', code: 'slot_taken' as const }
  }

  const { data, error } = await supabase
    .from('citas')
    .insert({
      patient_id: patientId,
      date,
      time,
      type,
      notes: notes?.trim() || null,
      status: 'Pendiente'
    })
    .select('id')
    .single()

  if (error) {
    // La comprobación de arriba no basta si dos personas reservan a la vez: la base de datos decide
    if (error.code === UNIQUE_VIOLATION) {
      return { error: SLOT_TAKEN, code: 'slot_taken' as const }
    }
    return { error: error.message }
  }
  refreshDashboard()
  return { success: true as const, id: data.id as string }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  const supabase = await getSession()
  if (!supabase) return { error: NOT_SIGNED_IN }
  if (!APPOINTMENT_STATUSES.includes(status)) {
    return { error: 'Estado inválido' }
  }

  const { data, error } = await supabase
    .from('citas')
    .update({ status })
    .eq('id', id)
    .select('patient_id')
    .maybeSingle()

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: SLOT_TAKEN, code: 'slot_taken' as const }
    }
    return { error: error.message }
  }
  if (!data) return { error: 'No se encontró la cita o no tiene permiso' }
  refreshDashboard()
  return { success: true as const }
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  time: string
) {
  const supabase = await getSession()
  if (!supabase) return { error: NOT_SIGNED_IN }

  const parsed = rescheduleSchema.safeParse({ id, date, time })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }
  if (isInPast(date, time)) {
    return { error: 'No se puede reagendar a una fecha u hora que ya pasó' }
  }
  if ((await getBusySlots(date, id)).includes(time)) {
    return { error: 'Ese horario ya está ocupado', code: 'slot_taken' as const }
  }

  const { data, error } = await supabase
    .from('citas')
    .update({ date, time, status: 'Pendiente' })
    .eq('id', id)
    .select('patient_id')
    .maybeSingle()

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: SLOT_TAKEN, code: 'slot_taken' as const }
    }
    return { error: error.message }
  }
  if (!data) return { error: 'No se encontró la cita o no tiene permiso' }
  refreshDashboard()
  return { success: true as const }
}
