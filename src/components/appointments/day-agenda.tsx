import Link from 'next/link'
import { STATUS_BADGE } from '@/components/appointments/appointment-status'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatIsoDate } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import type { AppointmentWithPatient } from '@/lib/services/appointments-service'

/** Citas del día seleccionado en el calendario, con acceso para agendar una nueva ese día */
export const DayAgenda = ({
  day,
  appointments,
  action
}: {
  day: string
  appointments: AppointmentWithPatient[]
  /** Botón para agendar en este día (diálogo de nueva cita) */
  action: React.ReactNode
}) => (
  <Card className='rounded-none border-0 shadow-none'>
    <CardHeader className='border-b pb-4 pr-14'>
      <CardTitle className='text-lg capitalize'>
        {formatIsoDate(day, { weekday: 'long', day: 'numeric', month: 'long' })}
      </CardTitle>
      <p className='pt-1 text-sm text-muted-foreground'>
        {appointments.length === 0
          ? 'Sin citas este día.'
          : `${appointments.length} ${appointments.length === 1 ? 'cita' : 'citas'}. Selecciona una para ver sus detalles.`}
      </p>
    </CardHeader>
    <CardContent className='space-y-4 pt-4'>
      {appointments.length > 0 && (
        <ul className='divide-y'>
          {appointments.map((item) => (
            <li key={item.id}>
              <Link
                href={`/dashboard/appointments?mes=${day.slice(0, 7)}&dia=${day}&cita=${item.id}`}
                className='flex items-center justify-between gap-3 py-3 hover:text-primary'>
                <span className='min-w-0'>
                  <span className='block truncate font-medium'>
                    {item.time.slice(0, 5)} · {item.patient.names}{' '}
                    {item.patient.lastnames}
                  </span>
                  <span className='block truncate text-xs text-muted-foreground'>
                    {item.type}
                  </span>
                </span>
                <Badge
                  className={cn(
                    'border-transparent',
                    STATUS_BADGE[item.status]
                  )}>
                  {item.status}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {action}
    </CardContent>
  </Card>
)
