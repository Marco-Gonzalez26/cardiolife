'use client'

import { useMemo, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { matchesSearch } from '@/lib/search'
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

const PAGE_SIZE = 10
const ALL = 'Todos'

export interface TableFilter<TData> {
  label: string
  options: string[]
  /** Valor de la fila que se compara con la opción elegida */
  accessor: (row: TData) => string
}

interface SearchableTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  searchPlaceholder: string
  /** Texto de la fila en el que busca el campo de búsqueda */
  searchText: (row: TData) => string
  /** Nombre en plural para el pie de tabla ("historias", "evoluciones"…) */
  noun: string
  emptyMessage: string
  filter?: TableFilter<TData>
  initialSearch?: string
}

/** Tabla con búsqueda, filtro opcional y paginación (todo del lado del cliente) */
export function SearchableTable<TData>({
  columns,
  data,
  searchPlaceholder,
  searchText,
  noun,
  emptyMessage,
  filter,
  initialSearch = ''
}: SearchableTableProps<TData>) {
  const [search, setSearch] = useState(initialSearch)
  const [filterValue, setFilterValue] = useState(ALL)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE
  })

  const filteredByOption = useMemo(
    () =>
      filter && filterValue !== ALL
        ? data.filter((row) => filter.accessor(row) === filterValue)
        : data,
    [data, filter, filterValue]
  )

  const goToFirstPage = () =>
    setPagination((current) => ({ ...current, pageIndex: 0 }))

  const table = useReactTable({
    data: filteredByOption,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onGlobalFilterChange: (value) => {
      setSearch(value)
      goToFirstPage()
    },
    globalFilterFn: (row, _columnId, term: string) =>
      matchesSearch(searchText(row.original), term),
    state: { globalFilter: search, pagination }
  })

  const total = table.getFilteredRowModel().rows.length
  const from = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const to = Math.min(total, (pagination.pageIndex + 1) * pagination.pageSize)

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col items-center justify-between gap-4 border-b p-4 sm:flex-row'>
        <div className='relative w-full sm:w-96'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            aria-label='Buscar'
            className='h-10 bg-card pl-9'
          />
        </div>
        {filter && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='gap-2'>
                <Filter className='size-4' />
                {filter.label}
                {filterValue !== ALL && `: ${filterValue}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filterValue}
                onValueChange={(value) => {
                  setFilterValue(value)
                  goToFirstPage()
                }}>
                {[ALL, ...filter.options].map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
                    <TableCell key={cell.id} className='px-4 py-3 align-middle'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className='hover:bg-transparent'>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className='h-28 text-center text-muted-foreground'>
                  {data.length === 0 ? emptyMessage : 'Sin resultados para tu búsqueda.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between border-t p-4'>
        <p className='text-sm text-muted-foreground'>
          Mostrando {from} a {to} de {total} {noun}
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
