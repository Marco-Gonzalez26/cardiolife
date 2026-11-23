'use server'

import { cookies } from 'next/headers'
import { refreshDashboard } from '@/lib/revalidate'
import { nameMatches } from '@/lib/confirm-name'
import { createClient } from '@/lib/supabase/server'
import {
  medicationSchema,
  type MedicationFormData
} from '@/lib/validations/medication'

const NOT_SIGNED_IN = 'Tu sesión expiró. Inicia sesión de nuevo.'
const DOCTOR_ONLY = 'Solo el médico puede modificar el catálogo de medicamentos.'

const getSession = async () => {
  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  return claims ? supabase : null
}

/** Crea (id = null) o actualiza un medicamento junto con sus presentaciones, en una transacción */
export async function saveMedication(
  id: string | null,
  data: MedicationFormData
) {
  const supabase = await getSession()
  if (!supabase) return { error: NOT_SIGNED_IN }

  const parsed = medicationSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }
  const value = parsed.data

  const { data: savedId, error } = await supabase.rpc('save_medication', {
    p_id: id,
    p_medication: {
      name: value.name,
      generic_name: value.genericName.trim(),
      category_id: value.categoryId,
      requires_monitoring: value.requiresMonitoring,
      notes: value.notes.trim(),
      warnings: value.warnings.trim(),
      active: value.active
    },
    p_presentations: value.presentations.map((presentation) => ({
      id: presentation.id ?? '',
      dose: presentation.dose.trim(),
      unit: presentation.unit,
      form: presentation.form,
      route: presentation.route,
      common_frequency: presentation.commonFrequency.trim(),
      standard_instructions: presentation.standardInstructions.trim(),
      manufacturer: presentation.manufacturer.trim(),
      price: presentation.price.trim(),
      available: presentation.available
    }))
  })

  if (error) {
    return { error: error.code === '42501' ? DOCTOR_ONLY : error.message }
  }

  refreshDashboard()
  return { success: true as const, id: savedId as string }
}

/**
 * Activa o desactiva un medicamento. Desactivado deja de ofrecerse al crear recetas;
 * las recetas ya firmadas no cambian.
 */
export async function setMedicationActive(id: string, active: boolean) {
  const supabase = await getSession()
  if (!supabase) return { error: NOT_SIGNED_IN }

  const { data, error } = await supabase
    .from('medications')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
  if (error) return { error: error.message }
  // La política de la tabla solo deja modificar al médico: sin filas afectadas no hubo cambio
  if (!data || data.length === 0) return { error: DOCTOR_ONLY }

  refreshDashboard()
  return { success: true as const }
}

/**
 * Elimina un medicamento de forma definitiva. Exige escribir su nombre, y se compara aquí, en el
 * servidor, contra el nombre guardado. Si ya se recetó, la base de datos lo impide: hay que desactivarlo.
 */
export async function deleteMedication(id: string, confirmation: string) {
  const supabase = await getSession()
  if (!supabase) return { error: NOT_SIGNED_IN }

  const { data: medication } = await supabase
    .from('medications')
    .select('name')
    .eq('id', id)
    .maybeSingle()
  if (!medication) return { error: 'No se encontró el medicamento.' }
  if (!nameMatches(medication.name, confirmation)) {
    return { error: 'El nombre escrito no coincide con el del medicamento.' }
  }

  const { error } = await supabase.rpc('delete_medication', { p_id: id })
  if (error) {
    return {
      error:
        error.code === '23503'
          ? 'No se puede eliminar: ya fue recetado. Desactívalo en su lugar.'
          : error.message
    }
  }

  refreshDashboard()
  return { success: true as const }
}
