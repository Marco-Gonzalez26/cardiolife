import * as z from 'zod'

const jsonFieldSchema = z
  .object({
    status: z.boolean(),
    details: z.string()
  })
  .catch({ status: false, details: '' })
  .refine((data) => !data.status || data.details.trim().length > 0, {
    message: 'Si marca el antecedente, debe ingresar detalles',
    path: ['details']
  })

export const antecedentsSchema = z.object({
  currentDisease: z
    .string()
    .min(1, 'Ingrese el motivo actual de la enfermedad'),
  hta: jsonFieldSchema,
  cigarette: jsonFieldSchema,
  exercise: jsonFieldSchema,
  religion: jsonFieldSchema,
  alcohol: jsonFieldSchema,
  stroke: jsonFieldSchema,
  diabetes: jsonFieldSchema,
  cancer: jsonFieldSchema,
  surgeries: jsonFieldSchema,
  syncope: jsonFieldSchema,
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
  systolicBp: z.string().min(1, 'Ingrese la presion arterial sistólica'),
  dyastolicBp: z.string().min(1, 'Ingrese la presion arterial diastólica'),
  heartRate: z.string().min(1, 'Ingrese la frecuencia cardíaca'),
  respiratoryRate: z.string().min(1, 'Ingrese la frecuencia respiratoria'),
  weight: z.string().min(1, 'Ingrese el peso'),
  height: z.string().min(1, 'Ingrese la altura'),
  imc: z.string().min(1, 'Ingrese el IMC'),
  findings: z.string().min(1, 'Ingrese los hallazgos del examen físico'),
  // Campos del diseño de Stitch: opcionales
  spo2: z.string(),
  cardiacRhythm: z.string(),
  murmurs: z.string(),
  lungAuscultation: z.string()
})

export const paraclinicalExamSchema = z.object({
  rs: z.string().min(1, 'Ingrese el RS'),
  pWave: z.string().min(1, 'Ingrese el Onda P'),
  bloodPressure: z.string(),
  qrs: z.string().min(1, 'Ingrese el QRS'),
  axis: z.string().min(1, 'Ingrese el Eje'),
  qtc: z.string().min(1, 'Ingrese el QTc'),
  ts: z.string().min(1, 'Ingrese el TS'),
  observations: z.string().min(1, 'Ingrese las observaciones')
})

export const clinicHistorySchema = z.object({
  date: z.date('Ingrese la fecha de la consulta'),
  reason: z.string().min(1, 'El motivo de la consulta es requerido'),
  diagnosis: z.string().min(1, 'El diagnóstico es requerido'),
  treatmentPlan: z.string().min(1, 'El plan de tratamiento es requerido'),
  antecedents: antecedentsSchema,
  physicalExam: physicalExamSchema,
  paraclinicalExam: paraclinicalExamSchema
})

const draftJsonFieldSchema = z
  .object({ status: z.boolean(), details: z.string() })
  .catch({ status: false, details: '' })

/**
 * Borrador: solo exige la fecha; el resto puede estar incompleto.
 * Lo usa la secretaria (o el médico) para guardar el avance.
 */
export const clinicHistoryDraftSchema = z.object({
  date: z.date('Ingrese la fecha de la consulta'),
  reason: z.string(),
  diagnosis: z.string(),
  treatmentPlan: z.string(),
  antecedents: z.object({ currentDisease: z.string() }).catchall(draftJsonFieldSchema),
  physicalExam: z.object({
    systolicBp: z.string(),
    dyastolicBp: z.string(),
    heartRate: z.string(),
    respiratoryRate: z.string(),
    weight: z.string(),
    height: z.string(),
    imc: z.string(),
    findings: z.string(),
    spo2: z.string(),
    cardiacRhythm: z.string(),
    murmurs: z.string(),
    lungAuscultation: z.string()
  }),
  paraclinicalExam: z.object({
    rs: z.string(),
    pWave: z.string(),
    bloodPressure: z.string(),
    qrs: z.string(),
    axis: z.string(),
    qtc: z.string(),
    ts: z.string(),
    observations: z.string()
  })
})

export type ClinicHistoryStatus = 'draft' | 'completed'

export type AntecedentsFormData = z.infer<typeof antecedentsSchema>
export type PhysicalExamFormData = z.infer<typeof physicalExamSchema>
export type ParaclinicalExamFormData = z.infer<typeof paraclinicalExamSchema>
export type ClinicHistoryFormData = z.infer<typeof clinicHistorySchema>
