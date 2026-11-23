import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MedicationEditor } from '@/components/medication-editor'
import { NoticeCard } from '@/components/notice-card'
import { getCategories } from '@/lib/services/catalog-service'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { createClient } from '@/lib/supabase/server'
import { EMPTY_MEDICATION } from '@/lib/validations/medication'

export default async function NewMedicationPage() {
  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [context, categories] = await Promise.all([
    getDoctorContext(supabase),
    getCategories(supabase)
  ])

  if (context?.role !== 'doctor') {
    return (
      <NoticeCard
        title='Solo el médico puede modificar el catálogo'
        href='/dashboard/medications'
        action='Volver a medicamentos'>
        Las secretarias pueden consultar los medicamentos, pero no crearlos ni
        editarlos.
      </NoticeCard>
    )
  }

  return (
    <MedicationEditor defaultValues={EMPTY_MEDICATION} categories={categories} />
  )
}
