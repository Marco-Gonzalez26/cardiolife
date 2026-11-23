import Link from 'next/link'
import { STATUS_BADGE } from '@/components/appointments/appointment-status'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/format-date'
import type { AppointmentWithPatient } from '@/lib/services/appointments-service'
import { cn } from '@/lib/utils'

/** Resultados de buscar citas desde la barra superior; cada una abre su detalle en la agenda */
export const AppointmentSearchResults = ({
  term,
  results
}: {
  term: string
  results: AppointmentWithPatient[]
}) => (
  <div className='p-6 pr-14'>
    <h2 className='text-lg font-semibold'>Resultados de la búsqueda</h2>
    <p className='pt-1 text-sm text-muted-foreground'>
      {results.length === 0
        ? `No se encontraron citas para «${term}».`
        : `${results.length} ${results.length === 1 ? 'cita' : 'citas'} para «${term}».`}
    </p>
    {results.length > 0 && (
      <ul className='mt-4 divide-y border-t'>
        {results.map((item) => (
          <li key={item.id}>
            <Link
              href={`/dashboard/appointments?mes=${item.date.slice(0, 7)}&dia=${item.date}&cita=${item.id}`}
              className='flex min-h-14 items-center justify-between gap-3 py-3 hover:text-primary'>
              <span className='min-w-0'>
                <span className='block truncate font-medium'>
                  {item.patient.names} {item.patient.lastnames}
                </span>
                <span className='block truncate text-xs text-muted-foreground'>
                  {formatDate(item.date)} · {item.time.slice(0, 5)} · {item.type}
                </span>
              </span>
              <Badge className={cn('border-transparent', STATUS_BADGE[item.status])}>
                {item.status}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
)
