'use client'
import { useEffect, useState } from 'react'
import {
  useForm,
  useWatch,
  type FieldErrors
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Activity,
  CalendarIcon,
  ClipboardList,
  FlaskConical,
  Heart,
  History,
  Loader2,
  Pill,
  Save,
  Stethoscope,
  Wind
} from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  clinicHistorySchema,
  type ClinicHistoryFormData
} from '@/lib/validations/clinic-history'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'
import {
  InputField,
  SelectField,
  TextAreaField,
  VitalTile
} from '@/components/forms/fields'
import { formatPickedDate } from '@/lib/format-date'

const TABS = {
  GENERAL: 'general',
  PHYSICAL_EXAM: 'physicalExam',
  PARACLINICAL_EXAM: 'paraclinicalExam',
  ANTECEDENTS: 'antecedents',
  TREATMENT: 'treatment'
} as const

type TabKey = (typeof TABS)[keyof typeof TABS]

const TAB_LABELS: Record<TabKey, string> = {
  general: 'Consulta',
  physicalExam: 'Examen Físico',
  paraclinicalExam: 'Exámenes Paraclínicos',
  antecedents: 'Antecedentes',
  treatment: 'Tratamiento'
}

const ANTECEDENT_FIELDS = [
  { name: 'hta', label: 'Hipertensión Arterial (HTA)' },
  { name: 'diabetes', label: 'Diabetes' },
  { name: 'dyslipidemia', label: 'Dislipidemia' },
  { name: 'heartDisease', label: 'Enfermedad Cardíaca' },
  { name: 'stroke', label: 'Accidente Cerebrovascular (ACV)' },
  { name: 'syncope', label: 'Síncope' },
  { name: 'thyroidDisease', label: 'Enfermedad Tiroidea' },
  { name: 'kidneyDisease', label: 'Enfermedad Renal' },
  { name: 'gastricDisease', label: 'Enfermedad Gástrica' },
  { name: 'cardiovascularDisease', label: 'Enfermedad Cardiovascular' },
  { name: 'neuropathy', label: 'Neuropatía' },
  { name: 'alergies', label: 'Alergias' },
  { name: 'covid', label: 'COVID-19' },
  { name: 'surgeries', label: 'Cirugías' },
  { name: 'cigarette', label: 'Tabaquismo' },
  { name: 'alcohol', label: 'Alcohol' },
  { name: 'drugs', label: 'Drogas' },
  { name: 'exercise', label: 'Ejercicio' },
  { name: 'religion', label: 'Religión' },
  { name: 'father', label: 'Antecedentes Paternos' },
  { name: 'mother', label: 'Antecedentes Maternos' },
  { name: 'cardiac', label: 'Cardíaco' },
  { name: 'cancer', label: 'Cáncer' }
] as const

const CARDIAC_RHYTHMS = ['Regular (Sinusal)', 'Irregular', 'Arritmia']
const MURMURS = ['Ausentes', 'Sistólico', 'Diastólico']

type JsonField = { status: boolean; details: string }

const buildDefaultValues = (
  values?: Partial<ClinicHistoryFormData>
): ClinicHistoryFormData => {
  const antecedents: Record<string, string | JsonField> = {
    currentDisease: values?.antecedents?.currentDisease ?? ''
  }
  for (const { name } of ANTECEDENT_FIELDS) {
    const field = values?.antecedents?.[name] as JsonField | undefined
    antecedents[name] = {
      status: field?.status ?? false,
      details: field?.details ?? ''
    }
  }

  const p = values?.physicalExam
  const c = values?.paraclinicalExam

  return {
    date: values?.date ?? new Date(),
    reason: values?.reason ?? '',
    diagnosis: values?.diagnosis ?? '',
    treatmentPlan: values?.treatmentPlan ?? '',
    antecedents,
    physicalExam: {
      systolicBp: p?.systolicBp ?? '',
      dyastolicBp: p?.dyastolicBp ?? '',
      heartRate: p?.heartRate ?? '',
      respiratoryRate: p?.respiratoryRate ?? '',
      weight: p?.weight ?? '',
      height: p?.height ?? '',
      imc: p?.imc ?? '',
      findings: p?.findings ?? '',
      spo2: p?.spo2 ?? '',
      cardiacRhythm: p?.cardiacRhythm ?? '',
      murmurs: p?.murmurs ?? '',
      lungAuscultation: p?.lungAuscultation ?? ''
    },
    paraclinicalExam: {
      rs: c?.rs ?? '',
      pWave: c?.pWave ?? '',
      bloodPressure: c?.bloodPressure ?? '',
      qrs: c?.qrs ?? '',
      axis: c?.axis ?? '',
      qtc: c?.qtc ?? '',
      ts: c?.ts ?? '',
      observations: c?.observations ?? ''
    }
  } as ClinicHistoryFormData
}

