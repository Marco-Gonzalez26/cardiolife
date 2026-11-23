/** Zona horaria del consultorio (Ecuador continental) */
export const CLINIC_TIME_ZONE = 'America/Guayaquil'

/** Suma días a una fecha "YYYY-MM-DD" (sin depender de la zona horaria local) */
export const addDays = (iso: string, days: number) => {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Lunes de la semana de una fecha "YYYY-MM-DD" */
export const getWeekStart = (iso: string) => {
  const dayOfWeek = (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7
  return addDays(iso, -dayOfWeek)
}

/** Fecha y hora actuales en el consultorio: { date: "YYYY-MM-DD", time: "HH:MM" } */
export const nowInClinic = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date())
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '00'
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`
  }
}

/** "2026-10-03" -> Date en mediodía UTC, para formatear sin saltos de día */
export const isoToDate = (iso: string) => new Date(`${iso}T12:00:00Z`)

export const formatIsoDate = (
  iso: string,
  options: Intl.DateTimeFormatOptions
) =>
  isoToDate(iso).toLocaleDateString('es-EC', { timeZone: 'UTC', ...options })

/** Suma meses a "YYYY-MM" */
export const addMonths = (month: string, months: number) => {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(Date.UTC(year, monthNumber - 1 + months, 1))
    .toISOString()
    .slice(0, 7)
}

/**
 * Días que se dibujan en el calendario de un mes: semanas completas, de lunes a domingo,
 * incluyendo los últimos días del mes anterior y los primeros del siguiente.
 */
export const getMonthGrid = (month: string) => {
  const first = `${month}-01`
  const last = addDays(`${addMonths(month, 1)}-01`, -1)
  const gridStart = getWeekStart(first)
  const gridEnd = addDays(getWeekStart(last), 6)

  const days: string[] = []
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) days.push(day)
  return { gridStart, gridEnd, days }
}
