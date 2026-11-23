'use client'
import { AppSection } from '@/components/app-section'
import { ClinicHistoryForm } from '@/components/forms/clinic-history-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  PatientHeaderCard,
  type PatientHeader
} from '@/components/patient-header-card'
import { saveClinicHistory } from '@/actions/save-clinic-history'
import {
  ClinicHistoryFormData,
  ClinicHistoryStatus
} from '@/lib/validations/clinic-history'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export type ClinicHistoryPatient = PatientHeader

interface NewClinicHistoryProps {
  patientId: string
  patient: ClinicHistoryPatient
  /** Fecha (ISO) de la última historia completada del paciente */
  lastVisit: string | null
  canComplete: boolean
  /** Presente al abrir una historia existente (borrador o completada) */
  clinicHistoryId?: number
  historyStatus?: ClinicHistoryStatus
  readOnly?: boolean
  defaultValues?: Partial<ClinicHistoryFormData>
}

export const NewClinicHistory = ({
  patientId,
  patient,
  lastVisit,
  canComplete,
  clinicHistoryId,
  historyStatus,
  readOnly = false,
  defaultValues
}: NewClinicHistoryProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const save = async (
    values: ClinicHistoryFormData,
    status: ClinicHistoryStatus
  ) => {
    setIsLoading(true)
    try {
      const result = await saveClinicHistory({
        patientId,
        status,
        clinicHistoryId,
        data: values
      })
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(
        status === 'draft'
          ? 'Borrador guardado'
          : 'Historia clínica creada exitosamente'
      )
      router.push(`/dashboard/patients/${patientId}`)
    } catch {
      toast.error('Error al guardar la historia clínica')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (values: ClinicHistoryFormData) =>
    save(values, 'completed')
  const handleSaveDraft = (values: ClinicHistoryFormData) =>
    save(values, 'draft')
  const handleCancel = () => router.push(`/dashboard/patients/${patientId}`)

  return (
    <AppSection>
      <div className='mx-auto w-full space-y-6'>
        <Button asChild variant='ghost' className='-ml-3'>
          <Link href={`/dashboard/patients/${patientId}`}>
            <ArrowLeft />
            Volver al paciente
          </Link>
        </Button>

        <PatientHeaderCard
          patient={patient}
          lastVisit={lastVisit}
          extraBadges={
            <>
              {historyStatus === 'draft' && (
                <Badge variant='secondary'>Borrador</Badge>
              )}
              {historyStatus === 'completed' && (
                <Badge variant='outline'>
                  {readOnly ? 'Completada (solo lectura)' : 'Completada'}
                </Badge>
              )}
            </>
          }
        />

        <ClinicHistoryForm
          handleSubmit={handleSubmit}
          handleSaveDraft={handleSaveDraft}
          handleCancel={handleCancel}
          patientId={patientId}
          isLoading={isLoading}
          canComplete={canComplete}
          readOnly={readOnly}
          defaultValues={defaultValues}
        />
      </div>
    </AppSection>
  )
}
