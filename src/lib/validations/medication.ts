import * as z from 'zod'

export const MEDICATION_UNITS = ['mg', 'mcg', 'g', 'ml', 'UI', '%'] as const
export const MEDICATION_FORMS = [
  'Tableta',
  'Cápsula',
  'Solución inyectable',
  'Jarabe',
  'Suspensión',
  'Parche',
  'Inhalador'
] as const
export const MEDICATION_ROUTES = [
  'Oral',
  'IV',
  'IM',
  'IV/IM',
  'Sublingual',
  'Tópica',
  'Inhalatoria'
] as const

export const presentationSchema = z.object({
  /** Presente al editar una presentación que ya existe */
  id: z.string().optional(),
  dose: z.string().min(1, 'La dosis es requerida'),
  unit: z.string().min(1, 'Seleccione la unidad'),
  form: z.string().min(1, 'Seleccione la forma'),
  route: z.string().min(1, 'Seleccione la vía'),
  commonFrequency: z.string(),
  standardInstructions: z.string(),
  manufacturer: z.string(),
  price: z
    .string()
    .refine((value) => value === '' || !Number.isNaN(Number(value)), 'Precio inválido'),
  available: z.boolean()
})

export const medicationSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es requerido'),
  genericName: z.string(),
  categoryId: z.string(),
  requiresMonitoring: z.boolean(),
  notes: z.string(),
  warnings: z.string(),
  active: z.boolean(),
  presentations: z
    .array(presentationSchema)
    .min(1, 'Agregue al menos una presentación')
})

export type PresentationFormData = z.infer<typeof presentationSchema>
export type MedicationFormData = z.infer<typeof medicationSchema>

export const EMPTY_PRESENTATION: PresentationFormData = {
  dose: '',
  unit: 'mg',
  form: 'Tableta',
  route: 'Oral',
  commonFrequency: '',
  standardInstructions: '',
  manufacturer: '',
  price: '',
  available: true
}

export const EMPTY_MEDICATION: MedicationFormData = {
  name: '',
  genericName: '',
  categoryId: '',
  requiresMonitoring: false,
  notes: '',
  warnings: '',
  active: true,
  presentations: [EMPTY_PRESENTATION]
}
