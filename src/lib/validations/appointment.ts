import * as z from 'zod'

export const APPOINTMENT_STATUSES = [
  'Pendiente',
  'Confirmada',
  'Cancelada',
  'Atendida'
] as const
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

export const APPOINTMENT_TYPES = [
  'Primera vez',
  'Consulta General',
  'Control Mensual',
  'Consulta de Rutina',
  'Urgencia Médica'
] as const

/** Las citas no tienen duración en la base de datos: se asume un bloque fijo */
export const SLOT_MINUTES = 30
export const WORK_START_HOUR = 8
export const WORK_END_HOUR = 18
/** Almuerzo 12:00–13:00: no se ofrecen esos horarios */
const LUNCH_HOURS = [12]

/** Horarios agendables, "HH:MM" cada 30 minutos (08:00 … 17:30, sin almuerzo) */
export const APPOINTMENT_SLOTS: string[] = Array.from(
  { length: ((WORK_END_HOUR - WORK_START_HOUR) * 60) / SLOT_MINUTES },
  (_, index) => {
    const minutes = WORK_START_HOUR * 60 + index * SLOT_MINUTES
    return {
      hour: Math.floor(minutes / 60),
      label: `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
    }
  }
)
  .filter(({ hour }) => !LUNCH_HOURS.includes(hour))
  .map(({ label }) => label)

export const slotToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** "09:30" -> "09:30 AM" */
export const formatSlot = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`
}

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')
const timeField = z
  .string()
  .refine((value) => APPOINTMENT_SLOTS.includes(value), 'Horario no disponible')

export const appointmentSchema = z.object({
  patientId: z.uuid('Seleccione un paciente'),
  date: dateField,
  time: timeField,
  type: z.enum(APPOINTMENT_TYPES, 'Seleccione el tipo de consulta'),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional()
})

export const rescheduleSchema = z.object({
  id: z.uuid(),
  date: dateField,
  time: timeField
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
