import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { EvolutionEditor } from '@/components/evolution-editor'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { createClient } from '@/lib/supabase/server'
import {
  EMPTY_EVOLUTION,
  type EvolutionFormData,
  type EvolutionStatus
} from '@/lib/validations/evolution'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Mezcla un jsonb guardado con los valores vacíos, para que el formulario siempre tenga todas las claves */
const merge = <T extends Record<string, string>>(
  base: T,
  saved: unknown
): T => {
  const result = { ...base }
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    for (const key of Object.keys(base)) {
      const value = (saved as Record<string, unknown>)[key]
      if (typeof value === 'string' || typeof value === 'number') {
        ;(result as Record<string, string>)[key] = String(value)
      }
    }
  }
  return result
}

export default async function EvolutionPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; evolutionId: string }>
  searchParams: Promise<{ modo?: string }>
}) {
  const { id, evolutionId } = await params
  const { modo } = await searchParams
  if (!UUID.test(evolutionId)) notFound()

  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [context, { data: evolution }] = await Promise.all([
    getDoctorContext(supabase),
    supabase
      .from('evolution')
      .select(
        'id, created_at, status, created_by, diagnosis, sugestive, treatment, treatment_plan, ekg_diagnosis, objective, ekg, patient:patient_id!inner(id, names, lastnames, identification, age, birthdate, blood_type, status)'
      )
      .eq('id', evolutionId)
      .eq('patient_id', id)
      .maybeSingle()
  ])

  if (!evolution) notFound()

  const patient = evolution.patient as unknown as {
    names: string
    lastnames: string
    identification: string | null
    age: string | null
    birthdate: string | null
    blood_type: string | null
    status: string | null
  }

  const defaultValues: EvolutionFormData = {
    diagnosis: evolution.diagnosis ?? '',
    sugestive: evolution.sugestive ?? '',
    treatment: evolution.treatment ?? '',
    treatmentPlan: evolution.treatment_plan ?? '',
    ekgDiagnosis: evolution.ekg_diagnosis ?? '',
    objective: merge(EMPTY_EVOLUTION.objective, evolution.objective),
    ekg: merge(EMPTY_EVOLUTION.ekg, evolution.ekg)
  }

  const status = evolution.status as EvolutionStatus
  const isDoctor = context?.role === 'doctor'
  // El médico edita todo; la secretaria solo borradores
  const canEdit =
    isDoctor || (context?.role === 'secretary' && status === 'draft')

  return (
    <EvolutionEditor
      patientId={id}
      patient={patient}
      mode={canEdit && modo === 'editar' ? 'edit' : 'view'}
      evolutionId={evolutionId}
      createdAt={evolution.created_at}
      canEdit={canEdit}
      canComplete={isDoctor}
      status={status}
      defaultValues={defaultValues}
    />
  )
}
