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
import { getClinicHistoryByPatientId } from '@/lib/services/clinic-history-service'

export type ColumnsPatient = {
  id: string
  created_at: string
  names: string
  identification: string
  age: string
  phone_number: string
  lastnames: string
}

export const columns: ColumnDef<ColumnsPatient>[] = [
  {
    accessorKey: 'id',
    enableSorting: false,
    header: '',
    cell: ({ row }) => {}
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
    accessorKey: 'names',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Nombres' />
    },
    cell: ({ row }) => {
      const names = row.getValue('names') as string
      return <p className='text-center truncate w-full'>{names}</p>
    }
  },
  {
    accessorKey: 'lastnames',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Apellidos' />
    },
    cell: ({ row }) => {
      const lastnames = row.getValue('lastnames') as string
      return <p className='text-center truncate w-full'>{lastnames}</p>
    }
  },
  {
    accessorKey: 'identification',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Identificación' />
    }
  },
  {
    accessorKey: 'age',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Edad' />
    },
    cell: ({ row }) => {
      const age = row.getValue('age') as string
      return <p className='text-center truncate w-full'>{age}</p>
    }
  },
  {
    accessorKey: 'phone_number',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Teléfono' />
    }
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const identication = row.getValue('identification') as string
      const id = row.getValue('id') as string

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(identication)}>
              Copiar identificación
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/patients/${id}`}>Ver paciente</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/patients/${id}/edit`}>
                Editar paciente
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/patients/${id}/clinic-history`}>
                Historia clínica
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/patients/${id}/clinic-evolution/new`}>
                Crear evolución
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
