import * as z from 'zod'

export const secretarySchema = z.object({
  fullName: z.string().trim().min(3, 'Ingresa el nombre completo'),
  email: z.email('Correo electrónico inválido'),
  password: z.string().min(10, 'La contraseña debe tener al menos 10 caracteres')
})

export type SecretaryFormData = z.infer<typeof secretarySchema>

export const passwordSchema = secretarySchema.shape.password
