import * as z from 'zod'

/**
 * Evolución clínica de seguimiento. Solo el diagnóstico y el plan son obligatorios;
 * los signos vitales y el EKG se guardan como jsonb (`objective` y `ekg`) solo si se llenan.
 */
export const evolutionSchema = z.object({
  diagnosis: z.string().min(1, 'El diagnóstico es requerido'),
  sugestive: z.string(),
  treatment: z.string(),
  treatmentPlan: z.string().min(1, 'El plan de tratamiento es requerido'),
  ekgDiagnosis: z.string(),
  objective: z.object({
    systolicBp: z.string(),
    dyastolicBp: z.string(),
    heartRate: z.string(),
    respiratoryRate: z.string(),
    spo2: z.string(),
    weight: z.string(),
    findings: z.string()
  }),
  ekg: z.object({
    rs: z.string(),
    pWave: z.string(),
    qrs: z.string(),
    axis: z.string(),
    qtc: z.string(),
    observations: z.string()
  })
})

export type EvolutionFormData = z.infer<typeof evolutionSchema>

export type EvolutionStatus = 'draft' | 'completed'

/** Borrador: todo es opcional, pero no se guarda una evolución completamente vacía */
export const evolutionDraftSchema = evolutionSchema
  .extend({
    diagnosis: z.string(),
    treatmentPlan: z.string()
  })
  .refine(
    (value) =>
      [
        value.diagnosis,
        value.sugestive,
        value.treatment,
        value.treatmentPlan,
        value.ekgDiagnosis,
        ...Object.values(value.objective),
        ...Object.values(value.ekg)
      ].some((field) => field.trim() !== ''),
    { message: 'Escribe al menos un dato para guardar el borrador' }
  )

export const EMPTY_EVOLUTION: EvolutionFormData = {
  diagnosis: '',
  sugestive: '',
  treatment: '',
  treatmentPlan: '',
  ekgDiagnosis: '',
  objective: {
    systolicBp: '',
    dyastolicBp: '',
    heartRate: '',
    respiratoryRate: '',
    spo2: '',
    weight: '',
    findings: ''
  },
  ekg: { rs: '', pWave: '', qrs: '', axis: '', qtc: '', observations: '' }
}
