'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react'
import { createAppointment } from '@/actions/appointments'
import { SlotPicker } from '@/components/appointments/slot-picker'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { nowInClinic } from '@/lib/date-utils'
import type { AppointmentPatient } from '@/lib/services/appointments-service'
import { APPOINTMENT_TYPES } from '@/lib/validations/appointment'

interface NewAppointmentDialogProps {
  patients: AppointmentPatient[]
  /** Paciente preseleccionado (viene de ?paciente=<id>); abre el diálogo solo */
  defaultPatientId?: string
  defaultDate?: string
  /** Texto y estilo del botón que abre el diálogo */
  triggerLabel?: string
  triggerVariant?: 'default' | 'outline'
}

export const NewAppointmentDialog = ({
  patients,
  defaultPatientId,
  defaultDate,
  triggerLabel = 'Nueva Cita',
  triggerVariant = 'default'
}: NewAppointmentDialogProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const [open, setOpen] = useState(Boolean(defaultPatientId))
  const [patientId, setPatientId] = useState(defaultPatientId ?? '')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [date, setDate] = useState(defaultDate ?? nowInClinic().date)
  const [time, setTime] = useState('')
  const [type, setType] = useState<string>(APPOINTMENT_TYPES[1])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const selected = patients.find((patient) => patient.id === patientId)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    // Quita ?paciente= de la URL al cerrar para que no se reabra al refrescar
    if (!next && defaultPatientId) router.replace(pathname)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const result = await createAppointment({
        patientId,
        date,
        time,
        type: type as (typeof APPOINTMENT_TYPES)[number],
        notes: notes || undefined
      })
      if ('error' in result) {
        toast.error(result.error)
        // Otra persona tomó el horario: se limpia la selección y se vuelven a consultar los libres
        if ('code' in result && result.code === 'slot_taken') {
          setTime('')
          setReloadKey((key) => key + 1)
        }
        return
      }
      toast.success('Cita agendada')
      setOpen(false)
      setTime('')
      setNotes('')
      router.push(`${pathname}?mes=${date.slice(0, 7)}&dia=${date}&cita=${result.id}`)
    } catch {
      toast.error('No se pudo agendar la cita')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className='gap-2 font-semibold'>
          <Plus className='size-4' />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>Nueva Cita</DialogTitle>
          <DialogDescription>
            Elige el paciente, la fecha y un horario libre.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          <div className='space-y-2'>
            <Label className='font-semibold'>Paciente</Label>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen} modal>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  role='combobox'
                  aria-expanded={pickerOpen}
                  className={cn(
                    'h-11 w-full justify-between rounded-lg bg-muted px-4 font-normal hover:bg-muted',
                    !selected && 'text-muted-foreground'
                  )}>
                  {selected
                    ? `${selected.names} ${selected.lastnames}`
                    : 'Buscar paciente…'}
                  <ChevronsUpDown className='size-4 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-[var(--radix-popover-trigger-width)] p-0'
                align='start'>
                <Command>
                  <CommandInput placeholder='Nombre o cédula…' />
                  <CommandList>
                    <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
                    <CommandGroup>
                      {patients.map((patient) => (
                        <CommandItem
                          key={patient.id}
                          value={`${patient.names} ${patient.lastnames} ${patient.identification ?? ''}`}
                          onSelect={() => {
                            setPatientId(patient.id)
                            setPickerOpen(false)
                          }}>
                          <Check
                            className={cn(
                              'size-4',
                              patient.id === patientId
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <span>
                            {patient.names} {patient.lastnames}
                          </span>
                          {patient.identification && (
                            <span className='ml-auto text-xs text-muted-foreground'>
                              {patient.identification}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <SlotPicker
            date={date}
            time={time}
            onDateChange={setDate}
            onTimeChange={setTime}
            reloadKey={reloadKey}
          />

          <div className='space-y-2'>
            <Label className='font-semibold'>Tipo de consulta</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className='h-11 w-full rounded-lg border-0 bg-muted px-4'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='appointment-notes' className='font-semibold'>
              Notas (opcional)
            </Label>
            <Textarea
              id='appointment-notes'
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={500}
              placeholder='Motivo o indicaciones para la consulta'
              className='min-h-[80px] resize-none rounded-lg border-0 bg-muted px-4 shadow-none focus-visible:bg-card'
            />
          </div>

          <Button
            type='button'
            onClick={handleSubmit}
            disabled={saving || !patientId || !date || !time}
            className='h-11 w-full font-semibold'>
            {saving ? (
              <>
                <Loader2 className='animate-spin' />
                Agendando…
              </>
            ) : (
              <>
                <Check />
                Confirmar Cita
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
