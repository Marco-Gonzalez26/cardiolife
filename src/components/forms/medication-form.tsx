'use client'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, PackagePlus, Pill, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { InputField, SelectField, TextAreaField } from '@/components/forms/fields'
import {
  EMPTY_PRESENTATION,
  MEDICATION_FORMS,
  MEDICATION_ROUTES,
  MEDICATION_UNITS,
  medicationSchema,
  type MedicationFormData
} from '@/lib/validations/medication'
import type { CategoryOption } from '@/lib/services/catalog-service'

interface MedicationFormProps {
  defaultValues: MedicationFormData
  categories: CategoryOption[]
  onSubmit: (data: MedicationFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  submitLabel?: string
}

const NO_CATEGORY = '__none__'

export const MedicationForm = ({
  defaultValues,
  categories,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Guardar medicamento'
}: MedicationFormProps) => {
  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues
  })
  const presentations = useFieldArray({
    control: form.control,
    name: 'presentations'
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, () =>
          toast.error('Revisa los campos marcados antes de guardar')
        )}
        className='space-y-6'>
        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Pill className='size-5 text-primary' />
              Datos del medicamento
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <InputField
                form={form}
                name='name'
                label='Nombre comercial'
                placeholder='Ej. AMLODIPINO'
              />
              <InputField
                form={form}
                name='genericName'
                label='Nombre genérico'
                placeholder='Ej. Amlodipino besilato'
              />
              <FormField
                control={form.control}
                name='categoryId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select
                      value={field.value || NO_CATEGORY}
                      onValueChange={(value) =>
                        field.onChange(value === NO_CATEGORY ? '' : value)
                      }>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Seleccionar' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_CATEGORY}>Sin categoría</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex flex-col justify-end gap-3'>
                <FormField
                  control={form.control}
                  name='requiresMonitoring'
                  render={({ field }) => (
                    <FormItem className='flex items-center gap-2 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer'>
                        Requiere monitoreo
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='active'
                  render={({ field }) => (
                    <FormItem className='flex items-center gap-2 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer'>
                        Activo (disponible para recetar)
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <TextAreaField
                form={form}
                name='warnings'
                label='Advertencias'
                placeholder='Efectos adversos, precauciones, interacciones…'
              />
              <TextAreaField
                form={form}
                name='notes'
                label='Notas'
                placeholder='Notas internas del consultorio'
              />
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <PackagePlus className='size-5 text-primary' />
              Presentaciones
            </CardTitle>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => presentations.append({ ...EMPTY_PRESENTATION })}>
              <PackagePlus />
              Agregar presentación
            </Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            {form.formState.errors.presentations?.root?.message && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.presentations.root.message}
              </p>
            )}
            {presentations.fields.map((item, index) => (
              <div
                key={item.id}
                className='space-y-4 rounded-lg border bg-background p-4'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-semibold'>
                    Presentación {index + 1}
                  </p>
                  {presentations.fields.length > 1 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => presentations.remove(index)}
                      className='gap-1.5 text-red-700 hover:bg-red-50 hover:text-red-700'>
                      <Trash2 className='size-4' />
                      Quitar
                    </Button>
                  )}
                </div>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                  <InputField
                    form={form}
                    name={`presentations.${index}.dose`}
                    label='Dosis'
                    placeholder='5'
                  />
                  <SelectField
                    form={form}
                    name={`presentations.${index}.unit`}
                    label='Unidad'
                    options={[...MEDICATION_UNITS]}
                  />
                  <SelectField
                    form={form}
                    name={`presentations.${index}.form`}
                    label='Forma'
                    options={[...MEDICATION_FORMS]}
                  />
                  <SelectField
                    form={form}
                    name={`presentations.${index}.route`}
                    label='Vía'
                    options={[...MEDICATION_ROUTES]}
                  />
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <InputField
                    form={form}
                    name={`presentations.${index}.commonFrequency`}
                    label='Frecuencia habitual'
                    placeholder='1 vez al día'
                  />
                  <InputField
                    form={form}
                    name={`presentations.${index}.standardInstructions`}
                    label='Indicación estándar (sale en la receta)'
                    placeholder='1 TAB de 5mg DÍA - 8 AM'
                  />
                  <InputField
                    form={form}
                    name={`presentations.${index}.manufacturer`}
                    label='Fabricante (opcional)'
                    placeholder='Laboratorio'
                  />
                  <InputField
                    form={form}
                    name={`presentations.${index}.price`}
                    label='Precio (opcional)'
                    placeholder='0.00'
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`presentations.${index}.available`}
                  render={({ field }) => (
                    <FormItem className='flex items-center gap-2 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer'>
                        Disponible para recetar
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className='flex items-center justify-end gap-3 border-t pt-6'>
          <Button
            type='button'
            variant='ghost'
            onClick={onCancel}
            className='font-semibold text-primary hover:text-primary'>
            Cancelar
          </Button>
          <Button type='submit' disabled={loading} className='font-semibold'>
            {loading ? (
              <>
                <Loader2 className='animate-spin' />
                Guardando…
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
