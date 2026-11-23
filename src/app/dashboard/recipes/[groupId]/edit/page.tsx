import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { NoticeCard } from '@/components/notice-card'
import { RecipeEditor } from '@/components/recipe-editor'
import { getPatientOptions } from '@/lib/services/appointments-service'
import { getRecipeMedications } from '@/lib/services/catalog-service'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { getPrescriptionGroup } from '@/lib/services/prescriptions-service'
import { createClient } from '@/lib/supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function EditRecipePage({
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

  const [context, recipe, patients, medications] = await Promise.all([
    getDoctorContext(supabase),
    getPrescriptionGroup(supabase, groupId),
    getPatientOptions(supabase),
    getRecipeMedications(supabase)
  ])
  if (!recipe) notFound()

  if (context?.role !== 'doctor') {
    return (
      <NoticeCard
        title='Solo el médico puede modificar recetas'
        href={`/dashboard/recipes/${groupId}`}
        action='Volver a la receta'>
        Las secretarias pueden consultar la receta y descargar el PDF.
      </NoticeCard>
    )
  }

  if (recipe.signedAt) {
    return (
      <NoticeCard
        title='La receta ya está firmada'
        href={`/dashboard/recipes/${groupId}`}
        action='Volver a la receta'>
        Una receta firmada electrónicamente no se puede modificar. Si hubo un
        error, anúlala y emite una nueva.
      </NoticeCard>
    )
  }

  return (
    <RecipeEditor
      groupId={groupId}
      patients={patients}
      medications={medications}
      fallbackLabels={Object.fromEntries(
        recipe.lines.map((line) => [
          line.presentation_id,
          `${line.medication_snapshot.name} ${line.medication_snapshot.dose} ${line.medication_snapshot.unit}`
        ])
      )}
      defaultValues={{
        patientId: recipe.patient.id,
        diagnosis: recipe.diagnosis ?? '',
        diagnosisCode: recipe.diagnosisCode ?? '',
        lines: recipe.lines.map((line) => ({
          medicationId: line.medication_id,
          presentationId: line.presentation_id,
          customFrequency: line.custom_frequency ?? '',
          customDuration: line.custom_duration ?? '',
          customInstructions: line.custom_instructions ?? '',
          quantityAmount: line.quantity_amount,
          quantityUnit: line.quantity_unit
        }))
      }}
    />
  )
}
