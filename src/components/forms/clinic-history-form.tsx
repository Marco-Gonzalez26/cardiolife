/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { use, useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Save, Loader2, CalendarIcon } from 'lucide-react'
import {
  clinicHistorySchema,
  type ClinicHistoryFormData
} from '@/lib/validations/clinic-history'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'

const TABS = {
  GENERAL: 'general',
  ANTECEDENTS: 'antecedents',
  PHYSICAL_EXAM: 'physicalExam',
  PARACLINICAL_EXAM: 'paraclinicalExam',
  TREATMENT: 'treatment'
}
interface ClinicHistoryFormProps {
  handleSubmit: (data: ClinicHistoryFormData) => Promise<void>
  handleCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<ClinicHistoryFormData>
  patientId?: string
}

export const ClinicHistoryForm = ({
  handleSubmit,
  handleCancel,
  isLoading = false,
  defaultValues,
  patientId
}: ClinicHistoryFormProps) => {
  const [activeTab, setActiveTab] = useState(TABS.GENERAL)

  const form = useForm<ClinicHistoryFormData>({
    mode: 'onChange',
    resolver: zodResolver(clinicHistorySchema),

    defaultValues: {
      date: defaultValues?.date || new Date().toISOString().split('T')[0],
      reason: defaultValues?.reason || '',
      treatmentPlan: defaultValues?.treatmentPlan || '',
      antecedents: {
        currentDisease: '',
        hta: {
          status: defaultValues?.antecedents?.hta?.status || false,
          details: defaultValues?.antecedents?.hta?.details || ''
        },
        cigarette: {
          status: defaultValues?.antecedents?.cigarette?.status || false,
          details: defaultValues?.antecedents?.cigarette?.details || ''
        },
        exercise: {
          status: defaultValues?.antecedents?.exercise?.status || false,
          details: defaultValues?.antecedents?.exercise?.details || ''
        },
        religion: {
          status: defaultValues?.antecedents?.religion?.status || false,
          details: defaultValues?.antecedents?.religion?.details || ''
        },
        alcohol: {
          status: defaultValues?.antecedents?.alcohol?.status || false,
          details: defaultValues?.antecedents?.alcohol?.details || ''
        },
        stroke: {
          status: defaultValues?.antecedents?.stroke?.status || false,
          details: defaultValues?.antecedents?.stroke?.details || ''
        },
        diabetes: {
          status: defaultValues?.antecedents?.diabetes?.status || false,
          details: defaultValues?.antecedents?.diabetes?.details || ''
        },
        cancer: {
          status: defaultValues?.antecedents?.cancer?.status || false,
          details: defaultValues?.antecedents?.cancer?.details || ''
        },
        surgeries: {
          status: defaultValues?.antecedents?.surgeries?.status || false,
          details: defaultValues?.antecedents?.surgeries?.details || ''
        },
        heartDisease: {
          status: defaultValues?.antecedents?.heartDisease?.status || false,
          details: defaultValues?.antecedents?.heartDisease?.details || ''
        },
        dyslipidemia: {
          status: defaultValues?.antecedents?.dyslipidemia?.status || false,
          details: defaultValues?.antecedents?.dyslipidemia?.details || ''
        },
        thyroidDisease: {
          status: defaultValues?.antecedents?.thyroidDisease?.status || false,
          details: defaultValues?.antecedents?.thyroidDisease?.details || ''
        },
        alergies: {
          status: defaultValues?.antecedents?.alergies?.status || false,
          details: defaultValues?.antecedents?.alergies?.details || ''
        },
        covid: {
          status: defaultValues?.antecedents?.covid?.status || false,
          details: defaultValues?.antecedents?.covid?.details || ''
        },
        father: {
          status: defaultValues?.antecedents?.father?.status || false,
          details: defaultValues?.antecedents?.father?.details || ''
        },
        mother: {
          status: defaultValues?.antecedents?.mother?.status || false,
          details: defaultValues?.antecedents?.mother?.details || ''
        },
        gastricDisease: {
          status: defaultValues?.antecedents?.gastricDisease?.status || false,
          details: defaultValues?.antecedents?.gastricDisease?.details || ''
        },
        neuropathy: {
          status: defaultValues?.antecedents?.neuropathy?.status || false,
          details: defaultValues?.antecedents?.neuropathy?.details || ''
        },
        cardiovascularDisease: {
          status:
            defaultValues?.antecedents?.cardiovascularDisease?.status || false,
          details:
            defaultValues?.antecedents?.cardiovascularDisease?.details || ''
        },
        cardiac: {
          status: defaultValues?.antecedents?.cardiac?.status || false,
          details: defaultValues?.antecedents?.cardiac?.details || ''
        },
        kidneyDisease: {
          status: defaultValues?.antecedents?.kidneyDisease?.status || false,
          details: defaultValues?.antecedents?.kidneyDisease?.details || ''
        },
        drugs: {
          status: defaultValues?.antecedents?.drugs?.status || false,
          details: defaultValues?.antecedents?.drugs?.details || ''
        }
      },
      physicalExam: {
        systolicBp: defaultValues?.physicalExam?.systolicBp || '',
        dyastolicBp: defaultValues?.physicalExam?.dyastolicBp || '',
        heartRate: defaultValues?.physicalExam?.heartRate || '',
        respiratoryRate: defaultValues?.physicalExam?.respiratoryRate || '',
        weight: defaultValues?.physicalExam?.weight || '',
        height: defaultValues?.physicalExam?.height || '',
        imc: defaultValues?.physicalExam?.imc || '',
        findings: defaultValues?.physicalExam?.findings || ''
      },
      paraclinicalExam: {
        rs: defaultValues?.paraclinicalExam?.rs || '',
        pWave: defaultValues?.paraclinicalExam?.pWave || '',
        bloodPreassure: defaultValues?.paraclinicalExam?.bloodPreassure || '',
        qrs: defaultValues?.paraclinicalExam?.qrs || '',
        axis: defaultValues?.paraclinicalExam?.axis || '',
        qtc: defaultValues?.paraclinicalExam?.qtc || '',
        ts: defaultValues?.paraclinicalExam?.ts || '',
        observations: defaultValues?.paraclinicalExam?.observations || ''
      }
    } as ClinicHistoryFormData
  })
  const watchHeight = useWatch({
    name: 'physicalExam.height',
    control: form.control
  })
  const watchWeight = useWatch({
    name: 'physicalExam.weight',
    control: form.control
  })
  const isValid = form.formState.isValid
  const calculateIMC = () => {
    const weight = parseFloat(watchWeight || '0')
    const height = parseFloat(watchHeight || '0')
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100
      const imc = (weight / (heightInMeters * heightInMeters)).toFixed(2)
      form.setValue('physicalExam.imc', imc)
    }
  }

  const antecedentFields = [
    { name: 'hta', label: 'Hipertensión Arterial (HTA)' },
    { name: 'diabetes', label: 'Diabetes' },
    { name: 'dyslipidemia', label: 'Dislipidemia' },
    { name: 'heartDisease', label: 'Enfermedad Cardíaca' },
    { name: 'stroke', label: 'Accidente Cerebrovascular (ACV)' },
    { name: 'thyroidDisease', label: 'Enfermedad Tiroidea' },
    { name: 'kidneyDisease', label: 'Enfermedad Renal' },
    { name: 'gastricDisease', label: 'Enfermedad Gástrica' },
    { name: 'cardiovascularDisease', label: 'Enfermedad Cardiovascular' },
    { name: 'neuropathy', label: 'Neuropatía' },
    { name: 'syncope', label: 'Síncope' },
    { name: 'alergies', label: 'Alergias' },
    { name: 'covid', label: 'COVID-19' },
    { name: 'surgeries', label: 'Cirugías' },
    { name: 'cigarrete', label: 'Tabaquismo' },
    { name: 'alcohol', label: 'Alcohol' },
    { name: 'drugs', label: 'Drogas' },
    { name: 'exercise', label: 'Ejercicio' },
    { name: 'religion', label: 'Religión' },
    { name: 'father', label: 'Antecedentes Paternos' },
    { name: 'mother', label: 'Antecedentes Maternos' },
    { name: 'cardiac', label: 'Cardíaco' }
  ]

  useEffect(() => {
    calculateIMC()
  }, [watchWeight, watchHeight])

  const handleFormSubmit = async (values: ClinicHistoryFormData) => {
    console.log('called')
    handleSubmit(values)
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='space-y-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full  grid-cols-2 md:grid-cols-5 bg-transparent'>
            <TabsTrigger
              value={TABS.GENERAL}
              className='data-[state=active]:bg-indigo-900 data-[state=active]:text-white'>
              General
            </TabsTrigger>
            <TabsTrigger
              value={TABS.ANTECEDENTS}
              className='data-[state=active]:bg-indigo-900 data-[state=active]:text-white'>
              Antecedentes
            </TabsTrigger>
            <TabsTrigger
              value={TABS.PHYSICAL_EXAM}
              className='data-[state=active]:bg-indigo-900 data-[state=active]:text-white'>
              Examen Físico
            </TabsTrigger>
            <TabsTrigger
              value={TABS.PARACLINICAL_EXAM}
              className='data-[state=active]:bg-indigo-900 data-[state=active]:text-white'>
              Examen Paraclínico
            </TabsTrigger>
            <TabsTrigger
              value={TABS.TREATMENT}
              className='data-[state=active]:bg-indigo-900 data-[state=active]:text-white'>
              Tratamiento
            </TabsTrigger>
          </TabsList>
          <TabsContent value={TABS.GENERAL} className='w-full pt-8 md:pt-0'>
            <Card>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <FormField
                    control={form.control}
                    name='date'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel className='text-neutral-700 font-semibold'>
                          Fecha de la Historia
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
                                  ? new Date(field.value).toLocaleDateString(
                                      'es-ES'
                                    )
                                  : 'Selecciona una fecha'}
                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='end'>
                            <Calendar
                              hideNavigation
                              mode='single'
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              startMonth={new Date(1900, 0)}
                              endMonth={new Date(new Date().getFullYear(), 11)}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date('1900-01-01')
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
                    name='reason'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>
                          Motivo de Consulta
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Describe el motivo de la consulta'
                            className='border-neutral-300  min-h-[100px] resize-none!'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='antecedents.currentDisease'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>
                          Enfermedad Actual
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Describe la enfermedad actual'
                            className='border-neutral-300 min-h-[100px] resize-none!'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name='treatmentPlan'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>
                          Plan de Tratamiento
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Describe el plan de tratamiento'
                            className='border-neutral-300 min-h-[100px]'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value={TABS.ANTECEDENTS} className='w-full pt-8 md:pt-0'>
            <Card>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {antecedentFields.map((field) => (
                    <div
                      key={field.name}
                      className='space-y-3 p-4 border border-neutral-200 rounded-lg'>
                      {/* Checkbox Field */}
                      <FormField
                        control={form.control}
                        name={`antecedents.${field.name}.status` as any}
                        render={({ field: checkboxField }) => (
                          <FormItem className='flex items-center space-x-2 space-y-0'>
                            <FormControl>
                              <Checkbox
                                checked={checkboxField.value}
                                onCheckedChange={checkboxField.onChange}
                                className='border-neutral-300'
                              />
                            </FormControl>
                            <FormLabel className='text-neutral-700 font-medium cursor-pointer'>
                              {field.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      {/* Details Field - FUERA del FormField anterior */}
                      <FormField
                        control={form.control}
                        name={`antecedents.${field.name}.details` as any}
                        render={({ field: detailsField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder='Detalles'
                                disabled={
                                  !form.watch(
                                    `antecedents.${field.name}.status` as any
                                  )
                                } // 👈 Deshabilitar en lugar de ocultar
                                className='border-neutral-300 text-sm'
                                {...detailsField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent
            value={TABS.PHYSICAL_EXAM}
            className='w-full pt-8 md:pt-0'>
            <Card>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <FormField
                    control={form.control}
                    name='physicalExam.systolicBp'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>
                          Presión Sistólica (mmHg)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='120'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='physicalExam.dyastolicBp'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>
                          Presión Diastólica (mmHg)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='80'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='physicalExam.heartRate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>
                          Frecuencia Cardíaca (lpm)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='70'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='physicalExam.respiratoryRate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>
                          Frecuencia Respiratoria (rpm)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='16'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='physicalExam.weight'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>
                          Peso (kg)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='70'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='physicalExam.height'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>
                          Altura (cm)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='170'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='physicalExam.imc'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>IMC</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Calculado automáticamente'
                            className='border-neutral-300 bg-neutral-50'
                            readOnly
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='physicalExam.findings'
                  render={({ field }) => (
                    <FormItem className='pt-4'>
                      <FormLabel className='text-neutral-700'>
                        Hallazgos del Examen Físico
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Describe los hallazgos del examen físico'
                          className='border-neutral-300  min-h-[120px] resize-none!'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent
            value={TABS.PARACLINICAL_EXAM}
            className='w-full pt-8 md:pt-0'>
            <Card>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <FormField
                    control={form.control}
                    name='paraclinicalExam.rs'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>RS</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='RS'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='paraclinicalExam.pWave'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>
                          Onda P
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Onda P'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='paraclinicalExam.bloodPreassure'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>
                          Presión Arterial
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='120/80'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='paraclinicalExam.qrs'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>QRS</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='QRS'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='paraclinicalExam.axis'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>Eje</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Eje'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='paraclinicalExam.qtc'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>QTc</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='QTc'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='paraclinicalExam.ts'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-700'>TS</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='TS'
                            className='border-neutral-300 '
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='paraclinicalExam.observations'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-neutral-700'>
                        Observaciones
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Observaciones del examen paraclínico'
                          className='border-neutral-300  min-h-[120px] resize-none!'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value={TABS.TREATMENT} className='w-full pt-8 md:pt-0'>
            <Card>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1  gap-6 w-full'>
                  <FormField
                    control={form.control}
                    name='treatmentPlan'
                    render={({ field }) => (
                      <FormItem className='w-full'>
                        <FormLabel className='text-neutral-700'>
                          Plan de Tratamiento
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Describe el plan de tratamiento'
                            className='border-neutral-300 min-h-[100px] w-full resize-none!'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className='flex justify-end gap-4 pt-4 border-t border-neutral-200'>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Guardando...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                Guardar Historia Clínica
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
