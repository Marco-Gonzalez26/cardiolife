'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2, Save } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  calculateAge,
  patientSchema,
  type PatientFormData
} from '@/lib/validations/patient'
import { Calendar } from '../ui/calendar'
import { cn } from '@/lib/utils'
import type { CreatePatientData } from '@/types/patient'
import { formatPickedDate } from '@/lib/format-date'

interface PatientFormProps {
  formSubmit: (
    data: PatientFormData | CreatePatientData
  ) => void | Promise<void>
  loading?: boolean
  submitLabel?: string
  defaultValues?: PatientFormData
  onCancel?: () => void
}

/** Campo relleno sin borde (estilo de Stitch): al enfocar se vuelve blanco con aro sky */
const FIELD_CLASS =
  'h-11 rounded-lg border-0 bg-muted px-4 shadow-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring dark:bg-muted'

export function PatientForm({
  formSubmit,
  loading = false,
  submitLabel = 'Guardar',
  defaultValues,
  onCancel
}: PatientFormProps) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      names: defaultValues?.names || '',
      lastnames: defaultValues?.lastnames || '',
      identification: defaultValues?.identification || '',
      birthdate: defaultValues?.birthdate
        ? new Date(defaultValues?.birthdate)
        : new Date(),
      phone_number: defaultValues?.phone_number || '',
      job: defaultValues?.job || '',
      email: defaultValues?.email || '',
      age: defaultValues?.age || ''
    }
  })

  const birthdate = useWatch({ name: 'birthdate', control: form.control })

  useEffect(() => {
    if (birthdate) {
      form.setValue('age', String(calculateAge(birthdate)), {
        shouldValidate: false,
        shouldDirty: false
      })
    } else {
      form.setValue('age', '')
    }
  }, [birthdate, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(formSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='names'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold'>Nombres</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ej. Juan Carlos'
                    className={FIELD_CLASS}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastnames'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold'>Apellidos</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ej. Pérez López'
                    className={FIELD_CLASS}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='identification'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold'>
                  Cédula de Identidad
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ej. 1712345678'
                    className={FIELD_CLASS}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='birthdate'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel className='font-semibold'>
                  Fecha de Nacimiento
                </FormLabel>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type='button'
                        variant='ghost'
                        className={cn(
                          FIELD_CLASS,
                          'justify-start text-left font-normal hover:bg-muted',
                          !field.value && 'text-muted-foreground'
                        )}>
                        {field.value
                          ? formatPickedDate(new Date(field.value))
                          : 'Selecciona una fecha'}
                        <CalendarIcon className='ml-auto size-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      hideNavigation
                      mode='single'
                      selected={field.value ? new Date(field.value) : undefined}
                      startMonth={new Date(1900, 0)}
                      endMonth={new Date(new Date().getFullYear(), 11)}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      captionLayout='dropdown'
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='age'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold'>
                  Edad (se calcula sola)
                </FormLabel>
                <FormControl>
                  <Input
                    readOnly
                    placeholder='Según la fecha de nacimiento'
                    className={cn(FIELD_CLASS, 'text-muted-foreground')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phone_number'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold'>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    type='tel'
                    placeholder='Ej. 0991234567'
                    className={FIELD_CLASS}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='job'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold'>Ocupación</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ocupación o profesión'
                    className={FIELD_CLASS}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold'>
                  Correo Electrónico
                </FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='juan.perez@ejemplo.com'
                    className={FIELD_CLASS}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex items-center justify-end gap-3 border-t pt-6'>
          {onCancel && (
            <Button
              type='button'
              variant='ghost'
              onClick={onCancel}
              className='font-semibold text-primary hover:text-primary'>
              Cancelar
            </Button>
          )}
          <Button
            type='submit'
            disabled={loading}
            className='bg-emerald-500 font-semibold text-white hover:bg-emerald-600'>
            {loading ? (
              <>
                <Loader2 className='animate-spin' />
                Guardando
              </>
            ) : (
              <>
                <Save />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
