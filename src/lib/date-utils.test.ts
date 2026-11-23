import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  addDays,
  addMonths,
  getMonthGrid,
  getWeekStart,
  isoToDate,
  nowInClinic
} from './date-utils'

describe('addDays', () => {
  it.each([
    ['2026-02-28', 1, '2026-03-01'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2026-03-01', -1, '2026-02-28'],
    ['2028-02-28', 1, '2028-02-29'], // año bisiesto
    ['2026-10-03', 0, '2026-10-03']
  ])('%s %+i días -> %s', (iso, days, expected) => {
    expect(addDays(iso, days)).toBe(expected)
  })
})

describe('getWeekStart', () => {
  it('devuelve el lunes de la semana', () => {
    expect(getWeekStart('2026-10-03')).toBe('2026-09-28') // sábado
    expect(getWeekStart('2026-10-04')).toBe('2026-09-28') // domingo
  })

  it('un lunes se devuelve a sí mismo', () => {
    expect(getWeekStart('2026-09-28')).toBe('2026-09-28')
  })
})

describe('addMonths', () => {
  it.each([
    ['2026-12', 1, '2027-01'],
    ['2026-01', -1, '2025-12'],
    ['2026-10', 0, '2026-10'],
    ['2026-10', 14, '2027-12']
  ])('%s %+i meses -> %s', (month, months, expected) => {
    expect(addMonths(month, months)).toBe(expected)
  })
})

describe('getMonthGrid', () => {
  it('dibuja semanas completas de lunes a domingo', () => {
    const { gridStart, gridEnd, days } = getMonthGrid('2026-10')
    expect(gridStart).toBe('2026-09-28')
    expect(gridEnd).toBe('2026-11-01')
    expect(days).toHaveLength(35)
    expect(days[0]).toBe(gridStart)
    expect(days.at(-1)).toBe(gridEnd)
  })

  it('un febrero que empieza en lunes y termina en domingo ocupa justo 4 semanas', () => {
    const { gridStart, gridEnd, days } = getMonthGrid('2027-02')
    expect(gridStart).toBe('2027-02-01')
    expect(gridEnd).toBe('2027-02-28')
    expect(days).toHaveLength(28)
  })

  it('siempre devuelve días consecutivos y múltiplos de 7', () => {
    for (const month of ['2026-01', '2026-02', '2026-06', '2028-02', '2026-12']) {
      const { days } = getMonthGrid(month)
      expect(days.length % 7).toBe(0)
      days.slice(1).forEach((day, index) => expect(day).toBe(addDays(days[index], 1)))
    }
  })
})

describe('isoToDate', () => {
  it('usa el mediodía UTC para no saltar de día', () => {
    expect(isoToDate('2026-10-03').toISOString()).toBe('2026-10-03T12:00:00.000Z')
  })
})

describe('nowInClinic', () => {
  afterEach(() => vi.useRealTimers())

  it('devuelve la fecha y hora de Ecuador, no las de UTC', () => {
    vi.useFakeTimers()
    // 03:30 UTC del día 3 = 22:30 del día 2 en Ecuador
    vi.setSystemTime(new Date('2026-10-03T03:30:00Z'))
    expect(nowInClinic()).toEqual({ date: '2026-10-02', time: '22:30' })
  })
})
