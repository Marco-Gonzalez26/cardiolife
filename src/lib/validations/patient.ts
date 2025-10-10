import * as z from 'zod'

export const patientSchema = z.object({
  names: z.string().min(1, 'Los nombres son requeridos'),
  lastnames: z.string().min(1, 'Los apellidos son requeridos'),
  identification: z
    .string()
    .min(10, 'La identificación debe tener 10 caracteres'),
  age: z.string().min(2, 'La edad es requerida'),
  phoneNumber: z.string().min(10, 'El número debe tener 10 caracteres'),
  job: z.string().min(2, 'El ocupación es requerida'),
  birthdate: z
    .date()
    .min(new Date('1900-01-01'), 'La fecha de nacimiento es requerida'),
  email: z.email().optional()
})

export type PatientFormData = z.infer<typeof patientSchema>

export const calculateAge = (birthDate: Date) => {
  const today = new Date()
  const age = today.getFullYear() - new Date(birthDate).getFullYear()
  const m = today.getMonth() - new Date(birthDate).getMonth()
  if (m < 0 || (m === 0 && today.getDate() < new Date(birthDate).getDate())) {
    return age - 1
  }
  return age
}
