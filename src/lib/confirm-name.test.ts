import { describe, expect, it } from 'vitest'
import { nameMatches } from './confirm-name'

describe('nameMatches', () => {
  it('acepta el nombre exacto', () => {
    expect(nameMatches('Losartán Potásico', 'Losartán Potásico')).toBe(true)
  })

  it('no distingue mayúsculas de minúsculas', () => {
    expect(nameMatches('Losartán Potásico', 'losartán potásico')).toBe(true)
  })

  it('ignora espacios al borde y espacios repetidos', () => {
    expect(nameMatches('Losartán Potásico', '  Losartán   Potásico ')).toBe(true)
  })

  it('exige las tildes: un medicamento distinto no debe pasar por descuido', () => {
    expect(nameMatches('Losartán', 'Losartan')).toBe(false)
  })

  it('rechaza un nombre parcial o distinto', () => {
    expect(nameMatches('Losartán Potásico', 'Losartán')).toBe(false)
    expect(nameMatches('Losartán Potásico', 'Atorvastatina')).toBe(false)
  })

  it('nunca acepta vacío, ni siquiera contra un nombre vacío', () => {
    expect(nameMatches('Losartán', '')).toBe(false)
    expect(nameMatches('Losartán', '   ')).toBe(false)
    expect(nameMatches('', '')).toBe(false)
    expect(nameMatches('   ', '   ')).toBe(false)
  })
})
