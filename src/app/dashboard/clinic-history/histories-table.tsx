'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil } from 'lucide-react'
import { deleteClinicHistory } from '@/actions/delete-clinic-history'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchableTable } from '@/components/table/searchable-table'
import type { HistoryListItem } from '@/lib/services/records-service'
import { formatDate } from '@/lib/format-date'

const STATUS_LABEL = { draft: 'Borrador', completed: 'Completada' } as const

const buildColumns = (
  isDoctor: boolean,
  userId: string
): ColumnDef<HistoryListItem>[] => [
  {
    id: 'date',
    header: 'Fecha',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-muted-foreground'>
        {formatDate(row.original.date ?? row.original.created_at)}
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
    id: 'reason',
    header: 'Motivo',
    cell: ({ row }) => (
      <p className='line-clamp-2 max-w-xs text-sm text-muted-foreground'>
        {row.original.reason || '—'}
      </p>
    )
  },
  {
    id: 'diagnosis',
    header: 'Diagnóstico',
    cell: ({ row }) => (
      <p className='line-clamp-2 max-w-xs text-sm'>
        {row.original.diagnosis || '—'}
      </p>
    )
  },
  {
    id: 'status',
    header: 'Estado',
    cell: ({ row }) =>
      row.original.status === 'draft' ? (
        <Badge className='rounded-full border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100'>
          Borrador
        </Badge>
      ) : (
        <Badge className='rounded-full border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
          Completada
        </Badge>
      )
  },
  {
    id: 'actions',
    header: () => <span className='block text-right'>Acciones</span>,
    cell: ({ row }) => {
      const { id, patient_id, status, created_by, patient } = row.original
      const isDraft = status === 'draft'
      // El médico gestiona todo; la secretaria solo edita borradores y elimina los suyos
      const canEdit = isDoctor || isDraft
      const canDelete = isDoctor || (isDraft && created_by === userId)
      const base = `/dashboard/patients/${patient_id}/clinic-history/new?historia=${id}`

      return (
        <div className='flex items-center justify-end gap-1'>
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='gap-1.5 text-primary'>
            <Link href={`${base}&modo=ver`} title='Ver historia'>
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
              <Link
                href={base}
                title={isDraft ? 'Continuar borrador' : 'Editar historia'}>
                <Pencil className='size-4' />
                <span className='hidden lg:inline'>
                  {isDraft ? 'Continuar' : 'Editar'}
                </span>
              </Link>
            </Button>
          )}
          {canDelete && (
            <ConfirmDeleteDialog
              title='Eliminar historia clínica'
              triggerLabel='Eliminar'
              successMessage='Historia clínica eliminada'
              description={
                <>
                  Se eliminará la historia de{' '}
                  <strong>
                    {patient.names} {patient.lastnames}
                  </strong>{' '}
                  con sus antecedentes y exámenes. Esta acción no se puede
                  deshacer. Si tiene evoluciones asociadas, no se podrá
                  eliminar.
                </>
              }
              onConfirm={() => deleteClinicHistory(id)}
            />
          )}
        </div>
      )
    }
  }
]

export function HistoriesTable({
  data,
  isDoctor,
  userId,
  initialSearch
}: {
  data: HistoryListItem[]
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
      noun='historias'
      searchPlaceholder='Buscar por paciente, cédula, motivo o diagnóstico...'
      searchText={(row) =>
        [
          row.patient.names,
          row.patient.lastnames,
          `${row.patient.names} ${row.patient.lastnames}`,
          row.patient.identification,
          row.reason,
          row.diagnosis
        ]
          .filter(Boolean)
          .join(' ')
      }
      emptyMessage='Aún no hay historias clínicas registradas.'
      filter={{
        label: 'Estado',
        options: [STATUS_LABEL.completed, STATUS_LABEL.draft],
        accessor: (row) => STATUS_LABEL[row.status]
      }}
    />
  )
}
