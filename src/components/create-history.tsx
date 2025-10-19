/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import { AppSection } from '@/components/app-section'
import { ClinicHistoryForm } from '@/components/forms/clinic-history-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { createClinicHistory } from '@/lib/services/clinic-history-service'
import { ClinicHistoryFormData } from '@/lib/validations/clinic-history'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export const NewClinicHistory = ({ patientId }: { patientId: string }) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const handleSubmit = async (values: ClinicHistoryFormData): Promise<void> => {
    setIsLoading(true)
    try {
      const clinicHistory = await createClinicHistory({ ...values, patientId })
      if (clinicHistory) {
        toast.success('Historia clínica creada exitosamente')
        router.push(`/dashboard/patients/${patientId}`)
      } else {
        toast.error('Error al crear la historia clínica')
      }
    } catch (error) {
      toast.error('Error al crear la historia clínica')
    } finally {
      setIsLoading(false)
    }
  }
  const handleCancel = async () => {}
  return (
    <AppSection>
      <div className='w-full mx-auto'>
        <div className='mb-6 flex items-center justify-between'>
          <Link href='/dashboard/patients'>
            <Button variant='ghost' className='hover:bg-neutral-100'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Volver a Pacientes
            </Button>
          </Link>
        </div>
        <Card className='border-neutral-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-2xl text-neutral-900'>
              Nueva Historia Clínica
            </CardTitle>
            <CardDescription className='text-neutral-600'>
              Completa todos los datos de la historia clínica del paciente
            </CardDescription>
          </CardHeader>
        </Card>
        <div className='mt-6'>
          <ClinicHistoryForm
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
            patientId={patientId}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AppSection>
  )
}
