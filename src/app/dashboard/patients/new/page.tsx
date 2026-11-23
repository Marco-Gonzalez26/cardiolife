'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AppSection } from '@/components/app-section'
import { PatientForm } from '@/components/forms/patient-form'
import { Card, CardContent } from '@/components/ui/card'
import { createPatient } from '@/lib/services/patients-service'
import type { CreatePatientData } from '@/types/patient'

export default function NewPatientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: unknown) => {
    setIsLoading(true)
    try {
      const patient = await createPatient(data as CreatePatientData)

      if (!patient) {
        toast.error('Error al crear el paciente')
        return
      }
      toast.success('Paciente creado exitosamente')
      router.push('/dashboard/patients')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      )
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
              Registro de Nuevo Paciente
            </h1>
            <p className='mt-2 text-muted-foreground'>
              Ingrese los datos correspondientes para registrar un nuevo perfil
              clínico en el sistema.
            </p>
          </div>
          <PatientForm
            formSubmit={handleSubmit}
            loading={isLoading}
            submitLabel='Guardar'
            onCancel={() => router.push('/dashboard/patients')}
          />
        </CardContent>
      </Card>
    </AppSection>
  )
}
