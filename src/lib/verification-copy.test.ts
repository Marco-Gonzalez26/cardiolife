import { describe, expect, it } from 'vitest'
import {
  VERIFICATION_HINT,
  getVerificationStatus,
  verificationCopy
} from './verification-copy'

describe('getVerificationStatus', () => {
  it('sin registro, la receta no se encuentra', () => {
    expect(getVerificationStatus(null)).toBe('not_found')
    expect(getVerificationStatus(undefined)).toBe('not_found')
  })

  it('una receta anulada se distingue de una firmada', () => {
    expect(getVerificationStatus({ status: 'Anulada' })).toBe('annulled')
    expect(getVerificationStatus({ status: 'Firmada' })).toBe('valid')
  })
})

describe('verificationCopy', () => {
  it('cada estado tiene título y explicación', () => {
    for (const status of ['valid', 'annulled', 'not_found'] as const) {
      expect(verificationCopy[status].title.length).toBeGreaterThan(0)
      expect(verificationCopy[status].description.length).toBeGreaterThan(0)
    }
  })

  it('no afirma "auténtica" ni "vigente": la validez de la firma se comprueba en el PDF', () => {
    const all = [
      ...Object.values(verificationCopy).flatMap((c) => [c.title, c.description]),
      VERIFICATION_HINT
    ].join(' ')
    expect(all).not.toMatch(/aut[eé]ntic|vigente/i)
  })

  it('una receta anulada dice claramente que no debe dispensarse', () => {
    expect(verificationCopy.annulled.description).toMatch(/no debe dispensarse/i)
  })

  it('una receta firmada remite al PDF para comprobar la firma', () => {
    expect(verificationCopy.valid.description).toMatch(/PDF/)
  })

  it('trata al lector de usted', () => {
    expect(verificationCopy.not_found.description).toMatch(/Si tiene el documento/)
    expect(VERIFICATION_HINT).toMatch(/\babra\b/)
  })
})
