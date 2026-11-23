'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CalendarClock, Loader2, XCircle } from 'lucide-react'
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

/** Cancelar o reagendar una cita propia (al reagendar vuelve a "Pendiente") */
export const PortalAppointmentActions = ({
  id,
  date
}: {
  id: string
  date: string
}) => {
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [open, setOpen] = useState(false)
  const [newDate, setNewDate] = useState(
    date < nowInClinic().date ? nowInClinic().date : date
  )
  const [newTime, setNewTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const cancel = () =>
    startTransition(async () => {
      const result = await updateAppointmentStatus(id, 'Cancelada')
      if ('error' in result) toast.error(result.error)
      else toast.success('Cita cancelada')
      setConfirming(false)
    })

  const reschedule = async () => {
    setSaving(true)
    try {
      const result = await rescheduleAppointment(id, newDate, newTime)
      if ('error' in result) {
        toast.error(result.error)
        if ('code' in result && result.code === 'slot_taken') {
          setNewTime('')
          setReloadKey((key) => key + 1)
        }
        return
      }
      toast.success('Cita reagendada. El consultorio la confirmará.')
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='flex flex-wrap items-center gap-1'>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant='ghost' size='sm' className='gap-1.5'>
            <CalendarClock className='size-4' />
            Reagendar
          </Button>
        </DialogTrigger>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-2xl'>Reagendar cita</DialogTitle>
            <DialogDescription>Elija la nueva fecha y horario.</DialogDescription>
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
            className='h-11 w-full font-semibold'
            disabled={saving || !newTime}
            onClick={reschedule}>
            {saving && <Loader2 className='animate-spin' />}
            Confirmar nuevo horario
          </Button>
        </DialogContent>
      </Dialog>
      {confirming ? (
        <div role='group' aria-label='Confirmar cancelación' className='flex flex-wrap items-center gap-1'>
          <span className='text-sm font-medium'>¿Cancelar esta cita?</span>
          <Button variant='destructive' size='sm' disabled={pending} onClick={cancel}>
            {pending && <Loader2 className='size-4 animate-spin' />}
            Sí, cancelar
          </Button>
          <Button
            variant='ghost'
            size='sm'
            disabled={pending}
            onClick={() => setConfirming(false)}>
            No, volver
          </Button>
        </div>
      ) : (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setConfirming(true)}
          className='gap-1.5 text-destructive hover:text-destructive'>
          <XCircle className='size-4' />
          Cancelar
        </Button>
      )}
    </div>
  )
}
