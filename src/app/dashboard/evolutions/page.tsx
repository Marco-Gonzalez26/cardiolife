import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppSection } from '@/components/app-section'
import { PatientPickerDialog } from '@/components/patient-picker-dialog'
import { Card } from '@/components/ui/card'
import { getPatientOptions } from '@/lib/services/appointments-service'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { getEvolutionList } from '@/lib/services/records-service'
import { createClient } from '@/lib/supabase/server'
import { EvolutionsTable } from './evolutions-table'

export default async function EvolutionsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [evolutions, patients, context] = await Promise.all([
    getEvolutionList(supabase),
    getPatientOptions(supabase),
    getDoctorContext(supabase)
  ])
  // El médico gestiona todo; la secretaria crea y edita borradores
  const isDoctor = context?.role === 'doctor'
  const isStaff = Boolean(context?.role)

  return (
    <AppSection>
      <div className='w-full space-y-6'>
        <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Evoluciones</h1>
            <p className='mt-1 text-muted-foreground'>
              Seguimiento clínico de tus pacientes en cada consulta.
            </p>
          </div>
          {isStaff && (
            <PatientPickerDialog
              patients={patients}
              buttonLabel='Nueva evolución'
              title='Nueva evolución'
              hrefTemplate='/dashboard/patients/{id}/evolutions/new'
            />
          )}
        </div>
        <Card className='gap-0 overflow-hidden rounded-2xl p-0 shadow-sm'>
          <EvolutionsTable
            key={q ?? ''}
            initialSearch={q}
            data={evolutions}
            isDoctor={isDoctor}
            userId={context?.userId ?? ''}
          />
        </Card>
      </div>
    </AppSection>
  )
}
