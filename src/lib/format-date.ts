const CLINIC_TIME_ZONE = 'America/Guayaquil'

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

const pad = (value: number | string) => String(value).padStart(2, '0')

/** Partes (día, mes, año, hora, minuto) en la zona horaria del consultorio */
const clinicParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return {
    day: get('day'),
    month: get('month'),
    year: get('year'),
    hour: get('hour'),
    minute: get('minute')
  }
}

/**
 * Fecha en formato de Ecuador: DD/MM/YYYY.
 * Acepta "YYYY-MM-DD" (fecha sin hora: no se corre por zona horaria), un ISO con hora o un Date.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') {
    const match = ISO_DATE.exec(value)
    if (match) return `${match[3]}/${match[2]}/${match[1]}`
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const { day, month, year } = clinicParts(date)
  return `${day}/${month}/${year}`
}

/** Fecha y hora: DD/MM/YYYY HH:mm (hora de Ecuador, 24 h) */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const { day, month, year, hour, minute } = clinicParts(date)
  return `${day}/${month}/${year} ${hour}:${minute}`
}

/** "DD/MM/YYYY" a partir de un Date elegido en un calendario (usa los valores locales del navegador) */
export const formatPickedDate = (date: Date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
