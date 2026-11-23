import type { createClient } from '@/lib/supabase/server'

type ServerClient = ReturnType<typeof createClient>

/** Copia del medicamento al momento de recetar (la receta no cambia si luego se edita el catálogo) */
export type MedicationSnapshot = {
  name: string
  genericName?: string | null
  dose: string
  unit: string
  form: string
  route?: string | null
  standardFrequency?: string | null
  standardInstructions?: string | null
  warnings?: string | null
}

export type PrescriptionLine = {
  id: string
  medication_id: string
  presentation_id: string
  medication_snapshot: MedicationSnapshot
  custom_frequency: string | null
  custom_duration: string | null
  custom_instructions: string | null
  quantity_amount: number
  quantity_unit: string
}

export type PrescriptionPatient = {
  id: string
  names: string
  lastnames: string
  identification: string | null
  age?: string | null
  doctor_profile_id?: string | null
}

export type PrescriptionGroup = {
  groupId: string
  issuedAt: string
  status: string
  diagnosis: string | null
  diagnosisCode: string | null
  /** Momento de la firma electrónica; si existe, la receta es inmutable (solo se puede anular) */
  signedAt: string | null
  signedPdfPath: string | null
  signerSubject: string | null
  patient: PrescriptionPatient
  lines: PrescriptionLine[]
}

const LINE_FIELDS =
  'id, prescription_group_id, issued_at, status, created_at, diagnosis, diagnosis_code, signed_at, signed_pdf_path, signer_subject, medication_id, presentation_id, medication_snapshot, custom_frequency, custom_duration, custom_instructions, quantity_amount, quantity_unit'

type Row = PrescriptionLine & {
  prescription_group_id: string | null
  issued_at: string | null
  status: string | null
  created_at: string
  diagnosis: string | null
  diagnosis_code: string | null
  signed_at: string | null
  signed_pdf_path: string | null
  signer_subject: string | null
  patient: PrescriptionPatient
}

/** Agrupa las líneas (una fila por medicamento) en recetas, usando prescription_group_id */
const group = (rows: Row[]): PrescriptionGroup[] => {
  const groups = new Map<string, PrescriptionGroup>()
  for (const row of rows) {
    const key = row.prescription_group_id ?? row.id
    const existing = groups.get(key)
    if (existing) {
      existing.lines.push(row)
    } else {
      groups.set(key, {
        groupId: key,
        issuedAt: row.issued_at ?? row.created_at.slice(0, 10),
        status: row.status ?? 'Activa',
        diagnosis: row.diagnosis,
        diagnosisCode: row.diagnosis_code,
        signedAt: row.signed_at,
        signedPdfPath: row.signed_pdf_path,
        signerSubject: row.signer_subject,
        patient: row.patient,
        lines: [row]
      })
    }
  }
  return [...groups.values()]
}

/** Todas las recetas visibles, las más recientes primero */
export async function getPrescriptionGroups(
  supabase: ServerClient
): Promise<PrescriptionGroup[]> {
  const { data, error } = await supabase
    .from('prescriptions')
    .select(
      `${LINE_FIELDS}, patient:patient_id!inner(id, names, lastnames, identification)`
    )
    .order('issued_at', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(2000)

  if (error) throw new Error(error.message)
  return group((data ?? []) as unknown as Row[])
}

export async function getPrescriptionGroup(
  supabase: ServerClient,
  groupId: string
): Promise<PrescriptionGroup | null> {
  const { data } = await supabase
    .from('prescriptions')
    .select(
      `${LINE_FIELDS}, patient:patient_id!inner(id, names, lastnames, identification, age, doctor_profile_id)`
    )
    .eq('prescription_group_id', groupId)
    .order('created_at', { ascending: true })

  const groups = group((data ?? []) as unknown as Row[])
  return groups[0] ?? null
}

export type DoctorInfo = {
  full_name: string
  email: string
  specialty: string | null
  license: string | null
  phone: string | null
  address: string | null
  city: string | null
  identification: string | null
}

export async function getDoctorInfo(
  supabase: ServerClient,
  doctorId: string | null | undefined
): Promise<DoctorInfo | null> {
  if (!doctorId) return null
  const { data } = await supabase
    .from('doctor_profile')
    .select(
      'full_name, email, specialty, license, phone, address, city, identification'
    )
    .eq('id', doctorId)
    .maybeSingle()
  return (data as DoctorInfo) ?? null
}

/** Próxima cita pendiente o confirmada del paciente, para imprimirla en la receta */
export async function getNextAppointmentLabel(
  supabase: ServerClient,
  patientId: string,
  today: string
): Promise<string | null> {
  const { data } = await supabase
    .from('citas')
    .select('date, time')
    .eq('patient_id', patientId)
    .gte('date', today)
    .in('status', ['Pendiente', 'Confirmada'])
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!data) return null
  const [year, month, day] = String(data.date).split('-')
  return `${day}/${month}/${year} ${String(data.time).slice(0, 5)}`
}
