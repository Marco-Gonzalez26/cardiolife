'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { SearchableTable } from '@/components/table/searchable-table'
import { Badge } from '@/components/ui/badge'
import type { MedicationListItem } from '@/lib/services/catalog-service'
import { MedicationRowActions } from './medication-row-actions'

const NO_CATEGORY = 'Sin categoría'

const buildColumns = (canModify: boolean): ColumnDef<MedicationListItem>[] => [
  {
    id: 'name',
    header: 'Medicamento',
    cell: ({ row }) => {
      const { id, name, generic_name } = row.original
      return (
        <div className='min-w-0'>
          <Link
            href={`/dashboard/medications/${id}`}
            className='block truncate font-semibold hover:text-primary'>
            {name}
          </Link>
          <p className='truncate text-xs text-muted-foreground'>
            {generic_name || '—'}
          </p>
        </div>
      )
    }
  },
  {
    id: 'category',
    header: 'Categoría',
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground'>
        {row.original.category?.name ?? NO_CATEGORY}
      </span>
    )
  },
  {
    id: 'presentations',
    header: 'Presentaciones',
    cell: ({ row }) => {
      const available = row.original.presentations.filter(
        (presentation) => presentation.available !== false
      )
      return (
        <div className='flex max-w-xs flex-wrap gap-1'>
          {available.slice(0, 4).map((presentation) => (
            <Badge key={presentation.id} variant='outline' className='font-normal'>
              {presentation.dose} {presentation.unit}
            </Badge>
          ))}
          {available.length > 4 && (
            <Badge variant='secondary'>+{available.length - 4}</Badge>
          )}
          {available.length === 0 && (
            <span className='text-sm text-muted-foreground'>Ninguna disponible</span>
          )}
        </div>
      )
    }
  },
  {
    id: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <div className='flex flex-wrap gap-1'>
        {row.original.active === false ? (
          <Badge className='border-transparent bg-slate-100 text-slate-700 hover:bg-slate-100'>
            Inactivo
          </Badge>
        ) : (
          <Badge className='border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
            Activo
          </Badge>
        )}
        {row.original.requires_monitoring && (
          <Badge className='border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100'>
            Monitoreo
          </Badge>
        )}
      </div>
    )
  },
  {
    id: 'actions',
    header: () => <span className='block text-right'>Acciones</span>,
    cell: ({ row }) => (
      <MedicationRowActions
        id={row.original.id}
        name={row.original.name}
        active={row.original.active !== false}
        canModify={canModify}
      />
    )
  }
]

export function MedicationsTable({
  data,
  canModify,
  initialSearch
}: {
  data: MedicationListItem[]
  canModify: boolean
  initialSearch?: string
}) {
  const columns = useMemo(() => buildColumns(canModify), [canModify])
  const categories = useMemo(
    () =>
      [...new Set(data.map((item) => item.category?.name ?? NO_CATEGORY))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [data]
  )

  return (
    <SearchableTable
      columns={columns}
      data={data}
      initialSearch={initialSearch}
      noun='medicamentos'
      searchPlaceholder='Buscar por nombre, genérico o categoría...'
      searchText={(row) =>
        [row.name, row.generic_name, row.category?.name].filter(Boolean).join(' ')
      }
      emptyMessage='Aún no hay medicamentos en el catálogo.'
      filter={{
        label: 'Categoría',
        options: categories,
        accessor: (row) => row.category?.name ?? NO_CATEGORY
      }}
    />
  )
}
