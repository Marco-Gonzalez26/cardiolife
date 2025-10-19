import { createClient } from '@/lib/supabase/components-client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  User,
  Calendar,
  Phone,
  Briefcase,
  Hash,
  FileText,
  Plus,
  ClipboardList,
  Pill,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AppSection } from '@/components/app-section'

interface ClinicHistoryPreview {
  id: number
  date: string
  reason: string
  treatmentPlan: string
}

interface Patient {
  id: string
  created_at: string
  names: string
  lastnames: string
  identification: string
  birthdate: string
  age: string
  phoneNumber?: string
  job?: string
}

export default async function PatientViewPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: patient, error: patientError } = await supabase
    .from('patient')
    .select('*')
    .eq('id', params.id)
    .single()

  if (patientError || !patient) {
    redirect('/patients')
  }

  const { data: clinicHistories } = await supabase
    .from('clinicHistory')
    .select('id, date, reason, treatmentPlan')
    .eq('patient', params.id)
    .order('date', { ascending: false })

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const latestHistory = clinicHistories?.[0]

  return (
    <AppSection>
      <div className='w-full mx-auto'>
        <div className='mb-6 flex items-center justify-between'>
          <Link href='/dashboard/patients'>
            <Button variant='ghost' className='hover:bg-neutral-100'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Volver a Pacientes
            </Button>
          </Link>
          <Link href={`/dashboard/patients/${params.id}/edit`}>
            <Button>
              <Edit className='mr-2 h-4 w-4' />
              Editar Paciente
            </Button>
          </Link>
        </div>

        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-neutral-900 mb-2'>
            {patient.names} {patient.lastnames}
          </h1>
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className=' text-neutral-700 border border-neutral-300'>
              <User className='mr-1 h-3 w-3' />
              Paciente
            </Badge>
            {patient.age && (
              <Badge
                variant='outline'
                className='border-neutral-300 text-neutral-700'>
                {patient.age} años
              </Badge>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1 space-y-6'>
            <Card className='border-neutral-200 shadow-sm'>
              <CardHeader>
                <CardTitle className='text-lg text-neutral-900'>
                  Datos Personales
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <Hash className='h-5 w-5 text-neutral-500 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-neutral-700'>
                      Identificación
                    </p>
                    <p className='text-sm text-neutral-600'>
                      {patient.identification || 'No registrada'}
                    </p>
                  </div>
                </div>

                <Separator className='bg-neutral-200' />

                <div className='flex items-start gap-3'>
                  <Calendar className='h-5 w-5 text-neutral-500 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-neutral-700'>
                      Fecha de Nacimiento
                    </p>
                    <p className='text-sm text-neutral-600'>
                      {formatDate(patient.birthdate)}
                    </p>
                  </div>
                </div>

                <Separator className='bg-neutral-200' />

                <div className='flex items-start gap-3'>
                  <Phone className='h-5 w-5 text-neutral-500 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-neutral-700'>
                      Teléfono
                    </p>
                    <p className='text-sm text-neutral-600'>
                      {patient.phoneNumber || 'No registrado'}
                    </p>
                  </div>
                </div>

                <Separator className='bg-neutral-200' />

                <div className='flex items-start gap-3'>
                  <Briefcase className='h-5 w-5 text-neutral-500 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-neutral-700'>
                      Ocupación
                    </p>
                    <p className='text-sm text-neutral-600'>
                      {patient.job || 'No registrada'}
                    </p>
                  </div>
                </div>

                <Separator className='bg-neutral-200' />

                <div className='flex items-start gap-3'>
                  <Calendar className='h-5 w-5 text-neutral-500 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-neutral-700'>
                      Fecha de Registro
                    </p>
                    <p className='text-sm text-neutral-600'>
                      {formatDate(patient.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna 2 y 3: Historia Clínica, Estudios y Recetas */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Card: Historia Clínica */}
            <Card className='border-neutral-200 shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                  <CardTitle className='text-lg text-neutral-900'>
                    Historia Clínica
                  </CardTitle>

                </div>

                <Link href={`/patients/${params.id}/clinic-history`}>
                  <Button variant='outline' className='border-neutral-300'>
                    <FileText className='mr-2 h-4 w-4' />
                    Ver Todas
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {!clinicHistories || clinicHistories.length === 0 ? (
                  <div className='text-center py-8'>
                    <FileText className='h-12 w-12 text-neutral-400 mx-auto mb-3' />
                    <p className='text-neutral-600 mb-4'>
                      Este paciente no tiene historia clínica registrada
                    </p>
                    <Link
                      href={`/dashboard/patients/${params.id}/clinic-history/new`}>
                      <Button>
                        <Plus className='mr-2 h-4 w-4' />
                        Crear Historia
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {latestHistory && (
                      <div className='p-4 bg-neutral-50 rounded-lg border border-neutral-200'>
                        <div className='flex items-start justify-between mb-2'>
                          <h4 className='font-semibold text-neutral-900'>
                            Registro de Historia 
                          </h4>
                          <Badge variant='secondary' className='bg-neutral-200'>
                            {formatDate(latestHistory.date)}
                          </Badge>
                        </div>
                        <div className='space-y-2'>
                          <div>
                            <p className='text-xs font-medium text-neutral-700 mb-1'>
                              Motivo de Consulta:
                            </p>
                            <p className='text-sm text-neutral-600'>
                              {latestHistory.reason}
                            </p>
                          </div>
                          {latestHistory.treatmentPlan && (
                            <div>
                              <p className='text-xs font-medium text-neutral-700 mb-1'>
                                Plan de Tratamiento:
                              </p>
                              <p className='text-sm text-neutral-600'>
                                {latestHistory.treatmentPlan}
                              </p>
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/patients/${params.id}/clinic-history/${latestHistory.id}`}>
                          <Button
                            variant='ghost'
                            className='mt-2  h-auto text-neutral-900 hover:cursor-pointer'>
                            Ver detalles completos <ArrowRight className='ml-1 h-4 w-4' />
                          </Button>
                        </Link>
                      </div>
                    )}

                    <Link href={`/patients/${params.id}/clinic-evolution/new`}>
                      <Button
                        variant='outline'
                        className='w-full border-neutral-300 border-dashed'>
                        <Plus className='mr-2 h-4 w-4' />
                        Agregar Evolución del Paciente
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card className='border-neutral-200 shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-lg text-neutral-900 flex items-center gap-2'>
                    <ClipboardList className='h-5 w-5' />
                    Estudios
                  </CardTitle>
                  <CardDescription className='text-neutral-600'>
                    Estudios médicos del paciente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-center py-8'>
                    <ClipboardList className='h-12 w-12 text-neutral-400 mx-auto mb-3' />
                    <p className='text-sm text-neutral-600 mb-4'>
                      No hay estudios registrados
                    </p>
                    <Button
                      variant='outline'
                      className='border-neutral-300'
                      disabled>
                      <Plus className='mr-2 h-4 w-4' />
                      Agregar Estudio
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-neutral-200 shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-lg text-neutral-900 flex items-center gap-2'>
                    <Pill className='h-5 w-5' />
                    Recetas
                  </CardTitle>
                  <CardDescription className='text-neutral-600'>
                    Prescripciones médicas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-center py-8'>
                    <Pill className='h-12 w-12 text-neutral-400 mx-auto mb-3' />
                    <p className='text-sm text-neutral-600 mb-4'>
                      No hay recetas registradas
                    </p>
                    <Button
                      variant='outline'
                      className='border-neutral-300'
                      disabled>
                      <Plus className='mr-2 h-4 w-4' />
                      Crear Receta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppSection>
  )
}
