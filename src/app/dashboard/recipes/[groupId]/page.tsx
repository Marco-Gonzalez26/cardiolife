import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Download,
  ExternalLink,
  Pencil
} from 'lucide-react'
import { deletePrescription } from '@/actions/prescriptions'
import { AppSection } from '@/components/app-section'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { AnnulDialog } from '@/components/signing/annul-dialog'
import { SignDialog } from '@/components/signing/sign-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { getPrescriptionGroup } from '@/lib/services/prescriptions-service'
import { getSigningCertificateInfo } from '@/lib/services/signing-service'
import {
  readRememberedPassword,
  sessionIdOf
} from '@/lib/signing/password-session'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/format-date'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const formatDate = (iso: string) => {
  const [year, month, day] = iso.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

const commonName = (subject: string) => subject.match(/CN=([^,]+)/)?.[1] ?? subject

const STATUS_STYLES: Record<string, string> = {
  Firmada: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
  Anulada: 'bg-red-100 text-red-800 hover:bg-red-100',
  Activa: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
}

export default async function RecipePage({
  params
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  if (!UUID.test(groupId)) notFound()

  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [recipe, context] = await Promise.all([
    getPrescriptionGroup(supabase, groupId),
    getDoctorContext(supabase)
  ])
  if (!recipe) notFound()

  const isDoctor = context?.role === 'doctor'
  const certificate = isDoctor ? await getSigningCertificateInfo(supabase) : null
  const passwordRemembered =
    isDoctor &&
    Boolean(
      await readRememberedPassword(
        claims.claims.sub,
        sessionIdOf(claims.claims)
      )
    )
  const signed = Boolean(recipe.signedAt)
  const annulled = recipe.status === 'Anulada'
  const pdfUrl = `/api/pdf/prescription/${groupId}`
  const fullName = `${recipe.patient.names} ${recipe.patient.lastnames}`

  return (
    <AppSection>
      <div className='w-full space-y-6'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <Button asChild variant='ghost' className='-ml-3'>
            <Link href='/dashboard/recipes'>
              <ArrowLeft />
              Volver a recetas
            </Link>
          </Button>
          <div className='flex flex-wrap items-center gap-2'>
            <Button asChild variant='outline' className='gap-2 font-semibold'>
              <a href={pdfUrl} target='_blank' rel='noreferrer'>
                <ExternalLink className='size-4' />
                Abrir / Imprimir
              </a>
            </Button>
            <Button asChild variant={signed ? 'default' : 'outline'} className='gap-2 font-semibold'>
              <a href={`${pdfUrl}?download=1`}>
                <Download className='size-4' />
                {signed ? 'Descargar PDF firmado' : 'Descargar PDF'}
              </a>
            </Button>

            {isDoctor && !signed && (
              <>
                <SignDialog
                  groupId={groupId}
                  patientName={fullName}
                  hasCertificate={Boolean(certificate)}
                  passwordRemembered={passwordRemembered}
                />
                <Button asChild variant='outline' className='gap-2 font-semibold'>
                  <Link href={`/dashboard/recipes/${groupId}/edit`}>
                    <Pencil className='size-4' />
                    Editar
                  </Link>
                </Button>
                <ConfirmDeleteDialog
                  title='Eliminar receta'
                  successMessage='Receta eliminada'
                  redirectTo='/dashboard/recipes'
                  description={
                    <>
                      Se eliminará la receta de <strong>{fullName}</strong>. Esta
                      acción no se puede deshacer.
                    </>
                  }
                  onConfirm={deletePrescription.bind(null, groupId)}
                />
              </>
            )}
            {isDoctor && signed && !annulled && <AnnulDialog groupId={groupId} />}
          </div>
        </div>

        <div className='space-y-1'>
          <div className='flex flex-wrap items-center gap-3'>
            <h1 className='text-3xl font-bold tracking-tight'>Receta médica</h1>
            <Badge
              className={`border-transparent ${STATUS_STYLES[recipe.status] ?? STATUS_STYLES.Activa}`}>
              {recipe.status === 'Activa' ? 'Sin firmar' : recipe.status}
            </Badge>
          </div>
          <p className='text-muted-foreground'>
            <Link
              href={`/dashboard/patients/${recipe.patient.id}`}
              className='font-medium text-foreground hover:text-primary'>
              {fullName}
            </Link>
            {recipe.patient.identification && ` · ${recipe.patient.identification}`}
            {' · '}Emitida el {formatDate(recipe.issuedAt)}
          </p>
          {recipe.diagnosis && (
            <p className='text-sm text-muted-foreground'>
              Diagnóstico: {recipe.diagnosis}
              {recipe.diagnosisCode && ` (CIE-10: ${recipe.diagnosisCode})`}
            </p>
          )}
        </div>

        {annulled && (
          <p className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
            <Ban className='size-4 shrink-0' />
            Esta receta fue anulada y no debe dispensarse.
          </p>
        )}
        {signed && recipe.signedAt && (
          <p className='flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900'>
            <BadgeCheck className='size-4 shrink-0' />
            Firmada electrónicamente por{' '}
            <strong>{commonName(recipe.signerSubject ?? 'el médico')}</strong> el{' '}
            {formatDateTime(recipe.signedAt)}
            . El documento no puede modificarse.
          </p>
        )}

        <div className='grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]'>
          <Card className='h-fit rounded-2xl shadow-sm'>
            <CardHeader className='border-b pb-4'>
              <CardTitle className='text-base'>
                Medicamentos ({recipe.lines.length})
              </CardTitle>
            </CardHeader>
            <CardContent className='divide-y pt-2'>
              {recipe.lines.map((line, index) => (
                <div key={line.id} className='space-y-1 py-3'>
                  <p className='font-semibold'>
                    {index + 1}.{' '}
                    {line.medication_snapshot.genericName || line.medication_snapshot.name}{' '}
                    {line.medication_snapshot.dose} {line.medication_snapshot.unit}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {line.medication_snapshot.form} · {line.quantity_amount}{' '}
                    {line.quantity_unit}
                    {line.medication_snapshot.genericName &&
                      ` · (${line.medication_snapshot.name})`}
                  </p>
                  {(line.custom_instructions ||
                    line.medication_snapshot.standardInstructions) && (
                    <p className='text-sm'>
                      {line.custom_instructions ||
                        line.medication_snapshot.standardInstructions}
                    </p>
                  )}
                  {(line.custom_frequency || line.custom_duration) && (
                    <p className='text-xs text-muted-foreground'>
                      {[
                        line.custom_frequency && `Frecuencia: ${line.custom_frequency}`,
                        line.custom_duration && `Duración: ${line.custom_duration}`
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className='gap-0 overflow-hidden rounded-2xl p-0 shadow-sm'>
            <iframe
              src={pdfUrl}
              title='Vista previa de la receta'
              className='h-[680px] w-full'
            />
          </Card>
        </div>
      </div>
    </AppSection>
  )
}
