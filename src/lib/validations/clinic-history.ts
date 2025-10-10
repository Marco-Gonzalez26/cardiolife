import { th } from 'react-day-picker/locale'
import * as z from 'zod'

const jsonFieldSchema = z.object({
  status: z.boolean().catch(false),
  details: z.string().catch('')
})

export const antecedentsSchema = z.object({
  currentDisease: z.string(),
  hta: jsonFieldSchema,
  cigarrette: jsonFieldSchema,
  exercise: jsonFieldSchema,
  religion: jsonFieldSchema,
  alcohol: jsonFieldSchema,
  stroke: jsonFieldSchema,
  diabetes: jsonFieldSchema,
  cancer: jsonFieldSchema,
  surgeries: jsonFieldSchema,
  heartDisease: jsonFieldSchema,
  dyslipidemia: jsonFieldSchema,
  thyroidDisease: jsonFieldSchema,
  alergies: jsonFieldSchema,
  covid: jsonFieldSchema,
  father: jsonFieldSchema,
  mother: jsonFieldSchema,
  gastricDisease: jsonFieldSchema,
  neuropathy: jsonFieldSchema,
  cardiovascularDisease: jsonFieldSchema,
  cardiac: jsonFieldSchema,
  kidneyDisease: jsonFieldSchema,
  drugs: jsonFieldSchema
})

export const physicalExamSchema = z.object({
  systolicBp: z.string(),
  dyastolicBp: z.string(),
  heartRate: z.string(),
  respiratoryRate: z.string(),
  weight: z.string(),
  height: z.string(),
  imc: z.string(),
  findings: z.string()
})

export const paraclinicalExamSchema = z.object({
  rs: z.string(),
  pWave: z.string(),
  bloodPreassure: z.string(),
  qrs: z.string(),
  axis: z.string(),
  qtc: z.string(),
  ts: z.string(),
  observations: z.string(),
  height: z.string(),
  imc: z.string(),
  findings: z.string()
})

export const clinicHistorySchema = z.object({
  date: z.string(),
  reason: z.string().min(1, 'El motivo de la consulta es requerido'),
  treatmentPlan: z.string().min(1, 'El plan de tratamiento es requerido'),
  antecedents: antecedentsSchema,
  physicalExam: physicalExamSchema,
  paraclinicalExam: paraclinicalExamSchema
})

export type AntecedentsFormData = z.infer<typeof antecedentsSchema>
export type PhysicalExamFormData = z.infer<typeof physicalExamSchema>
export type ParaclinicalExamFormData = z.infer<typeof paraclinicalExamSchema>
export type ClinicHistoryFormData = z.infer<typeof clinicHistorySchema>
