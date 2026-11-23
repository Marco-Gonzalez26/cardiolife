import { cookies } from 'next/headers'
import { BadgeCheck, Ban, ShieldAlert } from 'lucide-react'
import type { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatDateTime } from '@/lib/format-date'
import { createClient } from '@/lib/supabase/server'
import {
  VERIFICATION_HINT,
  getVerificationStatus,
  verificationCopy,
  type VerificationStatus
} from '@/lib/verification-copy'

export const metadata: Metadata = {
  title: 'Verificación de receta',
  robots: { index: false, follow: false }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const commonName = (subject: string | null) =>
  subject?.match(/CN=([^,]+)/)?.[1] ?? subject ?? '—'

const STATUS_ICON: Record<VerificationStatus, React.ReactNode> = {
  valid: <BadgeCheck className='mx-auto size-10 text-emerald-600' aria-hidden />,
  annulled: <Ban className='mx-auto size-10 text-red-600' aria-hidden />,
  not_found: <ShieldAlert className='mx-auto size-10 text-amber-600' aria-hidden />
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className='flex flex-col gap-0.5 border-b py-3 last:border-0 sm:flex-row sm:justify-between'>
    <dt className='text-sm text-muted-foreground'>{label}</dt>
    <dd className='break-all text-sm font-medium sm:max-w-[60%] sm:text-right'>
      {value}
    </dd>
  </div>
)

/**
 * Página pública a la que lleva el QR de la receta. Solo muestra datos mínimos
 * (sin nombre completo ni cédula del paciente) a través de la función `verify_prescription`.
 */
export default async function VerifyPrescriptionPage({
  params
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = createClient(await cookies())

  const { data } = UUID.test(groupId)
    ? await supabase.rpc('verify_prescription', { p_group_id: groupId })
    : { data: null }
  const record = data?.[0]
  const status = getVerificationStatus(record)
  const copy = verificationCopy[status]

  return (
    <main className='flex min-h-screen items-center justify-center bg-muted/40 p-4'>
      <Card className='w-full max-w-lg rounded-2xl shadow-sm'>
        <CardContent className='space-y-5 py-6'>
          <div className='space-y-2 text-center'>
            {STATUS_ICON[status]}
            <h1 className='text-xl font-semibold'>{copy.title}</h1>
            <p className='text-sm text-muted-foreground'>{copy.description}</p>
          </div>

          {record && (
            <dl>
              <Row label='Médico' value={record.doctor_name ?? '—'} />
              {record.doctor_license && (
                <Row label='Registro profesional' value={record.doctor_license} />
              )}
              <Row label='Titular de la firma' value={commonName(record.signer_subject)} />
              <Row label='Fecha de emisión' value={formatDate(record.issued_at)} />
              <Row
                label='Firmada el'
                value={`${formatDateTime(record.signed_at)} (hora de Ecuador)`}
              />
              <Row label='Paciente' value={record.patient_initials ?? '—'} />
              <Row label='Medicamentos' value={record.medications} />
              <Row label='Huella SHA-256 del PDF firmado' value={record.pdf_sha256 ?? '—'} />
            </dl>
          )}

          <p className='text-center text-xs text-muted-foreground'>
            {VERIFICATION_HINT}
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
