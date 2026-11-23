'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { savePrescription } from '@/actions/prescriptions'
import { AppSection } from '@/components/app-section'
import { RecipeForm } from '@/components/forms/recipe-form'
import { Button } from '@/components/ui/button'
import type { AppointmentPatient } from '@/lib/services/appointments-service'
import type { RecipeMedication } from '@/lib/services/catalog-service'
import type { PrescriptionFormData } from '@/lib/validations/prescription'

interface RecipeEditorProps {
  patients: AppointmentPatient[]
  medications: RecipeMedication[]
  defaultValues: PrescriptionFormData
  /** Presente al editar una receta existente */
  groupId?: string
  fallbackLabels?: Record<string, string>
}

export const RecipeEditor = ({
  patients,
  medications,
  defaultValues,
  groupId,
  fallbackLabels
}: RecipeEditorProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(groupId)
  const backHref = groupId ? `/dashboard/recipes/${groupId}` : '/dashboard/recipes'

  const handleSubmit = async (data: PrescriptionFormData) => {
    setLoading(true)
    try {
      const result = await savePrescription(groupId ?? null, data)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(isEdit ? 'Receta actualizada' : 'Receta emitida')
      router.push(`/dashboard/recipes/${result.groupId}`)
    } catch {
      toast.error('No se pudo guardar la receta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppSection>
      <div className='mx-auto w-full max-w-4xl space-y-6'>
        <Button asChild variant='ghost' className='-ml-3'>
          <Link href={backHref}>
            <ArrowLeft />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {isEdit ? 'Editar Receta' : 'Nueva Receta'}
          </h1>
          <p className='mt-1 text-muted-foreground'>
            Al guardar podrás ver la vista previa y descargar el PDF.
          </p>
        </div>
        <RecipeForm
          patients={patients}
          medications={medications}
          defaultValues={defaultValues}
          lockPatient={isEdit}
          fallbackLabels={fallbackLabels}
          onSubmit={handleSubmit}
          onCancel={() => router.push(backHref)}
          loading={loading}
          submitLabel={isEdit ? 'Guardar cambios' : 'Emitir receta'}
        />
      </div>
    </AppSection>
  )
}
