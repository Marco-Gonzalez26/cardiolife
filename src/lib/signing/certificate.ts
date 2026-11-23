import forge from 'node-forge'

export type CertificateInfo = {
  /** Nombre del titular (CN) */
  commonName: string
  /** Asunto completo, por ejemplo "CN=JUAN PEREZ, O=..., C=EC" */
  subject: string
  issuer: string
  serialNumber: string
  validFrom: Date
  validTo: Date
  fingerprintSha256: string
}

export class CertificateError extends Error {}

const describe = (attributes: forge.pki.CertificateField[]) =>
  attributes
    .map((attribute) => `${attribute.shortName ?? attribute.name}=${attribute.value}`)
    .join(', ')

/**
 * Lee un archivo .p12 / .pfx con su contraseña y devuelve los datos del certificado del titular
 * (el que tiene la clave privada). Lanza CertificateError con un mensaje entendible.
 */
export function readP12(p12: Buffer, password: string): CertificateInfo {
  let container: forge.pkcs12.Pkcs12Pfx
  try {
    const der = forge.util.createBuffer(p12.toString('binary'))
    container = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(der), false, password)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    throw new CertificateError(
      /password|mac/i.test(message)
        ? 'La contraseña del certificado es incorrecta.'
        : 'El archivo no es un certificado .p12 válido.'
    )
  }

  const certificates = (
    container.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] ?? []
  )
    .map((bag) => bag.cert)
    .filter((cert): cert is forge.pki.Certificate => Boolean(cert))

  const keyBags = [
    ...(container.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
      forge.pki.oids.pkcs8ShroudedKeyBag
    ] ?? []),
    ...(container.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag] ?? [])
  ]
  const privateKey = keyBags[0]?.key as forge.pki.rsa.PrivateKey | undefined
  if (!privateKey || certificates.length === 0) {
    throw new CertificateError(
      'El archivo no contiene un certificado con su clave privada.'
    )
  }

  // El certificado del titular es el que corresponde a la clave privada (el resto es la cadena de la entidad)
  const owner =
    certificates.find((cert) => {
      const publicKey = cert.publicKey as forge.pki.rsa.PublicKey
      return publicKey.n?.compareTo(privateKey.n) === 0
    }) ?? certificates[0]

  const fingerprint = forge.md.sha256
    .create()
    .update(forge.asn1.toDer(forge.pki.certificateToAsn1(owner)).getBytes())
    .digest()
    .toHex()

  return {
    commonName: String(owner.subject.getField('CN')?.value ?? 'Titular del certificado'),
    subject: describe(owner.subject.attributes),
    issuer: describe(owner.issuer.attributes),
    serialNumber: owner.serialNumber,
    validFrom: owner.validity.notBefore,
    validTo: owner.validity.notAfter,
    fingerprintSha256: fingerprint
  }
}
