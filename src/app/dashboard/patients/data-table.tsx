'use client'

import { useState } from 'react'
import { matchesSearch } from '@/lib/search'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import { ArrowUpDown, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { PatientListItem } from '@/types/patient'

const PAGE_SIZE = 10

const SORT_OPTIONS: Record<string, { label: string; sorting: SortingState }> = {
  recientes: {
    label: 'Más recientes',
    sorting: [{ id: 'created_at', desc: true }]
  },
  nombre: { label: 'Apellido (A-Z)', sorting: [{ id: 'lastnames', desc: false }] },
  edad: { label: 'Edad (mayor a menor)', sorting: [{ id: 'age', desc: true }] },
  consulta: {
    label: 'Última consulta',
    sorting: [{ id: 'last_visit', desc: true }]
  }
}

const RISK_FILTERS = ['Todos', 'Alto', 'Medio', 'Bajo']

interface DataTableProps {
  columns: ColumnDef<PatientListItem>[]
  data: PatientListItem[]
  /** Texto de búsqueda inicial (viene del buscador de la barra superior: ?q=) */
  initialFilter?: string
}

export function PatientsDataTable({
  columns,
  data,
  initialFilter = ''
}: DataTableProps) {
  const [sortKey, setSortKey] = useState('recientes')
  const [risk, setRisk] = useState('Todos')
  const [globalFilter, setGlobalFilter] = useState(initialFilter)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE })

  const sorting: SortingState = SORT_OPTIONS[sortKey].sorting
  const columnFilters: ColumnFiltersState =
    risk === 'Todos' ? [] : [{ id: 'risk', value: risk }]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value)
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    },
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const { names, lastnames, identification } = row.original
      return matchesSearch(
        `${names} ${lastnames} ${identification ?? ''}`,
        filterValue
      )
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility: { created_at: false }
    }
  })

  const total = table.getFilteredRowModel().rows.length
  const from = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const to = Math.min(total, (pagination.pageIndex + 1) * pagination.pageSize)

  const resetPage = () =>
    setPagination((current) => ({ ...current, pageIndex: 0 }))

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col items-center justify-between gap-4 border-b p-4 sm:flex-row'>
        <div className='relative w-full sm:w-96'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Buscar por nombre o cédula...'
            value={globalFilter}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            aria-label='Buscar paciente'
            className='h-10 bg-card pl-9'
          />
        </div>
        <div className='flex w-full items-center gap-2 sm:w-auto'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='gap-2'>
                <Filter className='size-4' />
                Filtros{risk !== 'Todos' && `: ${risk}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Riesgo</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={risk}
                onValueChange={(value) => {
                  setRisk(value)
                  resetPage()
                }}>
                {RISK_FILTERS.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='gap-2'>
                <ArrowUpDown className='size-4' />
                Ordenar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortKey} onValueChange={setSortKey}>
                {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className='h-11 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className='group'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='px-4 py-3'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className='hover:bg-transparent'>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className='h-24 text-center text-muted-foreground'>
                  No se encontraron pacientes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between border-t p-4'>
        <p className='text-sm text-muted-foreground'>
          Mostrando {from} a {to} de {total} pacientes
        </p>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            Anterior
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
