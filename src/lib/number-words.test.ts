import { describe, expect, it } from 'vitest'
import { numberToWords } from './number-words'

describe('numberToWords', () => {
  it.each([
    [0, 'cero'],
    [1, 'un'],
    [16, 'dieciséis'],
    [21, 'veintiún'],
    [30, 'treinta'],
    [31, 'treinta y un'],
    [99, 'noventa y nueve'],
    [100, 'cien'],
    [101, 'ciento un'],
    [200, 'doscientos'],
    [1000, 'mil'],
    [1001, 'mil un'],
    [2000, 'dos mil'],
    [21_000, 'veintiún mil'],
    [999_999, 'novecientos noventa y nueve mil novecientos noventa y nueve']
  ])('%i -> "%s"', (value, words) => {
    expect(numberToWords(value)).toBe(words)
  })

  it('descarta los decimales', () => {
    expect(numberToWords(3.9)).toBe('tres')
  })

  it.each([-1, 1_000_000, Number.NaN, Number.POSITIVE_INFINITY])(
    'devuelve el valor tal cual si está fuera de rango (%s)',
    (value) => {
      expect(numberToWords(value)).toBe(String(value))
    }
  )
})
