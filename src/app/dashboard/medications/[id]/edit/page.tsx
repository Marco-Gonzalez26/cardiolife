import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { MedicationEditor } from '@/components/medication-editor'
import { NoticeCard } from '@/components/notice-card'
import {
  getCategories,
  getMedicationDetail
} from '@/lib/services/catalog-service'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { createClient } from '@/lib/supabase/server'
import type { MedicationFormData } from '@/lib/validations/medication'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function EditMedicationPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!UUID.test(id)) notFound()

  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [context, medication, categories] = await Promise.all([
    getDoctorContext(supabase),
    getMedicationDetail(supabase, id),
    getCategories(supabase)
  ])
  if (!medication) notFound()

  if (context?.role !== 'doctor') {
    return (
      <NoticeCard
        title='Solo el médico puede modificar el catálogo'
        href={`/dashboard/medications/${id}`}
        action='Volver al medicamento'>
        Las secretarias pueden consultar los medicamentos, pero no editarlos.
      </NoticeCard>
    )
  }

  const defaultValues: MedicationFormData = {
    name: medication.name,
    genericName: medication.generic_name ?? '',
    categoryId: medication.category_id ?? '',
    requiresMonitoring: medication.requires_monitoring ?? false,
    notes: medication.notes ?? '',
    warnings: medication.warnings ?? '',
    active: medication.active ?? true,
    presentations: medication.presentations.map((presentation) => ({
      id: presentation.id,
      dose: presentation.dose,
      unit: presentation.unit,
      form: presentation.form,
      route: presentation.route,
      commonFrequency: presentation.common_frequency ?? '',
      standardInstructions: presentation.standard_instructions ?? '',
      manufacturer: presentation.manufacturer ?? '',
      price: presentation.price === null ? '' : String(presentation.price),
      available: presentation.available ?? true
    }))
  }

  // Si la categoría actual está inactiva no sale en la lista: se agrega para no perderla al guardar
  const options =
    medication.category && !categories.some((item) => item.id === medication.category?.id)
      ? [...categories, medication.category]
      : categories

  return (
    <MedicationEditor
      medicationId={id}
      defaultValues={defaultValues}
      categories={options}
    />
  )
}
