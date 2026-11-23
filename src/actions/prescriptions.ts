'use server'

import { cookies } from 'next/headers'
import { refreshDashboard } from '@/lib/revalidate'
import { createClient } from '@/lib/supabase/server'
import {
  prescriptionSchema,
  type PrescriptionFormData
} from '@/lib/validations/prescription'

const NOT_SIGNED_IN = 'Tu sesión expiró. Inicia sesión de nuevo.'
const DOCTOR_ONLY =
  'Solo el médico del paciente puede emitir o modificar recetas.'

const getSession = async () => {
  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  return claims ? supabase : null
}

type PresentationWithMedication = {
  id: string
  dose: string
  unit: string
  form: string
  route: string
  common_frequency: string | null
  standard_instructions: string | null
  available: boolean | null
  medication_id: string
  medication: {
    name: string
    generic_name: string | null
    warnings: string | null
    active: boolean | null
  } | null
}

/**
 * Emite una receta (groupId = null) o reemplaza una existente. El médico elige medicamento y
 * presentación; el servidor arma la copia ("snapshot") desde el catálogo para que no sea manipulable.
 */
export async function savePrescription(
  groupId: string | null,
  data: PrescriptionFormData
) {
  const supabase = await getSession()
  if (!supabase) return { error: NOT_SIGNED_IN }

  const parsed = prescriptionSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }
  const { patientId, lines, diagnosis, diagnosisCode } = parsed.data

  const { data: presentations, error: catalogError } = await supabase
    .from('medication_presentations')
    .select(
      'id, dose, unit, form, route, common_frequency, standard_instructions, available, medication_id, medication:medication_id(name, generic_name, warnings, active)'
    )
    .in(
      'id',
      lines.map((line) => line.presentationId)
    )
  if (catalogError) return { error: catalogError.message }

  const byId = new Map(
    ((presentations ?? []) as unknown as PresentationWithMedication[]).map(
      (presentation) => [presentation.id, presentation]
    )
  )

  const payload = []
  for (const line of lines) {
    const presentation = byId.get(line.presentationId)
    if (!presentation || presentation.medication_id !== line.medicationId) {
      return { error: 'Una de las presentaciones ya no existe en el catálogo.' }
    }
    if (!presentation.medication?.active || presentation.available === false) {
      return {
        error: `${presentation.medication?.name ?? 'Un medicamento'} ya no está disponible para recetar.`
      }
    }
    payload.push({
      medication_id: line.medicationId,
      presentation_id: line.presentationId,
      snapshot: {
        name: presentation.medication.name,
        genericName: presentation.medication.generic_name,
        dose: presentation.dose,
        unit: presentation.unit,
        form: presentation.form,
        route: presentation.route,
        standardFrequency: presentation.common_frequency,
        standardInstructions: presentation.standard_instructions,
        warnings: presentation.medication.warnings
      },
      custom_frequency: line.customFrequency.trim(),
      custom_duration: line.customDuration.trim(),
      custom_instructions: line.customInstructions.trim(),
      quantity_amount: line.quantityAmount,
      quantity_unit: line.quantityUnit.trim()
    })
  }

  // Receta nueva: se vincula a la evolución más reciente o, si no hay, a la última historia completada
  let evolutionId: string | null = null
  let historyId: number | null = null
  if (!groupId) {
    const [{ data: evolution }, { data: history }] = await Promise.all([
      supabase
        .from('evolution')
        .select('id')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('clinic_history')
        .select('id')
        .eq('patient_id', patientId)
        .eq('status', 'completed')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle()
    ])
    evolutionId = (evolution?.id as string) ?? null
    historyId = evolutionId ? null : ((history?.id as number) ?? null)
  }

  const { data: savedGroup, error } = await supabase.rpc('save_prescription', {
    p_patient_id: patientId,
    p_group_id: groupId,
    p_lines: payload,
    p_diagnosis: diagnosis,
    p_diagnosis_code: diagnosisCode.trim(),
    p_clinic_history_id: historyId,
    p_evolution_id: evolutionId
  })

  if (error) {
    return { error: error.code === '42501' ? DOCTOR_ONLY : error.message }
  }

  refreshDashboard()
  return { success: true as const, groupId: savedGroup as string }
}

export async function deletePrescription(groupId: string) {
  const supabase = await getSession()
  if (!supabase) return { error: NOT_SIGNED_IN }

  const { data, error } = await supabase
    .from('prescriptions')
    .delete()
    .eq('prescription_group_id', groupId)
    .select('patient_id')

  if (error) return { error: error.message }
  // La RLS no devuelve error cuando no hay permiso: simplemente no borra nada
  if (!data || data.length === 0) {
    const { data: signed } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('prescription_group_id', groupId)
      .not('signed_at', 'is', null)
      .limit(1)
    return {
      error: signed?.length
        ? 'Una receta firmada no se puede eliminar. Anúlala si hubo un error.'
        : DOCTOR_ONLY
    }
  }

  refreshDashboard()
  return { success: true as const }
}

/** Diagnóstico sugerido para una receta nueva: el de la evolución más reciente o, si no hay, el de la última historia completada */
export async function getSuggestedDiagnosis(patientId: string) {
  const supabase = await getSession()
  if (!supabase) return ''

  const { data: evolution } = await supabase
    .from('evolution')
    .select('diagnosis')
    .eq('patient_id', patientId)
    .not('diagnosis', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (evolution?.diagnosis) return String(evolution.diagnosis)

  const { data: history } = await supabase
    .from('clinic_history')
    .select('diagnosis')
    .eq('patient_id', patientId)
    .eq('status', 'completed')
    .not('diagnosis', 'is', null)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()
  return history?.diagnosis ? String(history.diagnosis) : ''
}
