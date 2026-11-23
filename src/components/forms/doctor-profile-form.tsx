'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { updateDoctorProfile } from '@/actions/doctor-profile'
import { InputField } from '@/components/forms/fields'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  doctorProfileSchema,
  type DoctorProfileFormData
} from '@/lib/validations/doctor-profile'

export const DoctorProfileForm = ({
  defaultValues
}: {
  defaultValues: DoctorProfileFormData
}) => {
  const [loading, setLoading] = useState(false)
  const form = useForm<DoctorProfileFormData>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues
  })

  const handleSubmit = async (data: DoctorProfileFormData) => {
    setLoading(true)
    try {
      const result = await updateDoctorProfile(data)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Perfil actualizado')
    } catch {
      toast.error('No se pudo guardar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <InputField
            form={form}
            name='fullName'
            label='Nombre completo (como saldrá en la receta)'
            placeholder='Dr. Juan Pérez'
          />
          <InputField
            form={form}
            name='specialty'
            label='Especialidad'
            placeholder='Cardiólogo'
          />
          <InputField
            form={form}
            name='identification'
            label='RUC'
            placeholder='1710234567001'
          />
          <InputField
            form={form}
            name='license'
            label='Registro profesional'
            placeholder='Número de registro (SENESCYT / MSP)'
          />
          <InputField
            form={form}
            name='phone'
            label='Teléfono'
            placeholder='0999-123-456'
          />
          <InputField
            form={form}
            name='email'
            label='Correo electrónico'
            placeholder='doctor@ejemplo.com'
          />
          <InputField
            form={form}
            name='address'
            label='Dirección del consultorio'
            placeholder='Calle principal y secundaria'
          />
          <InputField
            form={form}
            name='city'
            label='Ciudad'
            placeholder='Santo Domingo - Ecuador'
          />
        </div>
        <div className='flex justify-end border-t pt-6'>
          <Button type='submit' disabled={loading} className='font-semibold'>
            {loading ? (
              <>
                <Loader2 className='animate-spin' />
                Guardando…
              </>
            ) : (
              <>
                <Save />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
