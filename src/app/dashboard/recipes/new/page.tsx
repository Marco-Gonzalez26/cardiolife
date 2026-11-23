import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NoticeCard } from '@/components/notice-card'
import { RecipeEditor } from '@/components/recipe-editor'
import { getPatientOptions } from '@/lib/services/appointments-service'
import { getRecipeMedications } from '@/lib/services/catalog-service'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { createClient } from '@/lib/supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function NewRecipePage({
  searchParams
}: {
  searchParams: Promise<{ paciente?: string }>
}) {
  const { paciente } = await searchParams

  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [context, patients, medications] = await Promise.all([
    getDoctorContext(supabase),
    getPatientOptions(supabase),
    getRecipeMedications(supabase)
  ])

  if (context?.role !== 'doctor') {
    return (
      <NoticeCard
        title='Solo el médico puede emitir recetas'
        href='/dashboard/recipes'
        action='Volver a recetas'>
        Las secretarias pueden consultar las recetas y descargar el PDF, pero no
        emitirlas ni modificarlas.
      </NoticeCard>
    )
  }

  const presetPatient =
    paciente && UUID.test(paciente) && patients.some((item) => item.id === paciente)
      ? paciente
      : ''

  return (
    <RecipeEditor
      patients={patients}
      medications={medications}
      defaultValues={{
        patientId: presetPatient,
        diagnosis: '',
        diagnosisCode: '',
        lines: []
      }}
    />
  )
}
