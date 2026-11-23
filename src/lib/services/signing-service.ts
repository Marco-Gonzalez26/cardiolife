import type { createClient } from '@/lib/supabase/server'

type ServerClient = ReturnType<typeof createClient>

export type SigningCertificateInfo = {
  subject: string
  issuer: string
  serialNumber: string | null
  validFrom: string
  validTo: string
  fingerprintSha256: string
  uploadedAt: string
}

/** Datos públicos del certificado del médico (nunca el archivo cifrado) */
export async function getSigningCertificateInfo(
  supabase: ServerClient
): Promise<SigningCertificateInfo | null> {
  const { data } = await supabase
    .from('doctor_signing_certificate')
    .select(
      'subject, issuer, serial_number, valid_from, valid_to, fingerprint_sha256, uploaded_at'
    )
    .maybeSingle()

  if (!data) return null
  return {
    subject: data.subject,
    issuer: data.issuer,
    serialNumber: data.serial_number,
    validFrom: data.valid_from,
    validTo: data.valid_to,
    fingerprintSha256: data.fingerprint_sha256,
    uploadedAt: data.uploaded_at
  }
}
