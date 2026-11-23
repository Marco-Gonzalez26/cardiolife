'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil } from 'lucide-react'
import { deleteEvolution } from '@/actions/evolutions'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchableTable } from '@/components/table/searchable-table'
import type { EvolutionListItem } from '@/lib/services/records-service'
import { formatDate } from '@/lib/format-date'

const Cell = ({ children }: { children: string | null }) => (
  <p className='line-clamp-2 max-w-xs text-sm'>{children || '—'}</p>
)

const buildColumns = (
  isDoctor: boolean,
  userId: string
): ColumnDef<EvolutionListItem>[] => [
  {
    id: 'date',
    header: 'Fecha',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-muted-foreground'>
        {formatDate(row.original.created_at)}
      </span>
    )
  },
  {
    id: 'patient',
    header: 'Paciente',
    cell: ({ row }) => {
      const { patient, patient_id } = row.original
      return (
        <div className='flex items-center gap-3'>
          <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground'>
            {`${patient.names[0] ?? ''}${patient.lastnames[0] ?? ''}`.toUpperCase()}
          </div>
          <div className='min-w-0'>
            <Link
              href={`/dashboard/patients/${patient_id}`}
              className='block truncate font-semibold hover:text-primary'>
              {patient.names} {patient.lastnames}
            </Link>
            <p className='truncate text-xs text-muted-foreground'>
              {patient.identification || 'Sin cédula'}
            </p>
          </div>
        </div>
      )
    }
  },
  {
    id: 'diagnosis',
    header: 'Diagnóstico',
    cell: ({ row }) => <Cell>{row.original.diagnosis}</Cell>
  },
  {
    id: 'status',
    header: 'Estado',
    cell: ({ row }) =>
      row.original.status === 'draft' ? (
        <Badge variant='secondary'>Borrador</Badge>
      ) : (
        <Badge className='bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
          Completada
        </Badge>
      )
  },
  {
    id: 'treatment',
    header: 'Tratamiento',
    cell: ({ row }) => <Cell>{row.original.treatment}</Cell>
  },
  {
    id: 'ekg',
    header: 'Diagnóstico EKG',
    cell: ({ row }) => <Cell>{row.original.ekg_diagnosis}</Cell>
  },
  {
    id: 'actions',
    header: () => <span className='block text-right'>Acciones</span>,
    cell: ({ row }) => {
      const { id, patient_id, patient, status, created_by } = row.original
      // Médico: todo. Secretaria: edita borradores y elimina solo los suyos
      const canEdit = isDoctor || status === 'draft'
      const canDelete = isDoctor || (status === 'draft' && created_by === userId)
      const base = `/dashboard/patients/${patient_id}/evolutions/${id}`
      return (
        <div className='flex items-center justify-end gap-1'>
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='gap-1.5 text-primary'>
            <Link href={base} title='Ver evolución'>
              <Eye className='size-4' />
              <span className='hidden lg:inline'>Ver</span>
            </Link>
          </Button>
          {canEdit && (
              <Button
                asChild
                variant='ghost'
                size='sm'
                className='gap-1.5 text-muted-foreground'>
                <Link href={`${base}?modo=editar`} title='Editar evolución'>
                  <Pencil className='size-4' />
                  <span className='hidden lg:inline'>Editar</span>
                </Link>
              </Button>
          )}
          {canDelete && (
              <ConfirmDeleteDialog
                title='Eliminar evolución'
                triggerLabel='Eliminar'
                successMessage='Evolución eliminada'
                description={
                  <>
                    Se eliminará la evolución de{' '}
                    <strong>
                      {patient.names} {patient.lastnames}
                    </strong>
                    . Esta acción no se puede deshacer.
                  </>
                }
                onConfirm={() => deleteEvolution(id)}
              />
          )}
        </div>
      )
    }
  }
]

export function EvolutionsTable({
  data,
  isDoctor,
  userId,
  initialSearch
}: {
  data: EvolutionListItem[]
  isDoctor: boolean
  userId: string
  initialSearch?: string
}) {
  const columns = useMemo(
    () => buildColumns(isDoctor, userId),
    [isDoctor, userId]
  )
  return (
    <SearchableTable
      columns={columns}
      data={data}
      initialSearch={initialSearch}
      noun='evoluciones'
      searchPlaceholder='Buscar por paciente, cédula, diagnóstico o tratamiento...'
      searchText={(row) =>
        [
          row.patient.names,
          row.patient.lastnames,
          `${row.patient.names} ${row.patient.lastnames}`,
          row.patient.identification,
          row.diagnosis,
          row.treatment,
          row.treatment_plan,
          row.ekg_diagnosis
        ]
          .filter(Boolean)
          .join(' ')
      }
      emptyMessage='Aún no hay evoluciones registradas.'
    />
  )
}
