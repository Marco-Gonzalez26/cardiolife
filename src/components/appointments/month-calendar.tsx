import Link from 'next/link'
import { getMonthGrid, nowInClinic } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import type { AppointmentWithPatient } from '@/lib/services/appointments-service'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
/** Citas visibles por día antes de mostrar "+N más" */
const MAX_PER_DAY = 3

const STATUS_STYLES: Record<string, string> = {
  Confirmada: 'border-emerald-500 bg-emerald-50 text-emerald-900',
  Pendiente: 'border-amber-500 bg-amber-50 text-amber-900',
  Cancelada: 'border-red-400 bg-red-50 text-red-800 line-through opacity-70',
  Atendida: 'border-sky-500 bg-sky-50 text-sky-900'
}

interface MonthCalendarProps {
  /** "YYYY-MM" */
  month: string
  appointments: AppointmentWithPatient[]
  selectedDay: string
  selectedId?: string
}

const dayHref = (day: string) =>
  `/dashboard/appointments?mes=${day.slice(0, 7)}&dia=${day}`

export const MonthCalendar = ({
  month,
  appointments,
  selectedDay,
  selectedId
}: MonthCalendarProps) => {
  const { days } = getMonthGrid(month)
  const today = nowInClinic().date

  const byDay = new Map<string, AppointmentWithPatient[]>()
  for (const appointment of appointments) {
    const list = byDay.get(appointment.date) ?? []
    list.push(appointment)
    byDay.set(appointment.date, list)
  }

  return (
    <div className='overflow-x-auto rounded-2xl border bg-card shadow-sm'>
      <div className='min-w-[680px]'>
        <div className='grid grid-cols-7 border-b bg-muted/40'>
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className='py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {weekday}
            </div>
          ))}
        </div>

        <div className='grid grid-cols-7'>
          {days.map((day, index) => {
            const inMonth = day.startsWith(month)
            const isToday = day === today
            const isSelected = day === selectedDay
            const isWeekend = index % 7 >= 5
            const items = (byDay.get(day) ?? []).filter(
              (item) => item.status !== 'Cancelada' || item.id === selectedId
            )
            const visible = items.slice(0, MAX_PER_DAY)
            const extra = items.length - visible.length

            return (
              <div
                key={day}
                className={cn(
                  'min-h-28 border-b border-l p-1.5 first:border-l-0 [&:nth-child(7n+1)]:border-l-0',
                  !inMonth && 'bg-muted/50',
                  inMonth && isWeekend && 'bg-muted/20',
                  isSelected && 'ring-2 ring-inset ring-ring'
                )}>
                <Link
                  href={dayHref(day)}
                  aria-label={`Ver citas del ${day}`}
                  className={cn(
                    'inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold transition-colors hover:bg-accent',
                    isToday && 'bg-primary text-primary-foreground hover:bg-primary',
                    !inMonth && !isToday && 'text-muted-foreground/60'
                  )}>
                  {Number(day.slice(8))}
                </Link>

                <div className='mt-1 space-y-1'>
                  {visible.map((appointment) => (
                    <Link
                      key={appointment.id}
                      href={`${dayHref(day)}&cita=${appointment.id}`}
                      title={`${appointment.time.slice(0, 5)} · ${appointment.patient.names} ${appointment.patient.lastnames} · ${appointment.type} (${appointment.status})`}
                      className={cn(
                        'block truncate rounded border-l-4 px-1.5 py-0.5 text-[11px] leading-tight transition-shadow hover:shadow-md',
                        STATUS_STYLES[appointment.status] ??
                          'border-slate-400 bg-slate-50 text-slate-800',
                        appointment.id === selectedId &&
                          'ring-2 ring-ring ring-offset-1'
                      )}>
                      <span className='font-semibold'>
                        {appointment.time.slice(0, 5)}
                      </span>{' '}
                      {appointment.patient.lastnames}
                    </Link>
                  ))}
                  {extra > 0 && (
                    <Link
                      href={dayHref(day)}
                      className='block px-1 text-[11px] font-semibold text-primary hover:underline'>
                      +{extra} más
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
