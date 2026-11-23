'use client'

import { useEffect, useState } from 'react'
import { getBusySlots } from '@/actions/appointments'
import { nowInClinic } from '@/lib/date-utils'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { formatDate } from '@/lib/format-date'
import { cn } from '@/lib/utils'
import { APPOINTMENT_SLOTS, formatSlot } from '@/lib/validations/appointment'

interface SlotPickerProps {
  date: string
  time: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  /** Cita que se está reagendando: su propio horario no cuenta como ocupado */
  excludeId?: string
  /** Cambiar este valor vuelve a consultar los horarios (p. ej. cuando otra persona tomó el turno) */
  reloadKey?: number
}

/** Date elegido en el calendario -> "YYYY-MM-DD" (valores locales, sin saltos por zona horaria) */
const toIso = (day: Date) =>
  `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`

/** Fecha + horarios libres del día (se consultan al cambiar la fecha) */
export const SlotPicker = ({
  date,
  time,
  onDateChange,
  onTimeChange,
  excludeId,
  reloadKey = 0
}: SlotPickerProps) => {
  const [dateOpen, setDateOpen] = useState(false)
  // Los horarios ocupados se guardan junto con la consulta que los produjo: así "cargando" se deduce
  // (sin llamar setState de forma síncrona en el efecto) y no se muestran datos de otra fecha.
  const queryKey = `${date}|${excludeId ?? ''}|${reloadKey}`
  const [result, setResult] = useState<{ key: string; slots: string[] }>({
    key: '',
    slots: []
  })
  const now = nowInClinic()

  useEffect(() => {
    if (!date) return
    let cancelled = false
    getBusySlots(date, excludeId).then((slots) => {
      if (!cancelled) setResult({ key: queryKey, slots })
    })
    return () => {
      cancelled = true
    }
  }, [date, excludeId, queryKey])

  const loading = Boolean(date) && result.key !== queryKey
  const busy = result.key === queryKey ? result.slots : []

  const isUnavailable = (slot: string) =>
    busy.includes(slot) || (date === now.date && slot <= now.time)

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='appointment-date' className='font-semibold'>
          Fecha
        </Label>
        <Popover open={dateOpen} onOpenChange={setDateOpen} modal>
          <PopoverTrigger asChild>
            <Button
              id='appointment-date'
              type='button'
              variant='ghost'
              className='h-11 w-full justify-start rounded-lg bg-muted px-4 font-normal hover:bg-muted'>
              {date ? formatDate(date) : 'DD/MM/AAAA'}
              <CalendarIcon className='ml-auto size-4 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={date ? new Date(`${date}T12:00:00`) : undefined}
              defaultMonth={date ? new Date(`${date}T12:00:00`) : undefined}
              disabled={(day) => toIso(day) < now.date}
              onSelect={(day) => {
                if (!day) return
                onDateChange(toIso(day))
                onTimeChange('')
                setDateOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className='space-y-2'>
        <Label className='font-semibold'>
          Horario disponible
          {loading && (
            <span className='ml-2 text-xs font-normal text-muted-foreground'>
              Consultando…
            </span>
          )}
        </Label>
        <div className='grid grid-cols-3 gap-2'>
          {APPOINTMENT_SLOTS.map((slot) => {
            const unavailable = isUnavailable(slot)
            const selected = slot === time
            return (
              <button
                key={slot}
                type='button'
                disabled={unavailable}
                aria-pressed={selected}
                onClick={() => onTimeChange(slot)}
                className={cn(
                  'rounded-lg border px-2 py-2 text-sm font-medium transition-colors',
                  selected
                    ? 'border-ring bg-accent text-accent-foreground ring-2 ring-ring'
                    : 'bg-card hover:bg-muted',
                  unavailable &&
                    'cursor-not-allowed bg-muted/60 text-muted-foreground/60 line-through hover:bg-muted/60'
                )}>
                {formatSlot(slot)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