/** Pestaña que contiene el primer error de validación */
const getTabWithError = (
  errors: FieldErrors<ClinicHistoryFormData>
): TabKey => {
  if (errors.date || errors.reason || errors.diagnosis) return TABS.GENERAL
  if (errors.antecedents?.currentDisease) return TABS.GENERAL
  if (errors.physicalExam) return TABS.PHYSICAL_EXAM
  if (errors.paraclinicalExam) return TABS.PARACLINICAL_EXAM
  if (errors.antecedents) return TABS.ANTECEDENTS
  return TABS.TREATMENT
}

interface ClinicHistoryFormProps {
  /** Guarda la historia como completa (solo el médico) */
  handleSubmit: (data: ClinicHistoryFormData) => Promise<void>
  /** Guarda el avance sin validar los campos obligatorios */
  handleSaveDraft: (data: ClinicHistoryFormData) => Promise<void>
  handleCancel: () => void
  isLoading?: boolean
  /** false para secretarias: solo pueden guardar borradores */
  canComplete?: boolean
  /** Historia ya completada que esta persona no puede editar */
  readOnly?: boolean
  defaultValues?: Partial<ClinicHistoryFormData>
  patientId?: string
}

/** Deshabilita todos los controles de la pestaña sin bloquear la navegación entre pestañas */
const Body = ({
  disabled,
  children
}: {
  disabled: boolean
  children: React.ReactNode
}) => (
  <fieldset disabled={disabled} className='m-0 min-w-0 border-0 p-0'>
    {children}
  </fieldset>
)

