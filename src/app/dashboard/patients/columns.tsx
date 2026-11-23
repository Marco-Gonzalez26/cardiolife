'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { CalendarPlus, Eye, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PatientListItem } from '@/types/patient'
import { formatDate } from '@/lib/format-date'

export type ColumnsPatient = PatientListItem

const getInitials = (names: string, lastnames: string) =>
  `${names[0] ?? ''}${lastnames[0] ?? ''}`.toUpperCase()

const RISK_STYLES: Record<string, string> = {
  Alto: 'bg-red-100 text-red-800 hover:bg-red-100',
  Medio: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  Bajo: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
}

const ActionLink = ({
  href,
  title,
  className,
  children
}: {
  href: string
  title: string
  className?: string
  children: React.ReactNode
}) => (
  <Button
    asChild
    variant='ghost'
    size='icon'
    title={title}
    className={cn('size-8', className)}>
    <Link href={href} aria-label={title}>
      {children}
    </Link>
  </Button>
)

export const columns: ColumnDef<ColumnsPatient>[] = [
  // Columna oculta: solo sirve para ordenar por "Más recientes"
  {
    accessorKey: 'created_at',
    header: 'Registrado',
    cell: () => null
  },
  {
    accessorKey: 'lastnames',
    header: 'Nombre',
    cell: ({ row }) => {
      const patient = row.original
      return (
        <div className='flex items-center gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground'>
            {getInitials(patient.names, patient.lastnames)}
          </div>
          <div className='min-w-0'>
            <p className='truncate font-semibold text-foreground'>
              {patient.names} {patient.lastnames}
            </p>
            <p className='truncate text-sm text-muted-foreground'>
              {patient.job || patient.phone_number || '—'}
            </p>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'identification',
    header: 'Cédula',
    cell: ({ row }) => (
      <span className='text-muted-foreground'>
        {row.original.identification || '—'}
      </span>
    )
  },
  {
    accessorKey: 'age',
    header: 'Edad',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-muted-foreground'>
        {row.original.age ? `${row.original.age} años` : '—'}
      </span>
    ),
    sortingFn: (a, b) =>
      Number(a.original.age ?? 0) - Number(b.original.age ?? 0)
  },
  {
    accessorKey: 'last_visit',
    header: 'Última consulta',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-muted-foreground'>
        {formatDate(row.original.last_visit) || '—'}
      </span>
    )
  },
  {
    accessorKey: 'risk',
    header: 'Riesgo',
    cell: ({ row }) => {
      const risk = row.original.risk ?? 'Bajo'
      return (
        <Badge
          className={cn(
            'rounded-full border-transparent px-2.5 py-0.5',
            RISK_STYLES[risk] ?? 'bg-slate-100 text-slate-800 hover:bg-slate-100'
          )}>
          {risk}
        </Badge>
      )
    },
    filterFn: (row, columnId, value) =>
      !value || (row.getValue<string | null>(columnId) ?? 'Bajo') === value
  },
  {
    id: 'actions',
    header: () => <span className='block text-right'>Acciones</span>,
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <div className='flex justify-end gap-1 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100'>
          <ActionLink
            href={`/dashboard/patients/${id}`}
            title='Ver ficha del paciente'
            className='text-primary'>
            <Eye />
          </ActionLink>
          <ActionLink
            href={`/dashboard/patients/${id}/edit`}
            title='Editar paciente'
            className='text-muted-foreground'>
            <Pencil />
          </ActionLink>
          <ActionLink
            href={`/dashboard/appointments?paciente=${id}`}
            title='Nueva cita'
            className='text-emerald-700'>
            <CalendarPlus />
          </ActionLink>
        </div>
      )
    }
  }
]
