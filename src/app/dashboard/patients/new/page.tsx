'use client'
import { AppSection } from '@/components/app-section'
import { PatientForm } from '@/components/forms/patient-form'
import { Heading } from '@/components/heading'
import { toast } from 'sonner'
import type { PatientFormData } from '@/lib/validations/patient'
import { createClient } from '@/lib/supabase/components-client'
import { createPatient } from '@/lib/services/patients-service'
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
export default function NewPatientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const patient = await createPatient(data)

      if (!patient) {
        toast.error('Error al crear el paciente')
        return
      }
      toast.success('Paciente creado exitosamente')
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
      <div className='space-y-6 w-full mx-auto'>
        <Link href='/dashboard/patients'>
          <Button variant='ghost' className='hover:bg-neutral-100'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver
          </Button>
        </Link>
        <div className='flex items-center justify-between'>
          <div>
            <Heading>Nuevo Paciente</Heading>
          </div>
        </div>
        <div className='mt-6'>
          <Card className='border-neutral-200 shadow-sm'>
            <CardHeader>
              <CardDescription className='text-neutral-600'>
                Ingresa la información del nuevo paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientForm
                formSubmit={handleSubmit}
                loading={isLoading}
                submitLabel='Crear Paciente'
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppSection>
  )
}
