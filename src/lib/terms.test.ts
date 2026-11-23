import { describe, expect, it } from 'vitest'
import { TERMS_UPDATED_AT, buildTerms, type TermsSection } from './terms'

const CONTACT = {
  doctorName: 'Dr. Mateo Rivera',
  email: 'consultorio@example.com',
  phone: '0999999999'
}

const textOf = (sections: TermsSection[]) =>
  sections.flatMap((section) => [section.title, ...section.paragraphs]).join('\n')

const section = (sections: TermsSection[], id: string) => {
  const found = sections.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Falta la sección ${id}`)
  return found
}

describe('buildTerms', () => {
  it('tiene once secciones con id único, para armar el índice', () => {
    const sections = buildTerms({})
    expect(sections.map((s) => s.id)).toEqual([
      'quien-ofrece',
      'que-puede-hacer',
      'emergencias',
      'su-cuenta',
      'citas',
      'recetas',
      'datos-personales',
      'su-responsabilidad',
      'disponibilidad',
      'cambios',
      'contacto'
    ])
    for (const s of sections) {
      expect(s.title.length).toBeGreaterThan(0)
      expect(s.paragraphs.length).toBeGreaterThan(0)
    }
  })

  it('sin datos del consultorio no deja huecos ni corchetes de relleno', () => {
    const text = textOf(buildTerms({}))
    expect(text).not.toMatch(/[[\]]/)
    expect(text).not.toMatch(/undefined|null/)
  })

  it('con datos, usa el nombre y el contacto reales del médico', () => {
    const sections = buildTerms(CONTACT)
    expect(section(sections, 'quien-ofrece').paragraphs.join(' ')).toContain('Dr. Mateo Rivera')
    const contact = section(sections, 'contacto').paragraphs.join(' ')
    expect(contact).toContain('consultorio@example.com')
    expect(contact).toContain('0999999999')
  })

  it('el ejercicio de derechos remite al correo si existe y, si no, al consultorio', () => {
    const withEmail = section(buildTerms(CONTACT), 'datos-personales').paragraphs.join(' ')
    expect(withEmail).toContain('escribiendo a consultorio@example.com')
    const without = section(buildTerms({}), 'datos-personales').paragraphs.join(' ')
    expect(without).toContain('comunicándose con el consultorio')
  })

  it('sin ningún dato de contacto pide comunicarse directamente con el consultorio', () => {
    expect(section(buildTerms({}), 'contacto').paragraphs.join(' ')).toContain(
      'Comuníquese directamente con el consultorio'
    )
  })

  it('las emergencias remiten al 911', () => {
    expect(section(buildTerms({}), 'emergencias').paragraphs.join(' ')).toContain('911')
  })

  it('describe lo que el portal hace de verdad: citas pendientes y verificación por QR', () => {
    const sections = buildTerms({})
    expect(section(sections, 'citas').paragraphs.join(' ')).toContain('Pendiente')
    expect(section(sections, 'recetas').paragraphs.join(' ')).toMatch(/QR/)
  })

  it('no inventa estatus oficial, versiones ni promesas que el sistema no cumple', () => {
    const text = textOf(buildTerms(CONTACT))
    expect(text).not.toMatch(/oficial|versión|24\s?\/\s?7|no los comparte/i)
  })

  it('no promete que los datos nunca se muestren a terceros: la verificación pública muestra datos mínimos', () => {
    const data = section(buildTerms({}), 'datos-personales').paragraphs.join(' ')
    expect(data).toMatch(/iniciales/i)
  })
})

describe('TERMS_UPDATED_AT', () => {
  it('está en formato DD/MM/YYYY', () => {
    expect(TERMS_UPDATED_AT).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})
