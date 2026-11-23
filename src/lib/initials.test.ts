import { describe, expect, it } from 'vitest'
import { getInitials } from './initials'

describe('getInitials', () => {
  it('toma la primera letra de cada parte, en mayúscula', () => {
    expect(getInitials('María', 'García')).toBe('MG')
  })

  it('ignora espacios sobrantes y partes vacías', () => {
    expect(getInitials('  ana  ', ' ')).toBe('A')
    expect(getInitials('', 'Pérez')).toBe('P')
  })

  it('respeta letras con tilde y la eñe', () => {
    expect(getInitials('émile', 'Zola')).toBe('ÉZ')
    expect(getInitials('ñandú', 'Pérez')).toBe('ÑP')
  })

  it('usa como máximo dos letras', () => {
    expect(getInitials('Juan', 'Carlos', 'Pérez')).toBe('JC')
  })

  it('devuelve "?" cuando no hay nada que mostrar', () => {
    expect(getInitials('', '')).toBe('?')
    expect(getInitials()).toBe('?')
  })
})
