'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AppSection } from '@/components/app-section'
import { PatientForm } from '@/components/forms/patient-form'
import { Card, CardContent } from '@/components/ui/card'
import { updatePatient } from '@/lib/services/patients-service'
import type { PatientFormData } from '@/lib/validations/patient'
import type { UpdatePatientData } from '@/types/patient'

export const EditPatient = ({
  id,
  patient
}: {
  id: string
  patient: PatientFormData
}) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: unknown) => {
    setIsLoading(true)
    try {
      const result = await updatePatient(id, data as unknown as UpdatePatientData)

      if (result.error || !result.patient) {
        toast.error(result.error ?? 'Error al editar el paciente')
        return
      }
      toast.success('Paciente editado exitosamente')
      router.push(`/dashboard/patients/${id}`)
    } catch {
      toast.error('Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppSection>
      <Card className='mx-auto w-full max-w-3xl rounded-2xl shadow-sm'>
        <CardContent className='space-y-6 p-2 md:p-6'>
          <div className='border-b pb-4'>
            <h1 className='text-3xl font-semibold tracking-tight text-primary'>
              Editar Paciente
            </h1>
            <p className='mt-2 text-muted-foreground'>
              Actualice los datos del perfil del paciente.
            </p>
          </div>
          <PatientForm
            formSubmit={handleSubmit}
            loading={isLoading}
            submitLabel='Guardar cambios'
            defaultValues={patient}
            onCancel={() => router.push(`/dashboard/patients/${id}`)}
          />
        </CardContent>
      </Card>
    </AppSection>
  )
}
