import Link from 'next/link'
import { CalendarDays, ChevronLeft, Clock, Stethoscope } from 'lucide-react'
import { AppointmentActions } from '@/components/appointments/appointment-actions'
import { STATUS_BADGE } from '@/components/appointments/appointment-status'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AppointmentWithPatient } from '@/lib/services/appointments-service'
import { SLOT_MINUTES, slotToMinutes } from '@/lib/validations/appointment'
import { formatDate } from '@/lib/format-date'

const toHHMM = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const Tile = ({
  label,
  icon: Icon,
  children,
  className
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}) => (
  <div className={cn('rounded-lg border bg-background p-3', className)}>
    <p className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
      {label}
    </p>
    <p className='mt-1 flex items-center gap-2 text-sm font-medium'>
      <Icon className='size-4 shrink-0 text-primary' />
      {children}
    </p>
  </div>
)

export const AppointmentDetails = ({
  appointment,
  backHref
}: {
  appointment: AppointmentWithPatient
  /** Enlace para volver a la agenda del día */
  backHref: string
}) => {
  const { patient } = appointment
  const fullName = `${patient.names} ${patient.lastnames}`
  const start = appointment.time.slice(0, 5)
  const end = toHHMM(slotToMinutes(start) + SLOT_MINUTES)
  const initials =
    `${patient.names[0] ?? ''}${patient.lastnames[0] ?? ''}`.toUpperCase()

  return (
    <Card className='rounded-none border-0 shadow-none'>
      <CardHeader className='border-b pb-4 pr-14'>
        <Link
          href={backHref}
          className='-ml-1 mb-1 inline-flex min-h-8 items-center gap-1 text-sm text-muted-foreground hover:text-foreground'>
          <ChevronLeft className='size-4' />
          Agenda del día
        </Link>
        <div className='flex items-start justify-between gap-2'>
          <CardTitle className='text-lg'>Detalles de la cita</CardTitle>
          <Badge
            className={cn('border-transparent', STATUS_BADGE[appointment.status])}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-5 pt-2'>
        <div className='flex items-center gap-3'>
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground'>
            {initials}
          </div>
          <div className='min-w-0'>
            <Link
              href={`/dashboard/patients/${patient.id}`}
              className='block truncate text-lg font-semibold hover:text-primary'>
              {fullName}
            </Link>
            <p className='truncate text-sm text-muted-foreground'>
              {[
                patient.identification && `ID: ${patient.identification}`,
                patient.age && `${patient.age} años`
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <Tile label='Fecha' icon={CalendarDays}>
            {formatDate(appointment.date)}
          </Tile>
          <Tile label='Hora' icon={Clock}>
            {start} – {end}
          </Tile>
          <Tile
            label='Tipo de consulta'
            icon={Stethoscope}
            className='col-span-2'>
            {appointment.type}
          </Tile>
        </div>

        <div className='space-y-2'>
          <p className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
            Notas
          </p>
          <p className='rounded-lg border border-amber-100 bg-amber-50/50 p-3 text-sm'>
            {appointment.notes || 'Sin notas para esta cita.'}
          </p>
        </div>

        <AppointmentActions
          id={appointment.id}
          status={appointment.status}
          date={appointment.date}
          patientName={fullName}
        />
      </CardContent>
    </Card>
  )
}
