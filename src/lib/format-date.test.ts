import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime, formatPickedDate } from './format-date'

describe('formatDate', () => {
  it('formatea una fecha sin hora sin correrla por zona horaria', () => {
    expect(formatDate('2026-10-03')).toBe('03/10/2026')
  })

  it.each([null, undefined, '', 'no es una fecha'])('devuelve vacío para %s', (value) => {
    expect(formatDate(value)).toBe('')
  })

  it('usa la hora de Ecuador (UTC-5) para fechas con hora', () => {
    // 03:00 UTC del día 3 es todavía el día 2 a las 22:00 en Ecuador
    expect(formatDate(new Date('2026-10-03T03:00:00Z'))).toBe('02/10/2026')
    expect(formatDate('2026-10-03T15:00:00Z')).toBe('03/10/2026')
  })
})

describe('formatDateTime', () => {
  it('muestra fecha y hora de Ecuador en 24 horas', () => {
    expect(formatDateTime(new Date('2026-10-03T15:30:00Z'))).toBe('03/10/2026 10:30')
  })

  it('muestra la medianoche como 00:00, no 24:00', () => {
    expect(formatDateTime(new Date('2026-10-03T05:00:00Z'))).toBe('03/10/2026 00:00')
  })

  it.each([null, undefined, '', 'basura'])('devuelve vacío para %s', (value) => {
    expect(formatDateTime(value)).toBe('')
  })
})

describe('formatPickedDate', () => {
  it('rellena día y mes con ceros', () => {
    expect(formatPickedDate(new Date(2026, 9, 3))).toBe('03/10/2026')
    expect(formatPickedDate(new Date(2026, 11, 25))).toBe('25/12/2026')
  })
})
