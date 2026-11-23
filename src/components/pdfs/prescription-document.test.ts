import React from 'react'
import { Image, renderToBuffer } from '@react-pdf/renderer'
import { describe, expect, it } from 'vitest'
import {
  PrescriptionDocument,
  type PrescriptionPdfData
} from './prescription-document'

type Printed = { texts: string[]; images: string[] }

/** Recorre lo que el documento va a imprimir: textos y rutas de imagen, expandiendo los componentes propios */
const printed = (node: unknown, out: Printed = { texts: [], images: [] }): Printed => {
  if (node == null || typeof node === 'boolean') return out
  if (typeof node === 'string' || typeof node === 'number') {
    out.texts.push(String(node))
    return out
  }
  if (Array.isArray(node)) {
    node.forEach((child) => printed(child, out))
    return out
  }
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: unknown; src?: unknown }>
    if (typeof element.type === 'function') {
      return printed((element.type as (props: unknown) => unknown)(element.props), out)
    }
    if ((element.type as unknown) === (Image as unknown) && typeof element.props.src === 'string') {
      out.images.push(element.props.src)
    }
    return printed(element.props.children, out)
  }
  return out
}

const QR = 'data:image/png;base64,QRQRQR'

const data = (overrides: Partial<PrescriptionPdfData> = {}): PrescriptionPdfData => ({
  doctor: {
    name: 'Dr. Mateo Rivera',
    email: 'consultorio@example.com',
    phone: '0999999999',
    specialty: 'Cardiología',
    identification: '1790012345001',
    license: 'REG-123'
  },
  patient: { name: 'María García', ci: '1712345678' },
  date: '12/12/2026',
  lines: [],
  ...overrides
})

const signed = data({
  signature: {
    signerName: 'MATEO RIVERA',
    signedAt: '12/12/2026 10:42 (hora de Ecuador)',
    qrDataUrl: QR,
    verifyUrl: 'https://cardiolife.example/verificar/abc'
  }
})

describe('firma con QR de la receta', () => {
  const { texts, images } = printed(PrescriptionDocument({ data: signed }))
  const all = texts.join('\n')

  it('muestra el QR de verificación', () => {
    expect(images).toContain(QR)
  })

  it('muestra el nombre del médico, el RUC, la especialidad y el registro profesional, en ese orden', () => {
    const last = texts.lastIndexOf('Dr. Mateo Rivera')
    expect(last).toBeGreaterThan(-1)
    expect(texts.slice(last, last + 4)).toEqual([
      'Dr. Mateo Rivera',
      'RUC: 1790012345001',
      'Cardiología',
      'Reg. profesional: REG-123'
    ])
  })

  it('sin registro profesional guardado no imprime una línea vacía', () => {
    const noLicense = printed(
      PrescriptionDocument({
        data: { ...signed, doctor: { ...signed.doctor, license: null } }
      })
    ).texts.join('\n')
    expect(noLicense).not.toMatch(/Reg\. profesional/)
  })

  it('ya no imprime el texto azul de la constancia ni el pie del QR', () => {
    expect(all).not.toMatch(/firmado electr[oó]nicamente/i)
    expect(all).not.toMatch(/Escanee/i)
    expect(all).not.toContain('MATEO RIVERA')
    expect(all).not.toContain('hora de Ecuador')
    expect(all).not.toContain('cardiolife.example/verificar')
  })

  it('el identificador del médico se rotula RUC, no CI', () => {
    expect(all).not.toMatch(/CI: 1790012345001/)
  })
})

describe('generación real del PDF', () => {
  // PNG de 1x1 píxel: react-pdf necesita una imagen válida para el QR
  const PNG_1X1 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

  it('la receta firmada con QR sale como un PDF válido de una página', async () => {
    const pdf = await renderToBuffer(
      PrescriptionDocument({
        data: { ...signed, signature: { ...signed.signature!, qrDataUrl: PNG_1X1 } }
      })
    )
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
    expect(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)).toHaveLength(1)
  })

  it('la receta sin firma electrónica también se genera', async () => {
    const pdf = await renderToBuffer(PrescriptionDocument({ data: data() }))
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
  })
})

describe('receta sin firma electrónica', () => {
  const { texts, images } = printed(PrescriptionDocument({ data: data() }))
  const all = texts.join('\n')

  it('conserva la línea para firma manuscrita y no imprime QR', () => {
    expect(all).toContain('Firma y sello')
    expect(images).toEqual([])
  })

  it('conserva sus datos de siempre: cédula y registro profesional', () => {
    expect(all).toMatch(/CI: 1790012345001/)
    expect(all).toMatch(/Reg\. profesional: REG-123/)
  })
})
