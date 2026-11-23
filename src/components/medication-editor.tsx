'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { saveMedication } from '@/actions/medications'
import { AppSection } from '@/components/app-section'
import { MedicationForm } from '@/components/forms/medication-form'
import { Button } from '@/components/ui/button'
import type { CategoryOption } from '@/lib/services/catalog-service'
import type { MedicationFormData } from '@/lib/validations/medication'

interface MedicationEditorProps {
  medicationId?: string
  defaultValues: MedicationFormData
  categories: CategoryOption[]
}

export const MedicationEditor = ({
  medicationId,
  defaultValues,
  categories
}: MedicationEditorProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(medicationId)
  const backHref = medicationId
    ? `/dashboard/medications/${medicationId}`
    : '/dashboard/medications'

  const handleSubmit = async (data: MedicationFormData) => {
    setLoading(true)
    try {
      const result = await saveMedication(medicationId ?? null, data)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(isEdit ? 'Medicamento actualizado' : 'Medicamento creado')
      router.push(`/dashboard/medications/${result.id}`)
    } catch {
      toast.error('No se pudo guardar el medicamento')
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
            {isEdit ? 'Editar Medicamento' : 'Nuevo Medicamento'}
          </h1>
          <p className='mt-1 text-muted-foreground'>
            {isEdit
              ? 'Las recetas ya emitidas conservan los datos con que se recetaron.'
              : 'Agrega el medicamento con sus presentaciones para poder recetarlo.'}
          </p>
        </div>
        <MedicationForm
          defaultValues={defaultValues}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => router.push(backHref)}
          loading={loading}
          submitLabel={isEdit ? 'Guardar cambios' : 'Crear medicamento'}
        />
      </div>
    </AppSection>
  )
}
