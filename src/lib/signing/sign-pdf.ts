import { plainAddPlaceholder } from '@signpdf/placeholder-plain'
import { P12Signer } from '@signpdf/signer-p12'
import signpdf from '@signpdf/signpdf'

export type SignOptions = {
  /** Motivo que queda registrado dentro de la firma */
  reason: string
  /** Nombre del firmante */
  name: string
  contactInfo?: string
  location?: string
}

/**
 * Firma un PDF con un certificado .p12 (firma PAdES/PKCS#7 desprendida). Se agrega un campo de firma
 * invisible: la constancia visible ya va impresa en el documento antes de firmarlo.
 * La firma cubre TODO el documento; si alguien lo modifica después, los lectores de PDF lo detectan.
 */
export async function signPdf(
  pdf: Buffer,
  p12: Buffer,
  password: string,
  options: SignOptions
): Promise<Buffer> {
  const withPlaceholder = plainAddPlaceholder({
    pdfBuffer: pdf,
    reason: options.reason,
    name: options.name,
    contactInfo: options.contactInfo ?? '',
    location: options.location ?? '',
    // Espacio reservado para la firma: holgado para certificados con cadena completa
    signatureLength: 16384
  })

  const signer = new P12Signer(p12, { passphrase: password })
  return signpdf.sign(withPlaceholder, signer)
}