export const ClinicHistoryForm = ({
  handleSubmit,
  handleSaveDraft,
  isLoading = false,
  canComplete = true,
  readOnly = false,
  defaultValues
}: ClinicHistoryFormProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>(TABS.GENERAL)

  const form = useForm<ClinicHistoryFormData>({
    resolver: zodResolver(clinicHistorySchema),
    defaultValues: buildDefaultValues(defaultValues)
  })

  const watchHeight = useWatch({
    name: 'physicalExam.height',
    control: form.control
  })
  const watchWeight = useWatch({
    name: 'physicalExam.weight',
    control: form.control
  })

  // IMC = peso (kg) / talla (m)²
  useEffect(() => {
    const weight = parseFloat(watchWeight || '0')
    const height = parseFloat(watchHeight || '0')
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100
      form.setValue(
        'physicalExam.imc',
        (weight / (heightInMeters * heightInMeters)).toFixed(2)
      )
    }
  }, [watchWeight, watchHeight, form])

  const onInvalid = (errors: FieldErrors<ClinicHistoryFormData>) => {
    const tab = getTabWithError(errors)
    setActiveTab(tab)
    toast.error(`Faltan campos obligatorios en "${TAB_LABELS[tab]}"`)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
        className='space-y-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h3 className='text-xl font-semibold tracking-tight'>
            Historia Clínica Electrónica
          </h3>
          {!readOnly && (
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={isLoading}
                onClick={() => handleSaveDraft(form.getValues())}>
                Guardar borrador
              </Button>
              {canComplete && (
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className='animate-spin' />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save />
                      Guardar HCE
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabKey)}
          className='w-full'>
          <TabsList className='h-auto flex-wrap justify-start'>
            <TabsTrigger value={TABS.GENERAL} className='gap-2'>
              <ClipboardList className='size-4' />
              {TAB_LABELS.general}
            </TabsTrigger>
            <TabsTrigger value={TABS.PHYSICAL_EXAM} className='gap-2'>
              <Stethoscope className='size-4' />
              {TAB_LABELS.physicalExam}
            </TabsTrigger>
            <TabsTrigger value={TABS.PARACLINICAL_EXAM} className='gap-2'>
              <FlaskConical className='size-4' />
              {TAB_LABELS.paraclinicalExam}
            </TabsTrigger>
            <TabsTrigger value={TABS.ANTECEDENTS} className='gap-2'>
              <History className='size-4' />
              {TAB_LABELS.antecedents}
            </TabsTrigger>
            <TabsTrigger value={TABS.TREATMENT} className='gap-2'>
              <Pill className='size-4' />
              {TAB_LABELS.treatment}
            </TabsTrigger>
          </TabsList>

          {/* Consulta */}
          <TabsContent value={TABS.GENERAL} className='pt-4'>
            <Body disabled={readOnly}>
              <Card className='shadow-sm'>
                <CardContent className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='date'
                    render={({ field }) => (
                      <FormItem className='flex max-w-xs flex-col'>
                        <FormLabel>Fecha de la Historia</FormLabel>
                        <Popover modal>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type='button'
                                variant='outline'
                                className={cn(
                                  'pl-3 text-left font-normal',
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
                              mode='single'
                              selected={field.value}
                              defaultMonth={field.value || new Date()}
                              onSelect={field.onChange}
                              captionLayout='dropdown'
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <TextAreaField
                      form={form}
                      name='reason'
                      label='Motivo de Consulta'
                      placeholder='Describe el motivo de la consulta'
                    />
                    <TextAreaField
                      form={form}
                      name='antecedents.currentDisease'
                      label='Enfermedad Actual'
                      placeholder='Describe la enfermedad actual'
                    />
                  </div>
                  <TextAreaField
                    form={form}
                    name='diagnosis'
                    label='Diagnóstico'
                    placeholder='Diagnóstico de la primera consulta'
                  />
                </CardContent>
              </Card>
            </Body>
          </TabsContent>

          {/* Examen físico */}
          <TabsContent value={TABS.PHYSICAL_EXAM} className='pt-4'>
            <Body disabled={readOnly}>
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                <div className='lg:col-span-4'>
                  <Card className='shadow-sm'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <Activity className='size-5 text-primary' />
                        Signos Vitales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-2 gap-4'>
                        <VitalTile
                          form={form}
                          name='physicalExam.systolicBp'
                          label='Presión Sistólica'
                          unit='mmHg'
                          placeholder='120'
                        />
                        <VitalTile
                          form={form}
                          name='physicalExam.dyastolicBp'
                          label='Presión Diastólica'
                          unit='mmHg'
                          placeholder='80'
                        />
                        <VitalTile
                          form={form}
                          name='physicalExam.heartRate'
                          label='Frec. Cardíaca'
                          unit='lpm'
                          placeholder='70'
                        />
                        <VitalTile
                          form={form}
                          name='physicalExam.spo2'
                          label='Saturación O2'
                          unit='%'
                          placeholder='98'
                        />
                        <VitalTile
                          form={form}
                          name='physicalExam.respiratoryRate'
                          label='Frec. Respiratoria'
                          unit='rpm'
                          placeholder='16'
                        />
                        <VitalTile
                          form={form}
                          name='physicalExam.weight'
                          label='Peso'
                          unit='kg'
                          placeholder='70'
                        />
                        <VitalTile
                          form={form}
                          name='physicalExam.height'
                          label='Altura'
                          unit='cm'
                          placeholder='170'
                        />
                        <VitalTile
                          form={form}
                          name='physicalExam.imc'
                          label='IMC'
                          unit='kg/m²'
                          placeholder='Automático'
                          readOnly
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className='flex flex-col gap-6 lg:col-span-8'>
                  <Card className='shadow-sm'>
                    <CardHeader className='border-b'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <Heart className='size-5 text-sky-500' />
                        Sistema Cardiovascular
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <SelectField
                          form={form}
                          name='physicalExam.cardiacRhythm'
                          label='Ritmo Cardíaco'
                          options={CARDIAC_RHYTHMS}
                        />
                        <SelectField
                          form={form}
                          name='physicalExam.murmurs'
                          label='Soplos'
                          options={MURMURS}
                        />
                      </div>
                      <TextAreaField
                        form={form}
                        name='physicalExam.findings'
                        label='Hallazgos Detallados'
                        placeholder='Describa ruidos cardíacos, ingurgitación yugular, edema periférico, etc.'
                        className='min-h-[120px]'
                      />
                    </CardContent>
                  </Card>

                  <Card className='shadow-sm'>
                    <CardHeader className='border-b'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <Wind className='size-5 text-sky-500' />
                        Sistema Respiratorio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TextAreaField
                        form={form}
                        name='physicalExam.lungAuscultation'
                        label='Auscultación Pulmonar'
                        placeholder='Murmullo vesicular, estertores, sibilancias...'
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Body>
          </TabsContent>

          {/* Exámenes paraclínicos (EKG) */}
          <TabsContent value={TABS.PARACLINICAL_EXAM} className='pt-4'>
            <Body disabled={readOnly}>
              <Card className='shadow-sm'>
                <CardHeader className='border-b'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <FlaskConical className='size-5 text-primary' />
                    Electrocardiograma (EKG)
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    <InputField
                      form={form}
                      name='paraclinicalExam.rs'
                      label='RS'
                      placeholder='RS'
                    />
                    <InputField
                      form={form}
                      name='paraclinicalExam.pWave'
                      label='Onda P'
                      placeholder='Onda P'
                    />
                    <InputField
                      form={form}
                      name='paraclinicalExam.bloodPressure'
                      label='Presión Arterial'
                      placeholder='120/80'
                    />
                    <InputField
                      form={form}
                      name='paraclinicalExam.qrs'
                      label='QRS'
                      placeholder='QRS'
                    />
                    <InputField
                      form={form}
                      name='paraclinicalExam.axis'
                      label='Eje'
                      placeholder='Eje'
                    />
                    <InputField
                      form={form}
                      name='paraclinicalExam.qtc'
                      label='QTc'
                      placeholder='QTc'
                    />
                    <InputField
                      form={form}
                      name='paraclinicalExam.ts'
                      label='TS'
                      placeholder='TS'
                    />
                  </div>
                  <TextAreaField
                    form={form}
                    name='paraclinicalExam.observations'
                    label='Observaciones'
                    placeholder='Observaciones del examen paraclínico'
                    className='min-h-[120px]'
                  />
                </CardContent>
              </Card>
            </Body>
          </TabsContent>

          {/* Antecedentes */}
          <TabsContent value={TABS.ANTECEDENTS} className='pt-4'>
            <Body disabled={readOnly}>
              <Card className='shadow-sm'>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {ANTECEDENT_FIELDS.map((item) => (
                      <div
                        key={item.name}
                        className='space-y-3 rounded-lg border bg-background p-4'>
                        <FormField
                          control={form.control}
                          name={`antecedents.${item.name}.status`}
                          render={({ field }) => (
                            <FormItem className='flex items-center gap-2 space-y-0'>
                              <FormControl>
                                <Checkbox
                                  checked={Boolean(field.value)}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className='cursor-pointer font-medium'>
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`antecedents.${item.name}.details`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder='Detalles'
                                  disabled={
                                    !form.watch(
                                      `antecedents.${item.name}.status`
                                    )
                                  }
                                  className='text-sm'
                                  {...field}
                                  value={(field.value as string) ?? ''}
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
            </Body>
          </TabsContent>

          {/* Tratamiento */}
          <TabsContent value={TABS.TREATMENT} className='pt-4'>
            <Body disabled={readOnly}>
              <Card className='shadow-sm'>
                <CardContent>
                  <TextAreaField
                    form={form}
                    name='treatmentPlan'
                    label='Plan de Tratamiento'
                    placeholder='Describe el plan de tratamiento'
                    className='min-h-[160px]'
                  />
                </CardContent>
              </Card>
            </Body>
          </TabsContent>
        </Tabs>

        {!canComplete && !readOnly && (
          <p className='text-sm text-muted-foreground'>
            Puedes guardar la historia como borrador. Solo el médico puede
            completarla.
          </p>
        )}
      </form>
    </Form>
  )
}
