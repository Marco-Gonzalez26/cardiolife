import { describe, expect, it } from 'vitest'
import { matchesSearch, normalizeSearch } from './search'

describe('normalizeSearch', () => {
  it('quita tildes, pasa a minúsculas y compacta espacios', () => {
    expect(normalizeSearch('  María   GARCÍA ')).toBe('maria garcia')
  })
})

describe('matchesSearch', () => {
  const patient = 'María García 1712345678'

  it('no distingue tildes ni mayúsculas, en el texto ni en lo escrito', () => {
    expect(matchesSearch(patient, 'maria')).toBe(true)
    expect(matchesSearch(patient, 'MARÍA')).toBe(true)
    expect(matchesSearch('Maria Garcia', 'garcía')).toBe(true)
  })

  it('acepta varias palabras en cualquier orden', () => {
    expect(matchesSearch(patient, 'garcia maria')).toBe(true)
  })

  it('todas las palabras deben aparecer', () => {
    expect(matchesSearch(patient, 'maria lopez')).toBe(false)
  })

  it('encuentra por cédula y por fragmentos', () => {
    expect(matchesSearch(patient, '1712345678')).toBe(true)
    expect(matchesSearch(patient, 'gar')).toBe(true)
    expect(matchesSearch(patient, '17123')).toBe(true)
  })

  it('un texto vacío o solo de espacios no filtra nada', () => {
    expect(matchesSearch(patient, '')).toBe(true)
    expect(matchesSearch(patient, '   ')).toBe(true)
  })

  it('no encuentra lo que no está', () => {
    expect(matchesSearch(patient, 'atorvastatina')).toBe(false)
  })
})
