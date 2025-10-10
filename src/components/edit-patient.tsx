/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { AppSection } from '@/components/app-section'
import { PatientForm } from '@/components/forms/patient-form'
import { Heading } from '@/components/heading'
import { toast } from 'sonner'
import type { PatientFormData } from '@/lib/validations/patient'
import { createClient } from '@/lib/supabase/components-client'
import { createPatient, updatePatient } from '@/lib/services/patients-service'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader
} from '@/components/ui/card'

export const EditPatient = ({
  id,
  patient
}: {
  id: string
  patient: PatientFormData
}) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const patient = await updatePatient(id, data)

      if (!patient) {
        toast.error('Error al editar el paciente')
        return
      }
      toast.success('Paciente editado exitosamente')
      router.push('/dashboard/patients')
      router.refresh()
    } catch (error) {
      toast.error('Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <AppSection>
      <div className='space-y-6  w-full mx-auto'>
        <Link href='/dashboard/patients'>
          <Button variant='ghost' className='hover:bg-neutral-100'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver
          </Button>
        </Link>
        <div className='flex items-center justify-between'>
          <div>
            <Heading>Editar Paciente</Heading>
          </div>
        </div>
        <div className='mt-6'>
          <Card className='border-neutral-200 shadow-sm'>
            <CardHeader>
              <CardDescription className='text-neutral-600'>
                Información del paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientForm
                formSubmit={handleSubmit}
                loading={isLoading}
                submitLabel='Editar Paciente'
                defaultValues={patient}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppSection>
  )
}
