import { describe, expect, it } from 'vitest'
import {
  ACCOUNT_HREF,
  HISTORY_TABS,
  PORTAL_LINKS,
  getActivePortalHref,
  isPathWithin
} from './portal-nav'

describe('PORTAL_LINKS', () => {
  it('tiene solo cuatro destinos, que caben en una línea', () => {
    expect(PORTAL_LINKS.map((link) => link.label)).toEqual([
      'Inicio',
      'Citas',
      'Historia',
      'Recetas'
    ])
  })

  it('la cuenta vive en el menú, no en la barra', () => {
    expect(PORTAL_LINKS.some((link) => link.href === ACCOUNT_HREF)).toBe(false)
  })
})

describe('getActivePortalHref', () => {
  it.each([
    ['/portal', '/portal'],
    ['/portal/citas', '/portal/citas'],
    ['/portal/citas/nueva', '/portal/citas'],
    ['/portal/historia', '/portal/historia'],
    ['/portal/recetas', '/portal/recetas']
  ])('%s marca %s', (pathname, expected) => {
    expect(getActivePortalHref(pathname)).toBe(expected)
  })

  it('Evoluciones vive dentro de Historia: marca Historia', () => {
    expect(getActivePortalHref('/portal/evoluciones')).toBe('/portal/historia')
    expect(getActivePortalHref('/portal/evoluciones/abc-123')).toBe('/portal/historia')
  })

  it('Inicio solo se marca en la ruta exacta', () => {
    expect(getActivePortalHref('/portal/recetas')).not.toBe('/portal')
  })

  it('no confunde rutas que solo empiezan igual', () => {
    expect(getActivePortalHref('/portal/historia-vieja')).toBeNull()
    expect(getActivePortalHref('/portal/citasx')).toBeNull()
  })

  it('Mi cuenta y rutas ajenas no marcan ningún destino', () => {
    expect(getActivePortalHref(ACCOUNT_HREF)).toBeNull()
    expect(getActivePortalHref('/dashboard')).toBeNull()
  })
})

describe('isPathWithin', () => {
  it('acepta la ruta exacta y sus hijas, no las vecinas', () => {
    expect(isPathWithin('/portal/historia', '/portal/historia')).toBe(true)
    expect(isPathWithin('/portal/historia/1', '/portal/historia')).toBe(true)
    expect(isPathWithin('/portal/historiax', '/portal/historia')).toBe(false)
  })
})

describe('HISTORY_TABS', () => {
  it('permite llegar a Evoluciones desde Historia', () => {
    expect(HISTORY_TABS.map((tab) => tab.href)).toEqual([
      '/portal/historia',
      '/portal/evoluciones'
    ])
  })
})
