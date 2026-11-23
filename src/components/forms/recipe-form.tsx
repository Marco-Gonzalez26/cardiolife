'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  AlertTriangle,
  Check,
  ChevronsUpDown,
  Loader2,
  Pill,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  User
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getSuggestedDiagnosis } from '@/actions/prescriptions'
import { InputField, TextAreaField } from '@/components/forms/fields'
import { cn } from '@/lib/utils'
import type { AppointmentPatient } from '@/lib/services/appointments-service'
import type { RecipeMedication } from '@/lib/services/catalog-service'
import {
  prescriptionSchema,
  QUANTITY_UNITS,
  type PrescriptionFormData,
  type PrescriptionLineData
} from '@/lib/validations/prescription'

type Presentation = RecipeMedication['presentations'][number]

interface RecipeFormProps {
  patients: AppointmentPatient[]
  medications: RecipeMedication[]
  defaultValues: PrescriptionFormData
  /** En edición el paciente no se puede cambiar */
  lockPatient?: boolean
  /** Nombre a mostrar de líneas cuyo medicamento ya no está en el catálogo activo (por presentación) */
  fallbackLabels?: Record<string, string>
  onSubmit: (data: PrescriptionFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  submitLabel?: string
}

/** Unidad de despacho sugerida según la forma farmacéutica */
const suggestedUnit = (form: string) => {
  const value = form.toLowerCase()
  if (value.includes('tableta')) return 'tabletas'
  if (value.includes('cápsula') || value.includes('capsula')) return 'cápsulas'
  if (value.includes('inyectable')) return 'ampollas'
  if (value.includes('jarabe') || value.includes('suspensi') || value.includes('inhalador'))
    return 'frascos'
  return 'unidades'
}

const newLine = (
  medication: RecipeMedication,
  presentation: Presentation
): PrescriptionLineData => {
  const unit = suggestedUnit(presentation.form)
  return {
    medicationId: medication.id,
    presentationId: presentation.id,
    customFrequency: presentation.common_frequency ?? '',
    customDuration: '',
    customInstructions: presentation.standard_instructions ?? '',
    quantityAmount: unit === 'tabletas' || unit === 'cápsulas' ? 30 : 1,
    quantityUnit: unit
  }
}

export const RecipeForm = ({
  patients,
  medications,
  defaultValues,
  lockPatient = false,
  fallbackLabels = {},
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Guardar receta'
}: RecipeFormProps) => {
  const [patientOpen, setPatientOpen] = useState(false)
  const [medicationOpen, setMedicationOpen] = useState(false)

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues
  })
  const lines = useFieldArray({ control: form.control, name: 'lines' })

  const catalog = useMemo(() => {
    const map = new Map<
      string,
      { medication: RecipeMedication; presentation: Presentation }
    >()
    for (const medication of medications) {
      for (const presentation of medication.presentations) {
        map.set(presentation.id, { medication, presentation })
      }
    }
    return map
  }, [medications])

  /** Propone el diagnóstico de la última evolución o historia, sin pisar lo que ya se escribió */
  const suggestDiagnosis = async (id: string) => {
    if (form.getValues('diagnosis')) return
    const suggestion = await getSuggestedDiagnosis(id)
    if (suggestion && !form.getValues('diagnosis')) {
      form.setValue('diagnosis', suggestion, { shouldValidate: true })
    }
  }

  useEffect(() => {
    if (defaultValues.patientId && !defaultValues.diagnosis) {
      void suggestDiagnosis(defaultValues.patientId)
    }
    // solo al abrir el formulario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const patientId = form.watch('patientId')
  const selectedPatient = patients.find((patient) => patient.id === patientId)

  const addPresentation = (
    medication: RecipeMedication,
    presentation: Presentation
  ) => {
    if (lines.fields.some((line) => line.presentationId === presentation.id)) {
      toast.info('Ese medicamento ya está en la receta')
      return
    }
    lines.append(newLine(medication, presentation))
    setMedicationOpen(false)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) =>
          toast.error(
            errors.patientId?.message ??
              errors.lines?.message ??
              errors.lines?.root?.message ??
              'Revisa los datos de la receta'
          )
        )}
        className='space-y-6'>
        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <User className='size-5 text-primary' />
              Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='patientId'
              render={({ field }) => (
                <FormItem>
                  <Popover open={patientOpen} onOpenChange={setPatientOpen} modal>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type='button'
                          variant='ghost'
                          role='combobox'
                          disabled={lockPatient}
                          className={cn(
                            'h-11 w-full justify-between rounded-lg bg-muted px-4 font-normal hover:bg-muted md:max-w-md',
                            !selectedPatient && 'text-muted-foreground'
                          )}>
                          {selectedPatient
                            ? `${selectedPatient.names} ${selectedPatient.lastnames}`
                            : 'Buscar paciente…'}
                          <ChevronsUpDown className='size-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-[var(--radix-popover-trigger-width)] p-0'
                      align='start'>
                      <Command>
                        <CommandInput placeholder='Nombre o cédula…' />
                        <CommandList>
                          <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
                          <CommandGroup>
                            {patients.map((patient) => (
                              <CommandItem
                                key={patient.id}
                                value={`${patient.names} ${patient.lastnames} ${patient.identification ?? ''}`}
                                onSelect={() => {
                                  field.onChange(patient.id)
                                  setPatientOpen(false)
                                  void suggestDiagnosis(patient.id)
                                }}>
                                <Check
                                  className={cn(
                                    'size-4',
                                    patient.id === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                <span>
                                  {patient.names} {patient.lastnames}
                                </span>
                                {patient.identification && (
                                  <span className='ml-auto text-xs text-muted-foreground'>
                                    {patient.identification}
                                  </span>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Stethoscope className='size-5 text-primary' />
              Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-[1fr_12rem]'>
              <InputField
                form={form}
                name='diagnosis'
                label='Diagnóstico (se imprime en la receta)'
                placeholder='Ej. Hipertensión arterial esencial'
              />
              <InputField
                form={form}
                name='diagnosisCode'
                label='Código CIE-10 (opcional)'
                placeholder='I10'
              />
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Pill className='size-5 text-primary' />
              Medicamentos ({lines.fields.length})
            </CardTitle>
            <Popover open={medicationOpen} onOpenChange={setMedicationOpen} modal>
              <PopoverTrigger asChild>
                <Button type='button' size='sm' className='gap-1.5'>
                  <Plus className='size-4' />
                  Agregar medicamento
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[min(92vw,26rem)] p-0' align='end'>
                <Command>
                  <CommandInput placeholder='Medicamento, genérico o categoría…' />
                  <CommandList className='max-h-80'>
                    <CommandEmpty>No hay medicamentos que coincidan.</CommandEmpty>
                    {medications.map((medication) => (
                      <CommandGroup
                        key={medication.id}
                        heading={`${medication.name}${medication.category ? ` · ${medication.category}` : ''}`}>
                        {medication.presentations.map((presentation) => (
                          <CommandItem
                            key={presentation.id}
                            value={`${medication.name} ${medication.generic_name ?? ''} ${medication.category ?? ''} ${presentation.dose} ${presentation.unit} ${presentation.form}`}
                            onSelect={() => addPresentation(medication, presentation)}>
                            <span className='font-medium'>
                              {presentation.dose} {presentation.unit}
                            </span>
                            <span className='text-muted-foreground'>
                              {presentation.form} · {presentation.route}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent className='space-y-4'>
            {lines.fields.length === 0 && (
              <p className='py-6 text-center text-sm text-muted-foreground'>
                Agrega al menos un medicamento a la receta.
              </p>
            )}

            {lines.fields.map((line, index) => {
              const meta = catalog.get(line.presentationId)
              const title = meta
                ? `${meta.medication.name} ${meta.presentation.dose} ${meta.presentation.unit}`
                : (fallbackLabels[line.presentationId] ?? 'Medicamento')

              return (
                <div
                  key={line.id}
                  className='space-y-4 rounded-lg border bg-background p-4'>
                  <div className='flex flex-wrap items-start justify-between gap-2'>
                    <div className='space-y-1'>
                      <p className='font-semibold'>
                        {index + 1}. {title}
                      </p>
                      {meta && (
                        <p className='text-xs text-muted-foreground'>
                          {meta.presentation.form} · {meta.presentation.route}
                          {meta.medication.generic_name &&
                            ` · ${meta.medication.generic_name}`}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      {meta?.medication.requires_monitoring && (
                        <Badge className='border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100'>
                          Requiere monitoreo
                        </Badge>
                      )}
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => lines.remove(index)}
                        className='gap-1.5 text-red-700 hover:bg-red-50 hover:text-red-700'>
                        <Trash2 className='size-4' />
                        Quitar
                      </Button>
                    </div>
                  </div>

                  {!meta && (
                    <p className='flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-800'>
                      <AlertTriangle className='size-4 shrink-0' />
                      Este medicamento ya no está disponible en el catálogo. Quítalo
                      para poder guardar la receta.
                    </p>
                  )}
                  {meta?.medication.warnings && (
                    <p className='flex items-start gap-2 rounded-md bg-amber-50 p-2 text-sm text-amber-900'>
                      <AlertTriangle className='mt-0.5 size-4 shrink-0' />
                      {meta.medication.warnings}
                    </p>
                  )}

                  <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                    <FormField
                      control={form.control}
                      name={`lines.${index}.quantityAmount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              value={field.value ?? ''}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ''
                                    ? undefined
                                    : Number(event.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lines.${index}.quantityUnit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidad</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[...new Set<string>([...QUANTITY_UNITS, field.value])]
                                .filter(Boolean)
                                .map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <InputField
                      form={form}
                      name={`lines.${index}.customFrequency`}
                      label='Frecuencia'
                      placeholder='1 vez al día'
                    />
                    <InputField
                      form={form}
                      name={`lines.${index}.customDuration`}
                      label='Duración'
                      placeholder='30 días'
                    />
                  </div>
                  <TextAreaField
                    form={form}
                    name={`lines.${index}.customInstructions`}
                    label='Indicaciones para el paciente'
                    placeholder='Cómo y cuándo tomarlo'
                    className='min-h-[72px]'
                  />
                </div>
              )
            })}
            <Label className='sr-only'>Medicamentos de la receta</Label>
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
