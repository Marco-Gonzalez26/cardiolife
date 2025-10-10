'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Save, Loader2, CalendarIcon } from 'lucide-react'
import {
  calculateAge,
  patientSchema,
  type PatientFormData
} from '@/lib/validations/patient'
import { Calendar } from '../ui/calendar'
import { cn, getDate } from '@/lib/utils'
import { useEffect } from 'react'
import { CreatePatientData } from '@/lib/services/patients-service'

interface PatientFormProps {
  formSubmit: (
    data: PatientFormData | CreatePatientData
  ) => void | Promise<void>
  loading?: boolean
  submitLabel?: string
  defaultValues?: PatientFormData
}

export function PatientForm({
  formSubmit,
  loading = false,
  submitLabel = 'Guardar',
  defaultValues
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
      phoneNumber: defaultValues?.phoneNumber || '',
      job: defaultValues?.job || '',
      email: defaultValues?.email || '',
      age: defaultValues?.age || ''
    }
  })

  const birthdate = useWatch({ name: 'birthdate', control: form.control })

  useEffect(() => {
    if (birthdate) {
      const age = calculateAge(birthdate)
      form.setValue('age', String(age), {
        shouldValidate: false,
        shouldDirty: false
      })
    } else {
      form.setValue('age', '')
    }
  }, [birthdate])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(formSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 '>
          <FormField
            control={form.control}
            name='names'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-neutral-700 font-semibold'>
                  Nombres
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ingresa los nombres'
                    className='border-neutral-300 
                   '
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-red-600' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastnames'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-neutral-700 font-semibold'>
                  Apellidos
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ingresa los apellidos'
                    className='border-neutral-300 '
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-red-600' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='identification'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-neutral-700 font-semibold'>
                  Identificación
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Cédula o identificación'
                    className='border-neutral-300 '
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-red-600' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='birthdate'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel className='text-neutral-700 font-semibold'>
                  Fecha de Nacimiento
                </FormLabel>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}>
                        {field.value
                          ? new Date(field.value).toLocaleDateString('es-ES')
                          : 'Selecciona una fecha'}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='end'>
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
                <FormLabel className='text-neutral-700 font-semibold'>
                  Edad
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Edad del paciente'
                    className='border-neutral-300 '
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-red-600' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phoneNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-neutral-700 font-semibold'>
                  Teléfono
                </FormLabel>
                <FormControl>
                  <Input
                    type='tel'
                    placeholder='Número de teléfono'
                    className='border-neutral-300 '
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-red-600' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='job'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-neutral-700 font-semibold'>
                  Ocupación
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ocupación o profesión'
                    className='border-neutral-300 '
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-red-600' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-neutral-700 font-semibold'>
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Email del paciente'
                    className='border-neutral-300 '
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-red-600' />
              </FormItem>
            )}
          />
        </div>
        <div className='w-full flex md:justify-end mt-5'>
          <Button
            type='submit'
            disabled={loading}
            className='w-full md:w-fit hover:cursor-pointer '>
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Guardando
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
