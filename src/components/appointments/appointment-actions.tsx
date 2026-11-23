'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CalendarClock, CheckCircle2, Loader2, UserCheck, XCircle } from 'lucide-react'
import {
  rescheduleAppointment,
  updateAppointmentStatus
} from '@/actions/appointments'
import { SlotPicker } from '@/components/appointments/slot-picker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { nowInClinic } from '@/lib/date-utils'
import type { AppointmentStatus } from '@/lib/validations/appointment'

interface AppointmentActionsProps {
  id: string
  status: string
  date: string
  patientName: string
}

export const AppointmentActions = ({
  id,
  status,
  date,
  patientName
}: AppointmentActionsProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [newDate, setNewDate] = useState(
    date < nowInClinic().date ? nowInClinic().date : date
  )
  const [newTime, setNewTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const closed = status === 'Cancelada' || status === 'Atendida'
  if (closed) return null

  const changeStatus = (next: AppointmentStatus, message: string) =>
    startTransition(async () => {
      const result = await updateAppointmentStatus(id, next)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(message)
    })

  const handleReschedule = async () => {
    setSaving(true)
    try {
      const result = await rescheduleAppointment(id, newDate, newTime)
      if ('error' in result) {
        toast.error(result.error)
        // Otra persona tomó el horario: se limpia la selección y se vuelven a consultar los libres
        if ('code' in result && result.code === 'slot_taken') {
          setNewTime('')
          setReloadKey((key) => key + 1)
        }
        return
      }
      toast.success('Cita reagendada (queda pendiente de confirmar)')
      setRescheduleOpen(false)
      router.push(
        `/dashboard/appointments?mes=${newDate.slice(0, 7)}&dia=${newDate}&cita=${id}`
      )
    } catch {
      toast.error('No se pudo reagendar la cita')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='space-y-2'>
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogTrigger asChild>
          <Button variant='outline' className='w-full gap-2 font-semibold'>
            <CalendarClock className='size-4' />
            Reagendar Cita
          </Button>
        </DialogTrigger>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-2xl'>Reagendar Cita</DialogTitle>
            <DialogDescription>
              Nuevo horario para {patientName}.
            </DialogDescription>
          </DialogHeader>
          <SlotPicker
            date={newDate}
            time={newTime}
            onDateChange={setNewDate}
            onTimeChange={setNewTime}
            excludeId={id}
            reloadKey={reloadKey}
          />
          <Button
            onClick={handleReschedule}
            disabled={saving || !newDate || !newTime}
            className='h-11 w-full font-semibold'>
            {saving ? <Loader2 className='animate-spin' /> : <CheckCircle2 />}
            Guardar nuevo horario
          </Button>
        </DialogContent>
      </Dialog>

      <div className='grid grid-cols-2 gap-2'>
        <Button
          variant='outline'
          disabled={pending}
          onClick={() => changeStatus('Cancelada', 'Cita cancelada')}
          className='gap-2 border-red-200 font-semibold text-red-700 hover:bg-red-50 hover:text-red-700'>
          <XCircle className='size-4' />
          Cancelar
        </Button>
        {status === 'Pendiente' ? (
          <Button
            disabled={pending}
            onClick={() => changeStatus('Confirmada', 'Cita confirmada')}
            className='gap-2 font-semibold'>
            <CheckCircle2 className='size-4' />
            Confirmar
          </Button>
        ) : (
          <Button
            disabled={pending}
            onClick={() => changeStatus('Atendida', 'Cita marcada como atendida')}
            className='gap-2 font-semibold'>
            <UserCheck className='size-4' />
            Atender
          </Button>
        )}
      </div>

      {status === 'Pendiente' && (
        <Button
          variant='ghost'
          disabled={pending}
          onClick={() => changeStatus('Atendida', 'Cita marcada como atendida')}
          className='w-full gap-2 text-muted-foreground'>
          <UserCheck className='size-4' />
          Marcar como atendida
        </Button>
      )}
    </div>
  )
}
