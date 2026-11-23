import type { Json, Tables } from '@/types/database.types'
import type { ClinicHistoryFormData } from '../validations/clinic-history'

/** camelCase del formulario -> columna jsonb de `antecedents` */
const ANTECEDENT_JSON_COLUMNS = {
  hta: 'hta',
  diabetes: 'diabetes',
  dyslipidemia: 'dyslipidemia',
  heartDisease: 'heart_disease',
  thyroidDisease: 'thyroid_disease',
  kidneyDisease: 'kidney_disease',
  gastricDisease: 'gastric_disease',
  cardiovascularDisease: 'cardiovascular_disease',
  cardiac: 'cardiac',
  neuropathy: 'neuropathy',
  cancer: 'cancer',
  stroke: 'stroke',
  syncope: 'syncope',
  surgeries: 'surgeries',
  alergies: 'alergies',
  covid: 'covid',
  cigarette: 'cigarette',
  alcohol: 'alcohol',
  drugs: 'drugs',
  exercise: 'exercise',
  religion: 'religion',
  father: 'father',
  mother: 'mother'
} as const

type AntecedentKey = keyof typeof ANTECEDENT_JSON_COLUMNS
type JsonField = { status: boolean; details: string }

const text = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** Valores del formulario (completos o de borrador) -> argumentos de `save_clinic_history` */
export function toRpcPayload(values: ClinicHistoryFormData) {
  const antecedents: Record<string, Json> = {
    current_disease: text(values.antecedents.currentDisease)
  }
  for (const [key, column] of Object.entries(ANTECEDENT_JSON_COLUMNS)) {
    const field = values.antecedents[key as AntecedentKey] as
      | JsonField
      | undefined
    antecedents[column] = field
      ? { status: field.status, details: field.details.trim() }
      : null
  }

  const { physicalExam: p, paraclinicalExam: c } = values

  return {
    p_date: values.date.toISOString(),
    p_reason: text(values.reason),
    p_diagnosis: text(values.diagnosis),
    p_treatment_plan: text(values.treatmentPlan),
    p_antecedents: antecedents,
    p_physical_exam: {
      systolic_bp: text(p.systolicBp),
      dyastolic_bp: text(p.dyastolicBp),
      heart_rate: text(p.heartRate),
      respiratory_rate: text(p.respiratoryRate),
      weight: text(p.weight),
      height: text(p.height),
      imc: text(p.imc),
      findings: text(p.findings),
      spo2: text(p.spo2),
      cardiac_rhythm: text(p.cardiacRhythm),
      murmurs: text(p.murmurs),
      lung_auscultation: text(p.lungAuscultation)
    },
    p_paraclinical_exam: {
      rs: text(c.rs),
      p_wave: text(c.pWave),
      blood_pressure: text(c.bloodPressure),
      qrs: text(c.qrs),
      axis: text(c.axis),
      qtc: text(c.qtc),
      ts: text(c.ts),
      observations: text(c.observations)
    }
  }
}

export type ClinicHistoryWithRelations = Tables<'clinic_history'> & {
  antecedents: Tables<'antecedents'> | null
  physical_exam: Tables<'physical_exam'> | null
  paraclinical_exam: Tables<'paraclinical_exam'> | null
}

const fromJson = (value: Json | undefined): JsonField => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      status: value.status === true,
      details: typeof value.details === 'string' ? value.details : ''
    }
  }
  return { status: false, details: '' }
}

/** Fila de BD (con relaciones) -> valores por defecto del formulario */
export function toFormValues(
  row: ClinicHistoryWithRelations
): Partial<ClinicHistoryFormData> {
  const a = row.antecedents
  const p = row.physical_exam
  const c = row.paraclinical_exam

  const antecedents = { currentDisease: a?.current_disease ?? '' } as Record<
    string,
    string | JsonField
  >
  for (const [key, column] of Object.entries(ANTECEDENT_JSON_COLUMNS)) {
    antecedents[key] = fromJson(a?.[column])
  }

  return {
    date: row.date ? new Date(row.date) : new Date(),
    reason: row.reason ?? '',
    diagnosis: row.diagnosis ?? '',
    treatmentPlan: row.treatment_plan ?? '',
    antecedents: antecedents as ClinicHistoryFormData['antecedents'],
    physicalExam: {
      systolicBp: p?.systolic_bp ?? '',
      dyastolicBp: p?.dyastolic_bp ?? '',
      heartRate: p?.heart_rate ?? '',
      respiratoryRate: p?.respiratory_rate ?? '',
      weight: p?.weight ?? '',
      height: p?.height ?? '',
      imc: p?.imc ?? '',
      findings: p?.findings ?? '',
      spo2: p?.spo2 ?? '',
      cardiacRhythm: p?.cardiac_rhythm ?? '',
      murmurs: p?.murmurs ?? '',
      lungAuscultation: p?.lung_auscultation ?? ''
    },
    paraclinicalExam: {
      rs: c?.rs ?? '',
      pWave: c?.p_wave ?? '',
      bloodPressure: c?.blood_pressure ?? '',
      qrs: c?.qrs ?? '',
      axis: c?.axis ?? '',
      qtc: c?.qtc ?? '',
      ts: c?.ts ?? '',
      observations: c?.observations ?? ''
    }
  }
}
