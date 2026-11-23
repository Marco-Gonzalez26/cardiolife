'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { createAppointment } from '@/actions/appointments'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { nowInClinic } from '@/lib/date-utils'

/** El paciente solicita una cita; queda "Pendiente" hasta que el consultorio la confirme */
export const RequestAppointmentDialog = ({ patientId }: { patientId: string }) => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(nowInClinic().date)
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const result = await createAppointment({
        patientId,
        date,
        time,
        type: 'Consulta General',
        notes: notes || undefined
      })
      if ('error' in result) {
        toast.error(result.error)
        if ('code' in result && result.code === 'slot_taken') {
          setTime('')
          setReloadKey((key) => key + 1)
        }
        return
      }
      toast.success('Cita solicitada. El consultorio la confirmará.')
      setOpen(false)
      setTime('')
      setNotes('')
    } catch {
      toast.error('No se pudo solicitar la cita')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2 font-semibold'>
          <Plus className='size-4' />
          Solicitar cita
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>Solicitar cita</DialogTitle>
          <DialogDescription>
            Elija un día y un horario libre.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-5'>
          <SlotPicker
            date={date}
            time={time}
            onDateChange={setDate}
            onTimeChange={setTime}
            reloadKey={reloadKey}
          />
          <div className='space-y-2'>
            <Label htmlFor='portal-notes' className='font-semibold'>
              Motivo (opcional)
            </Label>
            <Textarea
              id='portal-notes'
              value={notes}
              maxLength={500}
              onChange={(event) => setNotes(event.target.value)}
              placeholder='Cuéntenos brevemente el motivo de su consulta'
            />
          </div>
          <Button
            className='h-11 w-full font-semibold'
            disabled={saving || !time}
            onClick={handleSubmit}>
            {saving && <Loader2 className='animate-spin' />}
            Solicitar cita
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
