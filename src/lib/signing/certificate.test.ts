import forge from 'node-forge'
import { beforeAll, describe, expect, it } from 'vitest'
import { CertificateError, readP12 } from './certificate'

const PASSWORD = 'clave-de-prueba'

/** Certificado autofirmado de prueba, empaquetado como .p12 (no es un certificado real) */
const buildP12 = (options: { includeKey: boolean }): Buffer => {
  const keys = forge.pki.rsa.generateKeyPair({ bits: 1024 })
  const cert = forge.pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = '01'
  cert.validity.notBefore = new Date('2026-01-01T00:00:00Z')
  cert.validity.notAfter = new Date('2027-01-01T00:00:00Z')
  const attributes = [
    { name: 'commonName', value: 'DOCTOR DE PRUEBA' },
    { name: 'countryName', value: 'EC' }
  ]
  cert.setSubject(attributes)
  cert.setIssuer(attributes)
  cert.sign(keys.privateKey, forge.md.sha256.create())

  const asn1 = forge.pkcs12.toPkcs12Asn1(
    options.includeKey ? keys.privateKey : null,
    [cert],
    PASSWORD,
    { algorithm: '3des' }
  )
  return Buffer.from(forge.asn1.toDer(asn1).getBytes(), 'binary')
}

describe('readP12', () => {
  let withKey: Buffer
  let withoutKey: Buffer

  beforeAll(() => {
    withKey = buildP12({ includeKey: true })
    withoutKey = buildP12({ includeKey: false })
  })

  it('lee los datos del titular del certificado', () => {
    const info = readP12(withKey, PASSWORD)
    expect(info.commonName).toBe('DOCTOR DE PRUEBA')
    expect(info.subject).toContain('CN=DOCTOR DE PRUEBA')
    expect(info.issuer).toContain('C=EC')
    expect(info.validFrom.toISOString()).toBe('2026-01-01T00:00:00.000Z')
    expect(info.validTo.toISOString()).toBe('2027-01-01T00:00:00.000Z')
    expect(info.fingerprintSha256).toMatch(/^[0-9a-f]{64}$/)
  })

  it('avisa si la contraseña es incorrecta', () => {
    expect(() => readP12(withKey, 'otra-clave')).toThrow(
      new CertificateError('La contraseña del certificado es incorrecta.')
    )
  })

  it('avisa si el archivo no es un .p12', () => {
    expect(() => readP12(Buffer.from('esto no es un certificado'), PASSWORD)).toThrow(
      new CertificateError('El archivo no es un certificado .p12 válido.')
    )
  })

  it('rechaza un certificado sin clave privada', () => {
    expect(() => readP12(withoutKey, PASSWORD)).toThrow(
      new CertificateError('El archivo no contiene un certificado con su clave privada.')
    )
  })
})
