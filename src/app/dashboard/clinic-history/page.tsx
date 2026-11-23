import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppSection } from '@/components/app-section'
import { PatientPickerDialog } from '@/components/patient-picker-dialog'
import { Card } from '@/components/ui/card'
import { getPatientOptions } from '@/lib/services/appointments-service'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { getClinicHistoryList } from '@/lib/services/records-service'
import { createClient } from '@/lib/supabase/server'
import { HistoriesTable } from './histories-table'

export default async function ClinicHistoriesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [histories, patients, context] = await Promise.all([
    getClinicHistoryList(supabase),
    getPatientOptions(supabase),
    getDoctorContext(supabase)
  ])
  const drafts = histories.filter((history) => history.status === 'draft').length

  return (
    <AppSection>
      <div className='w-full space-y-6'>
        <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Historias Clínicas
            </h1>
            <p className='mt-1 text-muted-foreground'>
              Todas las historias de tus pacientes
              {drafts > 0 && ` · ${drafts} en borrador pendientes de completar`}.
            </p>
          </div>
          <PatientPickerDialog
            patients={patients}
            buttonLabel='Nueva historia'
            title='Nueva historia clínica'
            hrefTemplate='/dashboard/patients/{id}/clinic-history/new'
          />
        </div>
        <Card className='gap-0 overflow-hidden rounded-2xl p-0 shadow-sm'>
          <HistoriesTable
            key={q ?? ''}
            initialSearch={q}
            data={histories}
            isDoctor={context?.role === 'doctor'}
            userId={context?.userId ?? ''}
          />
        </Card>
      </div>
    </AppSection>
  )
}
