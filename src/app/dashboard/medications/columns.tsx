'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import {
  MedicationCategoryInterface,
  MedicationInterface
} from '@/lib/services/medications-service'

/*
id: string
  name: string
  genericname: string
  category: MedicationCategoryInterface
  requiresmonitoring: boolean
  notes: string
  warnings: string
  active: boolean
*/

export type ColumnsMedication = MedicationInterface
export const columns: ColumnDef<ColumnsMedication>[] = [
  {
    accessorKey: 'id',
    enableSorting: false,
    header: '',
    cell: () => null
  },
  {
    accessorKey: 'genericname',
    enableColumnFilter: false,
    header: '',
    cell: () => null
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Fecha de creación' />
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      const formattedDate = new Intl.DateTimeFormat('es-EC', {
        dateStyle: 'short'
      }).format(date)

      return <p className='text-center   '>{formattedDate}</p>
    }
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Nombre' />
    },
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return <p className='text-center truncate w-full'>{name}</p>
    }
  },
  {
    accessorKey: 'medicationcategories',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Categoría' />
    },
    cell: ({ row }) => {
      const category = row.getValue(
        'medicationcategories'
      ) as MedicationCategoryInterface
      console.log({ category })
      const categoryName = category?.name || "No tiene categoría" 

      return <p className='text-center truncate w-full'>{categoryName}</p>
    }
  },
  {
    accessorKey: 'active',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Activo' />
    },
    cell: ({ row }) => {
      const active = row.getValue('active') as boolean
      return (
        <p className='text-center truncate w-full'>{active ? 'Si' : 'No'}</p>
      )
    }
  },

  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      const active = row.getValue('active') as boolean
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild title='Abrir menú'>
            <Button variant='ghost' className='h-8 w-full p-0 text-center'>
              <span className='sr-only'>Abrir menú</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/medications/${id}`}>Ver medicamento</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/medications/${id}/edit`}>
                Editar medicamento
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              {active ? (
                <Link
                  href={`/dashboard/medications/${id}/disable`}
                  className='text-red-500 '>
                  Desactivar medicamento
                </Link>
              ) : (
                <Link href={`/dashboard/medications/${id}/enable`}>
                  Activar medicamento
                </Link>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
