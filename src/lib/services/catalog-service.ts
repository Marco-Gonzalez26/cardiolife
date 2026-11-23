import type { createClient } from '@/lib/supabase/server'

type ServerClient = ReturnType<typeof createClient>

export type CategoryOption = { id: string; name: string }

export type PresentationRow = {
  id: string
  dose: string
  unit: string
  form: string
  route: string
  common_frequency: string | null
  standard_instructions: string | null
  available: boolean | null
  manufacturer: string | null
  price: number | null
}

export type MedicationListItem = {
  id: string
  name: string
  generic_name: string | null
  requires_monitoring: boolean | null
  active: boolean | null
  category: CategoryOption | null
  presentations: Pick<PresentationRow, 'id' | 'dose' | 'unit' | 'form' | 'available'>[]
}

export type MedicationDetail = {
  id: string
  name: string
  generic_name: string | null
  category_id: string | null
  requires_monitoring: boolean | null
  notes: string | null
  warnings: string | null
  active: boolean | null
  category: CategoryOption | null
  presentations: PresentationRow[]
}

/** Medicamento listo para recetar: solo activos, con sus presentaciones disponibles */
export type RecipeMedication = {
  id: string
  name: string
  generic_name: string | null
  requires_monitoring: boolean | null
  warnings: string | null
  category: string | null
  presentations: Omit<PresentationRow, 'available' | 'manufacturer' | 'price'>[]
}

const PRESENTATION_FIELDS =
  'id, dose, unit, form, route, common_frequency, standard_instructions, available, manufacturer, price'

export async function getCategories(
  supabase: ServerClient
): Promise<CategoryOption[]> {
  const { data, error } = await supabase
    .from('medication_categories')
    .select('id, name')
    .eq('active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as CategoryOption[]
}

export async function getMedicationList(
  supabase: ServerClient
): Promise<MedicationListItem[]> {
  const { data, error } = await supabase
    .from('medications')
    .select(
      'id, name, generic_name, requires_monitoring, active, category:category_id(id, name), presentations:medication_presentations(id, dose, unit, form, available)'
    )
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as MedicationListItem[]
}

export async function getMedicationDetail(
  supabase: ServerClient,
  id: string
): Promise<MedicationDetail | null> {
  const { data } = await supabase
    .from('medications')
    .select(
      `id, name, generic_name, category_id, requires_monitoring, notes, warnings, active, category:category_id(id, name), presentations:medication_presentations(${PRESENTATION_FIELDS})`
    )
    .eq('id', id)
    .maybeSingle()

  if (!data) return null
  const medication = data as unknown as MedicationDetail
  medication.presentations = [...medication.presentations].sort(
    (a, b) => Number(a.dose) - Number(b.dose) || a.form.localeCompare(b.form)
  )
  return medication
}

export async function getRecipeMedications(
  supabase: ServerClient
): Promise<RecipeMedication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select(
      'id, name, generic_name, requires_monitoring, warnings, category:category_id(name), presentations:medication_presentations(id, dose, unit, form, route, common_frequency, standard_instructions, available)'
    )
    .eq('active', true)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)

  type Raw = Omit<RecipeMedication, 'category' | 'presentations'> & {
    category: { name: string } | null
    presentations: (RecipeMedication['presentations'][number] & {
      available: boolean | null
    })[]
  }

  return ((data ?? []) as unknown as Raw[])
    .map((medication) => ({
      ...medication,
      category: medication.category?.name ?? null,
      presentations: medication.presentations
        .filter((presentation) => presentation.available !== false)
        .sort((a, b) => Number(a.dose) - Number(b.dose))
    }))
    .filter((medication) => medication.presentations.length > 0)
}
