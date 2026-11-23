import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NewClinicHistory } from '@/components/create-history'
import { PatientNotFound } from '@/components/patient-not-found'
import { createClient } from '@/lib/supabase/server'
import {
  toFormValues,
  type ClinicHistoryWithRelations
} from '@/lib/services/clinic-history-mapper'

export default async function NewClinicHistoryPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ historia?: string; modo?: string }>
}) {
  const { id } = await params
  const { historia, modo } = await searchParams

  if (!id) {
    return <PatientNotFound />
  }

  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')
  const userId = claims.claims.sub

  const [{ data: patient }, { data: lastCompleted }] = await Promise.all([
    supabase
      .from('patient')
      .select(
        'id, names, lastnames, identification, age, birthdate, blood_type, status, doctor_profile_id'
      )
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('clinic_history')
      .select('date')
      .eq('patient_id', id)
      .eq('status', 'completed')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()
  ])

  if (!patient) {
    return <PatientNotFound />
  }

  // Solo el médico del paciente puede completar; la secretaria guarda borradores
  const canComplete = patient.doctor_profile_id === userId

  // ?historia=<id>: continuar un borrador o abrir una historia ya completada
  let historyRow: ClinicHistoryWithRelations | null = null
  if (historia && /^\d+$/.test(historia)) {
    const { data } = await supabase
      .from('clinic_history')
      .select('*, antecedents(*), physical_exam(*), paraclinical_exam(*)')
      .eq('id', Number(historia))
      .eq('patient_id', id)
      .maybeSingle()
    historyRow = data
  }
  const historyStatus = historyRow?.status as 'draft' | 'completed' | undefined
  // La secretaria no puede editar una historia que el médico ya completó
  // ?modo=ver abre la historia sin poder modificarla, aunque el usuario tenga permiso
  const readOnly =
    (historyStatus === 'completed' && !canComplete) ||
    (modo === 'ver' && historyRow !== null)

  return (
    <NewClinicHistory
      patientId={id}
      patient={patient}
      lastVisit={lastCompleted?.date ?? null}
      canComplete={canComplete}
      clinicHistoryId={historyRow?.id}
      historyStatus={historyStatus}
      readOnly={readOnly}
      defaultValues={historyRow ? toFormValues(historyRow) : undefined}
    />
  )
}
