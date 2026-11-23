'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Download, Eye, Pencil } from 'lucide-react'
import { deletePrescription } from '@/actions/prescriptions'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { SearchableTable } from '@/components/table/searchable-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PrescriptionGroup } from '@/lib/services/prescriptions-service'
import { formatDate } from '@/lib/format-date'

const buildColumns = (canModify: boolean): ColumnDef<PrescriptionGroup>[] => [
  {
    id: 'date',
    header: 'Fecha',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-muted-foreground'>
        {formatDate(row.original.issuedAt)}
      </span>
    )
  },
  {
    id: 'patient',
    header: 'Paciente',
    cell: ({ row }) => {
      const { patient } = row.original
      return (
        <div className='flex items-center gap-3'>
          <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground'>
            {`${patient.names[0] ?? ''}${patient.lastnames[0] ?? ''}`.toUpperCase()}
          </div>
          <div className='min-w-0'>
            <Link
              href={`/dashboard/patients/${patient.id}`}
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
    id: 'medications',
    header: 'Medicamentos',
    cell: ({ row }) => {
      const lines = row.original.lines
      return (
        <div className='flex max-w-sm flex-wrap gap-1'>
          {lines.slice(0, 3).map((line) => (
            <Badge key={line.id} variant='outline' className='font-normal'>
              {line.medication_snapshot.name} {line.medication_snapshot.dose}{' '}
              {line.medication_snapshot.unit}
            </Badge>
          ))}
          {lines.length > 3 && (
            <Badge variant='secondary'>+{lines.length - 3}</Badge>
          )}
        </div>
      )
    }
  },
  {
    id: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.original.status
      const styles: Record<string, string> = {
        Firmada: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
        Anulada: 'bg-red-100 text-red-800 hover:bg-red-100',
        Activa: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
      }
      return (
        <Badge
          className={`rounded-full border-transparent ${styles[status] ?? styles.Activa}`}>
          {status === 'Activa' ? 'Sin firmar' : status}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    header: () => <span className='block text-right'>Acciones</span>,
    cell: ({ row }) => {
      const { groupId, patient, signedAt } = row.original
      // Una receta firmada es inmutable: solo se puede anular (desde su página)
      const editable = canModify && !signedAt
      return (
        <div className='flex items-center justify-end gap-1'>
          <Button asChild variant='ghost' size='sm' className='gap-1.5 text-primary'>
            <Link href={`/dashboard/recipes/${groupId}`} title='Ver receta'>
              <Eye className='size-4' />
              <span className='hidden xl:inline'>Ver</span>
            </Link>
          </Button>
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='gap-1.5 text-muted-foreground'>
            <a href={`/api/pdf/prescription/${groupId}?download=1`} title='Descargar PDF'>
              <Download className='size-4' />
              <span className='hidden xl:inline'>PDF</span>
            </a>
          </Button>
          {editable && (
            <>
              <Button
                asChild
                variant='ghost'
                size='sm'
                className='gap-1.5 text-muted-foreground'>
                <Link href={`/dashboard/recipes/${groupId}/edit`} title='Editar receta'>
                  <Pencil className='size-4' />
                  <span className='hidden xl:inline'>Editar</span>
                </Link>
              </Button>
              <ConfirmDeleteDialog
                title='Eliminar receta'
                triggerLabel='Eliminar'
                successMessage='Receta eliminada'
                description={
                  <>
                    Se eliminará la receta de{' '}
                    <strong>
                      {patient.names} {patient.lastnames}
                    </strong>
                    . Esta acción no se puede deshacer.
                  </>
                }
                onConfirm={() => deletePrescription(groupId)}
              />
            </>
          )}
        </div>
      )
    }
  }
]

export function RecipesTable({
  data,
  canModify,
  initialSearch
}: {
  data: PrescriptionGroup[]
  canModify: boolean
  initialSearch?: string
}) {
  const columns = useMemo(() => buildColumns(canModify), [canModify])
  return (
    <SearchableTable
      columns={columns}
      data={data}
      initialSearch={initialSearch}
      noun='recetas'
      searchPlaceholder='Buscar por paciente, cédula o medicamento...'
      searchText={(row) =>
        [
          row.patient.names,
          row.patient.lastnames,
          `${row.patient.names} ${row.patient.lastnames}`,
          row.patient.identification,
          ...row.lines.map(
            (line) =>
              `${line.medication_snapshot.name} ${line.medication_snapshot.genericName ?? ''}`
          )
        ]
          .filter(Boolean)
          .join(' ')
      }
      emptyMessage='Aún no hay recetas emitidas.'
    />
  )
}
