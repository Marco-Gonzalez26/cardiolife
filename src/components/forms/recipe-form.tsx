'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Check,
  ChevronsUpDown,
  Plus,
  Trash2,
  ArrowRight,
  FileText,
  Stethoscope,
  User,
  Pill,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import dynamic from 'next/dynamic'

// Lazy load PDF component to prevent memory issues
const PrescriptionPreview = dynamic(
  () =>
    import('../pdfs/pdf-renderer').then((mod) => ({
      default: mod.PrescriptionPreview
    })),
  {
    loading: () => (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-sm text-muted-foreground'>
          Cargando vista previa...
        </div>
      </div>
    ),
    ssr: false 
  }
)
import { DialogDemo } from '../recipe-dialog'

const formSchema = z.object({
  patientId: z.string().min(1, 'Seleccione un paciente'),
  medications: z.array(z.any()).min(1, 'Agregue al menos un medicamento'),
  nextAppointment: z.string().optional()
})

export const RecipeForm = ({ patients, medications }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [medicationOpen, setMedicationOpen] = useState(false)
  const [presentationOpen, setPresentationOpen] = useState(false)
  const [
    selectedMedicationForPresentation,
    setSelectedMedicationForPresentation
  ] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: '',
      medications: [],
      nextAppointment: ''
    }
  })

  const selectedMedications = form.watch('medications')
  const selectedPatientId = form.watch('patientId')
  const selectedPatientData = patients.find(
    (p) => p.value === selectedPatientId
  )

  const selectMedication = (medId) => {
    const medication = medications.find((m) => m.id === medId)
    if (medication) {
      setSelectedMedicationForPresentation(medication)
      setMedicationOpen(false)
      setPresentationOpen(true)
    }
  }

  const addPresentation = (presentationId) => {
    if (!selectedMedicationForPresentation) return
    const presentation = selectedMedicationForPresentation.presentations.find(
      (p) => p.id === presentationId
    )
    if (presentation) {
      const alreadyExists = selectedMedications.find(
        (m) => m.presentationId === presentationId
      )
      if (!alreadyExists) {
        form.setValue('medications', [
          ...selectedMedications,
          {
            id: Date.now().toString(),
            medicationId: selectedMedicationForPresentation.id,
            presentationId: presentation.id,
            name: selectedMedicationForPresentation.name,
            genericName: selectedMedicationForPresentation.genericName,
            dose: presentation.dose,
            unit: presentation.unit,
            form: presentation.form,
            route: presentation.route,
            standardInstructions: presentation.standardInstructions,
            useCustomInstructions: false,
            customInstructions: presentation.standardInstructions,
            quantity: 1
          }
        ])
      }
    }
    setPresentationOpen(false)
    setSelectedMedicationForPresentation(null)
  }

  const removeMedication = (id) => {
    form.setValue(
      'medications',
      selectedMedications.filter((m) => m.id !== id)
    )
  }

  const toggleCustomInstructions = (id) => {
    form.setValue(
      'medications',
      selectedMedications.map((m) =>
        m.id === id
          ? { ...m, useCustomInstructions: !m.useCustomInstructions }
          : m
      )
    )
  }

  const updateCustomInstructions = (id, instructions) => {
    form.setValue(
      'medications',
      selectedMedications.map((m) =>
        m.id === id ? { ...m, customInstructions: instructions } : m
      )
    )
  }

  const updateQuantity = (id, quantity) => {
    form.setValue(
      'medications',
      selectedMedications.map((m) =>
        m.id === id ? { ...m, quantity: parseInt(quantity) || 1 } : m
      )
    )
  }

  const [prescriptionData, setPrescriptionData] = useState(null)

  const onSubmit = (data) => {
    console.log('Datos del formulario:', data)

    // Build prescription data from form
    const pdfData = {
      doctor: {
        name: 'Dr. Ricardo J González Soto',
        email: 'funiscor2008@gmail.com',
        phone: '0999-123-456',
        signature: {
          name: 'Dr. Ricardo J González Soto',
          specialty: 'Cardiólogo',
          ci: '1710234567',
          registration: '08952948'
        }
      },
      patient: {
        name: selectedPatientData?.label || 'Paciente',
        ci: selectedPatientData?.ci || '1700000000',
        date: new Date().toLocaleDateString('es-EC'),
        nextAppointment: data.nextAppointment || 'En 1 semana'
      },
      medications: data.medications || [],
      indications: [] // You can add indications logic here
    }

    setPrescriptionData(pdfData)
    setIsSubmitted(true)
    setIsDialogOpen(true)
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start'>
      {/* ── LEFT: Formulario ── */}
      <div className='space-y-5'>
        {/* Header card */}
        <div className='flex items-center gap-3 p-4 bg-blue-600 rounded-xl text-white'>
          <div className='p-2 bg-white/20 rounded-lg'>
            <Stethoscope className='h-5 w-5' />
          </div>
          <div>
            <p className='font-semibold text-lg leading-none'>
              Nueva Receta Médica
            </p>
            <p className='text-blue-100 text-sm mt-0.5'>
              Complete los datos para generar la receta
            </p>
          </div>
        </div>

        <Form {...form}>
          <div className='space-y-5'>
            {/* Paciente */}
            <div className='bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4'>
              <div className='flex items-center gap-2'>
                <User className='h-4 w-4 text-blue-600' />
                <h3 className='font-semibold text-sm text-neutral-700 uppercase tracking-wide'>
                  Paciente
                </h3>
              </div>
              <FormField
                control={form.control}
                name='patientId'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            className={cn(
                              'w-full justify-between h-11 font-normal',
                              !field.value && 'text-muted-foreground'
                            )}>
                            {field.value
                              ? patients.find((p) => p.value === field.value)
                                  ?.label
                              : 'Buscar paciente...'}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-40' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-full p-0' align='start'>
                        <Command>
                          <CommandInput placeholder='Buscar por nombre o CI...' />
                          <CommandList>
                            <CommandEmpty>
                              No se encontró el paciente.
                            </CommandEmpty>
                            <CommandGroup>
                              {patients.map((patient) => (
                                <CommandItem
                                  key={patient.value}
                                  value={patient.value}
                                  onSelect={() =>
                                    form.setValue('patientId', patient.value)
                                  }>
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      patient.value === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  <div>
                                    <div className='font-medium'>
                                      {patient.label}
                                    </div>
                                    <div className='text-xs text-muted-foreground'>
                                      CI: {patient.ci}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                    {selectedPatientData && (
                      <div className='flex items-center gap-2 mt-1 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg'>
                        <div className='h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0'>
                          {selectedPatientData.label?.charAt(0)}
                        </div>
                        <div>
                          <p className='text-sm font-medium text-blue-900'>
                            {selectedPatientData.label}
                          </p>
                          <p className='text-xs text-blue-600'>
                            CI: {selectedPatientData.ci}
                          </p>
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Medicamentos */}
            <div className='bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4'>
              <div className='flex items-center gap-2'>
                <Pill className='h-4 w-4 text-blue-600' />
                <h3 className='font-semibold text-sm text-neutral-700 uppercase tracking-wide'>
                  Medicamentos
                </h3>
                {selectedMedications.length > 0 && (
                  <Badge variant='secondary' className='ml-auto'>
                    {selectedMedications.length} agregado
                    {selectedMedications.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              <FormField
                control={form.control}
                name='medications'
                render={() => (
                  <FormItem>
                    <div className='flex gap-2'>
                      <Popover
                        open={medicationOpen}
                        onOpenChange={setMedicationOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type='button'
                            variant='outline'
                            className='flex-1 justify-between h-10 border-dashed text-muted-foreground hover:text-foreground'>
                            <span className='flex items-center gap-2'>
                              <Plus className='h-4 w-4' />
                              Agregar medicamento
                            </span>
                            <ChevronsUpDown className='h-4 w-4 opacity-40' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-80 p-0' align='start'>
                          <Command>
                            <CommandInput placeholder='Buscar medicamento...' />
                            <CommandList>
                              <CommandEmpty>No se encontró.</CommandEmpty>
                              <CommandGroup>
                                {medications.map((med) => (
                                  <CommandItem
                                    key={med.id}
                                    value={med.id}
                                    onSelect={selectMedication}>
                                    <div className='flex items-center justify-between w-full'>
                                      <div>
                                        <div className='font-medium'>
                                          {med.name}
                                        </div>
                                        <div className='text-xs text-muted-foreground'>
                                          {med.presentations.length}{' '}
                                          presentación(es)
                                        </div>
                                      </div>
                                      <ArrowRight className='h-3.5 w-3.5 text-muted-foreground' />
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <Popover
                        open={presentationOpen}
                        onOpenChange={setPresentationOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type='button'
                            variant='outline'
                            className='shrink-0'
                            disabled={!selectedMedicationForPresentation}>
                            Presentación
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-72 p-0'>
                          <Command>
                            <CommandInput placeholder='Buscar presentación...' />
                            <CommandList>
                              <CommandEmpty>
                                No hay presentaciones.
                              </CommandEmpty>
                              <CommandGroup>
                                {selectedMedicationForPresentation?.presentations.map(
                                  (pres) => (
                                    <CommandItem
                                      key={pres.id}
                                      value={pres.id}
                                      onSelect={addPresentation}>
                                      <div>
                                        <div className='font-medium'>
                                          {pres.dose} {pres.unit} — {pres.form}
                                        </div>
                                        <div className='text-xs text-muted-foreground'>
                                          Vía: {pres.route}
                                        </div>
                                      </div>
                                    </CommandItem>
                                  )
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />

                    {/* Lista de medicamentos */}
                    {selectedMedications.length > 0 && (
                      <div className='space-y-3 mt-3'>
                        {selectedMedications.map((med, index) => (
                          <div
                            key={med.id}
                            className='border border-neutral-200 rounded-lg p-4 bg-neutral-50 space-y-3'>
                            <div className='flex items-start justify-between'>
                              <div className='flex items-start gap-2'>
                                <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold'>
                                  {index + 1}
                                </span>
                                <div>
                                  <p className='font-semibold text-sm'>
                                    {med.name}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    {med.dose} {med.unit} · {med.form} · Vía:{' '}
                                    {med.route}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50'
                                onClick={() => removeMedication(med.id)}>
                                <Trash2 className='h-3.5 w-3.5' />
                              </Button>
                            </div>

                            <Separator />

                            <div className='flex items-center gap-2'>
                              <Checkbox
                                id={`custom-${med.id}`}
                                checked={med.useCustomInstructions}
                                onCheckedChange={() =>
                                  toggleCustomInstructions(med.id)
                                }
                              />
                              <label
                                htmlFor={`custom-${med.id}`}
                                className='text-xs text-muted-foreground cursor-pointer'>
                                Instrucciones personalizadas
                              </label>
                            </div>

                            {med.useCustomInstructions ? (
                              <Textarea
                                placeholder='Escribe las instrucciones...'
                                value={med.customInstructions}
                                onChange={(e) =>
                                  updateCustomInstructions(
                                    med.id,
                                    e.target.value
                                  )
                                }
                                className='min-h-[70px] text-sm'
                              />
                            ) : (
                              <p className='text-xs text-neutral-600 bg-white border rounded px-3 py-2'>
                                {med.standardInstructions ||
                                  'Sin instrucciones estándar'}
                              </p>
                            )}

                            <div className='flex items-center gap-2'>
                              <label className='text-xs text-muted-foreground'>
                                Cantidad:
                              </label>
                              <Input
                                type='number'
                                min='1'
                                value={med.quantity}
                                onChange={(e) =>
                                  updateQuantity(med.id, e.target.value)
                                }
                                className='w-16 h-7 text-sm'
                              />
                              <span className='text-xs text-muted-foreground'>
                                {med.form}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Próxima Cita */}
            <div className='bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-3'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-blue-600' />
                <h3 className='font-semibold text-sm text-neutral-700 uppercase tracking-wide'>
                  Próxima Cita
                </h3>
                <Badge
                  variant='outline'
                  className='ml-auto text-xs font-normal'>
                  Opcional
                </Badge>
              </div>
              <FormField
                control={form.control}
                name='nextAppointment'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder='Ej: En 1 semana, 15/03/2025'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botones */}
            <div className='flex gap-3'>
              <Button
                type='button'
                onClick={form.handleSubmit(onSubmit)}
                className='flex-1 bg-blue-600 hover:bg-blue-700 h-11 gap-2'>
                <FileText className='h-4 w-4' />
                Generar Receta
              </Button>
              <Button
                type='button'
                variant='outline'
                className='h-11'
                onClick={() => {
                  form.reset()
                  setIsSubmitted(false)
                }}>
                Limpiar
              </Button>
            </div>
          </div>
        </Form>
      </div>

      {/* ── RIGHT: Preview ── */}
      <div className='xl:sticky xl:top-6'>
        <div className='bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden'>
          <div className='flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50'>
            <FileText className='h-4 w-4 text-neutral-400' />
            <span className='text-sm font-medium text-neutral-600'>
              Vista previa
            </span>
          </div>
          <div className='p-4 min-h-[500px] flex flex-col'>
            {isSubmitted && selectedPatientData ? (
              <PrescriptionPreview
                patientName={selectedPatientData.label}
                prescriptionData={prescriptionData}
              />
            ) : (
              <div className='flex-1 flex flex-col items-center justify-center text-center gap-3 text-muted-foreground py-10'>
                <div className='p-4 bg-neutral-100 rounded-full'>
                  <FileText className='h-8 w-8 text-neutral-300' />
                </div>
                <div>
                  <p className='text-sm font-medium text-neutral-500'>
                    Sin vista previa
                  </p>
                  <p className='text-xs text-neutral-400 mt-1'>
                    Complete el formulario y presione
                    <br />
                    "Generar Receta" para ver la receta
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogDemo open={isDialogOpen} handleClose={setIsDialogOpen} />
    </div>
  )
}
