'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Activity, ClipboardCheck, Loader2, Save, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import {
  InputField,
  TextAreaField,
  VitalTile
} from '@/components/forms/fields'
import {
  evolutionSchema,
  type EvolutionFormData
} from '@/lib/validations/evolution'

interface EvolutionFormProps {
  defaultValues: EvolutionFormData
  onSubmit: (data: EvolutionFormData) => Promise<void>
  /** Guarda como borrador (sin exigir campos) */
  onSaveDraft?: (data: EvolutionFormData) => Promise<void>
  /** Solo el médico completa; la secretaria únicamente guarda borradores */
  canComplete?: boolean
  onCancel: () => void
  loading?: boolean
  submitLabel?: string
  /** Solo lectura: deshabilita los campos y oculta los botones */
  readOnly?: boolean
}

export const EvolutionForm = ({
  defaultValues,
  onSubmit,
  onSaveDraft,
  canComplete = true,
  onCancel,
  loading = false,
  submitLabel = 'Guardar evolución',
  readOnly = false
}: EvolutionFormProps) => {
  const form = useForm<EvolutionFormData>({
    resolver: zodResolver(evolutionSchema),
    defaultValues
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, () =>
          toast.error('Faltan campos obligatorios: diagnóstico y plan de tratamiento')
        )}
        className='space-y-6'>
        <fieldset disabled={readOnly} className='m-0 min-w-0 space-y-6 border-0 p-0'>
          <Card className='shadow-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Activity className='size-5 text-primary' />
                Signos Vitales
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
                <VitalTile
                  form={form}
                  name='objective.systolicBp'
                  label='Presión Sistólica'
                  unit='mmHg'
                  placeholder='120'
                />
                <VitalTile
                  form={form}
                  name='objective.dyastolicBp'
                  label='Presión Diastólica'
                  unit='mmHg'
                  placeholder='80'
                />
                <VitalTile
                  form={form}
                  name='objective.heartRate'
                  label='Frec. Cardíaca'
                  unit='lpm'
                  placeholder='70'
                />
                <VitalTile
                  form={form}
                  name='objective.respiratoryRate'
                  label='Frec. Respiratoria'
                  unit='rpm'
                  placeholder='16'
                />
                <VitalTile
                  form={form}
                  name='objective.spo2'
                  label='Saturación O2'
                  unit='%'
                  placeholder='98'
                />
                <VitalTile
                  form={form}
                  name='objective.weight'
                  label='Peso'
                  unit='kg'
                  placeholder='70'
                />
              </div>
              <TextAreaField
                form={form}
                name='objective.findings'
                label='Hallazgos del examen físico'
                placeholder='Describa los hallazgos relevantes de esta consulta'
              />
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Stethoscope className='size-5 text-primary' />
                Electrocardiograma (EKG)
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <InputField form={form} name='ekg.rs' label='RS' placeholder='RS' />
                <InputField
                  form={form}
                  name='ekg.pWave'
                  label='Onda P'
                  placeholder='Onda P'
                />
                <InputField form={form} name='ekg.qrs' label='QRS' placeholder='QRS' />
                <InputField form={form} name='ekg.axis' label='Eje' placeholder='Eje' />
                <InputField form={form} name='ekg.qtc' label='QTc' placeholder='QTc' />
              </div>
              <InputField
                form={form}
                name='ekgDiagnosis'
                label='Diagnóstico EKG'
                placeholder='Interpretación del electrocardiograma'
              />
              <TextAreaField
                form={form}
                name='ekg.observations'
                label='Observaciones'
                placeholder='Observaciones del EKG'
              />
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <ClipboardCheck className='size-5 text-primary' />
                Diagnóstico y Tratamiento
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <TextAreaField
                  form={form}
                  name='diagnosis'
                  label='Diagnóstico'
                  placeholder='Diagnóstico de esta consulta'
                />
                <TextAreaField
                  form={form}
                  name='sugestive'
                  label='Sugestivo'
                  placeholder='Impresión diagnóstica o sospecha'
                />
              </div>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <TextAreaField
                  form={form}
                  name='treatment'
                  label='Tratamiento'
                  placeholder='Medicación e indicaciones actuales'
                />
                <TextAreaField
                  form={form}
                  name='treatmentPlan'
                  label='Plan de tratamiento'
                  placeholder='Plan y seguimiento'
                />
              </div>
            </CardContent>
          </Card>
        </fieldset>

        {!readOnly && (
          <div className='flex items-center justify-end gap-3 border-t pt-6'>
            <Button
              type='button'
              variant='ghost'
              onClick={onCancel}
              className='font-semibold text-primary hover:text-primary'>
              Cancelar
            </Button>
            {onSaveDraft && (
              <Button
                type='button'
                variant='outline'
                disabled={loading}
                onClick={() => onSaveDraft(form.getValues())}
                className='font-semibold'>
                Guardar borrador
              </Button>
            )}
            {canComplete && (
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
            )}
          </div>
        )}
        {!canComplete && !readOnly && (
          <p className='text-right text-sm text-muted-foreground'>
            Puedes guardar la evolución como borrador. Solo el médico puede
            completarla.
          </p>
        )}
      </form>
    </Form>
  )
}
