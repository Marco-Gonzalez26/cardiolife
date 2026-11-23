import * as z from 'zod'

export const prescriptionLineSchema = z.object({
  medicationId: z.uuid(),
  presentationId: z.uuid(),
  customFrequency: z.string(),
  customDuration: z.string(),
  customInstructions: z.string(),
  quantityAmount: z
    .number('Ingrese la cantidad')
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad mínima es 1'),
  quantityUnit: z.string().min(1, 'Ingrese la unidad')
})

export const prescriptionSchema = z.object({
  patientId: z.uuid('Seleccione un paciente'),
  /** La norma pide el diagnóstico en la receta */
  diagnosis: z.string().trim().min(1, 'Ingrese el diagnóstico'),
  /** Código CIE-10 (opcional), por ejemplo I10 */
  diagnosisCode: z.string(),
  lines: z.array(prescriptionLineSchema).min(1, 'Agregue al menos un medicamento')
})

export type PrescriptionLineData = z.infer<typeof prescriptionLineSchema>
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>

/** Unidades en que se despacha un medicamento (se sugieren según la forma farmacéutica) */
export const QUANTITY_UNITS = [
  'tabletas',
  'cápsulas',
  'ampollas',
  'frascos',
  'sobres',
  'unidades'
] as const
