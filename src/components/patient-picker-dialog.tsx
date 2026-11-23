'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, User } from 'lucide-react'
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
import type { AppointmentPatient } from '@/lib/services/appointments-service'

interface PatientPickerDialogProps {
  patients: AppointmentPatient[]
  /** Texto del botón, por ejemplo "Nueva historia" */
  buttonLabel: string
  title: string
  /** Ruta de destino con `{id}` donde va el paciente: "/dashboard/patients/{id}/evolutions/new" */
  hrefTemplate: string
}

/** Botón que pide elegir un paciente (con búsqueda) y lleva al formulario correspondiente */
export const PatientPickerDialog = ({
  patients,
  buttonLabel,
  title,
  hrefTemplate
}: PatientPickerDialogProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const choose = (patientId: string) => {
    setOpen(false)
    router.push(hrefTemplate.replace('{id}', patientId))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='lg' className='gap-2 font-semibold'>
          <Plus className='size-5' />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>{title}</DialogTitle>
          <DialogDescription>
            Busca al paciente por nombre o cédula.
          </DialogDescription>
        </DialogHeader>
        <Command className='rounded-lg border'>
          <CommandInput placeholder='Nombre o cédula…' />
          <CommandList>
            <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={`${patient.names} ${patient.lastnames} ${patient.identification ?? ''}`}
                  onSelect={() => choose(patient.id)}>
                  <User className='size-4 text-muted-foreground' />
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
      </DialogContent>
    </Dialog>
  )
}
