'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Pencil } from 'lucide-react'
import { createEvolution, updateEvolution } from '@/actions/evolutions'
import { AppSection } from '@/components/app-section'
import { EvolutionForm } from '@/components/forms/evolution-form'
import {
  PatientHeaderCard,
  type PatientHeader
} from '@/components/patient-header-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type {
  EvolutionFormData,
  EvolutionStatus
} from '@/lib/validations/evolution'
import { formatDate } from '@/lib/format-date'

interface EvolutionEditorProps {
  patientId: string
  patient: PatientHeader
  mode: 'create' | 'edit' | 'view'
  defaultValues: EvolutionFormData
  evolutionId?: string
  /** Fecha (ISO) de registro, para mostrarla al ver o editar */
  createdAt?: string
  /** Si el usuario puede pasar de "ver" a "editar" */
  canEdit?: boolean
  /** Solo el médico completa evoluciones */
  canComplete?: boolean
  /** Estado actual al ver o editar */
  status?: EvolutionStatus
}

const TITLES = {
  create: 'Nueva Evolución',
  edit: 'Editar Evolución',
  view: 'Evolución Clínica'
} as const

export const EvolutionEditor = ({
  patientId,
  patient,
  mode,
  defaultValues,
  evolutionId,
  createdAt,
  canEdit = false,
  canComplete = true,
  status = 'completed'
}: EvolutionEditorProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const viewHref = (id: string) =>
    `/dashboard/patients/${patientId}/evolutions/${id}`

  const save = async (data: EvolutionFormData, target: EvolutionStatus) => {
    setLoading(true)
    try {
      const result =
        mode === 'edit' && evolutionId
          ? await updateEvolution(evolutionId, data, target)
          : await createEvolution(patientId, data, target)

      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(
        target === 'draft'
          ? 'Borrador guardado'
          : mode === 'edit'
            ? 'Evolución actualizada'
            : 'Evolución registrada'
      )
      const id =
        'id' in result && typeof result.id === 'string' ? result.id : evolutionId
      router.push(id ? viewHref(id) : '/dashboard/evolutions')
    } catch {
      toast.error('No se pudo guardar la evolución')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (data: EvolutionFormData) => save(data, 'completed')
  const handleSaveDraft = (data: EvolutionFormData) => save(data, 'draft')
  // Una evolución ya completada no vuelve a borrador
  const canSaveDraft = !(mode === 'edit' && status === 'completed')

  return (
    <AppSection>
      <div className='mx-auto w-full space-y-6'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <Button asChild variant='ghost' className='-ml-3'>
            <Link href='/dashboard/evolutions'>
              <ArrowLeft />
              Volver a evoluciones
            </Link>
          </Button>
          {mode === 'view' && canEdit && evolutionId && (
            <Button asChild variant='outline' className='gap-2 font-semibold'>
              <Link href={`${viewHref(evolutionId)}?modo=editar`}>
                <Pencil className='size-4' />
                Editar
              </Link>
            </Button>
          )}
        </div>

        <PatientHeaderCard
          patient={patient}
          extraBadges={
            createdAt && (
              <Badge variant='secondary'>
                Registrada{' '}
                {formatDate(createdAt)}
              </Badge>
            )
          }
        />

        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-semibold tracking-tight'>{TITLES[mode]}</h1>
          {mode !== 'create' && status === 'draft' && (
            <Badge variant='secondary'>Borrador</Badge>
          )}
        </div>

        <EvolutionForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onSaveDraft={canSaveDraft ? handleSaveDraft : undefined}
          canComplete={canComplete}
          onCancel={() =>
            router.push(
              mode === 'edit' && evolutionId
                ? viewHref(evolutionId)
                : '/dashboard/evolutions'
            )
          }
          loading={loading}
          readOnly={mode === 'view'}
          submitLabel={mode === 'edit' ? 'Guardar cambios' : 'Guardar evolución'}
        />
      </div>
    </AppSection>
  )
}
