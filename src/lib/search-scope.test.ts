import { describe, expect, it } from 'vitest'
import { buildSearchHref, getSearchScope } from './search-scope'

describe('getSearchScope', () => {
  it.each([
    ['/dashboard', 'patients'],
    ['/dashboard/patients', 'patients'],
    ['/dashboard/patients/abc-123', 'patients'],
    ['/dashboard/patients/abc-123/evolutions/new', 'patients'],
    ['/dashboard/medications', 'medications'],
    ['/dashboard/medications/new', 'medications'],
    ['/dashboard/recipes', 'recipes'],
    ['/dashboard/recipes/abc/edit', 'recipes'],
    ['/dashboard/evolutions', 'evolutions'],
    ['/dashboard/clinic-history', 'histories'],
    ['/dashboard/appointments', 'appointments'],
    ['/dashboard/settings', 'patients']
  ])('%s busca en %s', (pathname, entity) => {
    expect(getSearchScope(pathname).entity).toBe(entity)
  })

  it('no confunde rutas que solo empiezan igual', () => {
    expect(getSearchScope('/dashboard/medicationsx').entity).toBe('patients')
  })

  it('cada entidad tiene su propio rótulo, para que se sepa qué se busca', () => {
    const placeholders = [
      '/dashboard',
      '/dashboard/medications',
      '/dashboard/recipes',
      '/dashboard/evolutions',
      '/dashboard/clinic-history',
      '/dashboard/appointments'
    ].map((pathname) => getSearchScope(pathname).placeholder)
    expect(new Set(placeholders).size).toBe(placeholders.length)
    expect(getSearchScope('/dashboard/medications').placeholder).toMatch(/medicamento/i)
    expect(getSearchScope('/dashboard/appointments').placeholder).toMatch(/cita/i)
  })
})

describe('buildSearchHref', () => {
  it('lleva a la lista de la entidad con el texto en ?q=', () => {
    const scope = getSearchScope('/dashboard/medications')
    expect(buildSearchHref(scope, 'losartán')).toBe(
      '/dashboard/medications?q=losart%C3%A1n'
    )
  })

  it('recorta espacios y, sin texto, va a la lista sin filtro', () => {
    const scope = getSearchScope('/dashboard/recipes')
    expect(buildSearchHref(scope, '  ')).toBe('/dashboard/recipes')
    expect(buildSearchHref(scope, ' ana ')).toBe('/dashboard/recipes?q=ana')
  })

  it('codifica espacios y caracteres especiales', () => {
    const scope = getSearchScope('/dashboard/patients')
    expect(buildSearchHref(scope, 'maría & lópez')).toBe(
      '/dashboard/patients?q=mar%C3%ADa%20%26%20l%C3%B3pez'
    )
  })
})
