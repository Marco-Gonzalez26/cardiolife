import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AppSection } from '@/components/app-section'
import { EvolutionEditor } from '@/components/evolution-editor'
import { PatientNotFound } from '@/components/patient-not-found'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { createClient } from '@/lib/supabase/server'
import { EMPTY_EVOLUTION } from '@/lib/validations/evolution'

const Notice = ({
  title,
  children,
  href,
  action
}: {
  title: string
  children: React.ReactNode
  href: string
  action: string
}) => (
  <AppSection>
    <Card className='mx-auto w-full max-w-xl rounded-2xl shadow-sm'>
      <CardContent className='space-y-4 py-4 text-center'>
        <h1 className='text-xl font-semibold'>{title}</h1>
        <p className='text-muted-foreground'>{children}</p>
        <Button asChild>
          <Link href={href}>{action}</Link>
        </Button>
      </CardContent>
    </Card>
  </AppSection>
)

export default async function NewEvolutionPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [context, { data: patient }, { data: history }] = await Promise.all([
    getDoctorContext(supabase),
    supabase
      .from('patient')
      .select(
        'id, names, lastnames, identification, age, birthdate, blood_type, status'
      )
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('clinic_history')
      .select('id')
      .eq('patient_id', id)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle()
  ])

  if (!patient) return <PatientNotFound />

  if (!context?.role) redirect('/dashboard')

  if (!history) {
    return (
      <Notice
        title='Falta la historia clínica'
        href={`/dashboard/patients/${id}/clinic-history/new`}
        action='Ir a la historia clínica'>
        {patient.names} {patient.lastnames} aún no tiene una historia clínica
        completada. Complétala antes de registrar evoluciones.
      </Notice>
    )
  }

  return (
    <EvolutionEditor
      patientId={id}
      patient={patient}
      mode='create'
      defaultValues={EMPTY_EVOLUTION}
      canComplete={context.role === 'doctor'}
    />
  )
}
