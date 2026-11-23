import * as z from 'zod'

/** Datos del médico que se imprimen en la receta (PDF) */
export const doctorProfileSchema = z.object({
  fullName: z.string().trim().min(3, 'Ingrese el nombre completo (ej. Dr. Juan Pérez)'),
  specialty: z.string(),
  license: z.string(),
  identification: z.string(),
  phone: z.string(),
  email: z.email('Correo electrónico inválido'),
  address: z.string(),
  city: z.string()
})

export type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>
