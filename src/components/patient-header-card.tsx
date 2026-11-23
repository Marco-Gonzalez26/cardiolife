import { Cake, CheckCircle2, Droplets, History, IdCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/format-date'

export interface PatientHeader {
  names: string
  lastnames: string
  identification: string | null
  age: string | null
  birthdate: string | null
  blood_type: string | null
  status: string | null
}

/** Cabecera con los datos del paciente (nombre, cédula, edad, sangre, estado, última visita) */
export const PatientHeaderCard = ({
  patient,
  lastVisit,
  extraBadges
}: {
  patient: PatientHeader
  /** Fecha (ISO) de la última historia completada */
  lastVisit?: string | null
  extraBadges?: React.ReactNode
}) => (
  <Card className='shadow-sm'>
    <CardContent className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-semibold tracking-tight'>
          {patient.names} {patient.lastnames}
        </h2>
        <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground'>
          {patient.identification && (
            <span className='flex items-center gap-1.5'>
              <IdCard className='size-4' />
              ID: {patient.identification}
            </span>
          )}
          {patient.birthdate && (
            <span className='flex items-center gap-1.5'>
              <Cake className='size-4' />
              {patient.age ? `${patient.age} años ` : ''}(
              {formatDate(patient.birthdate)}
              )
            </span>
          )}
          {patient.blood_type && (
            <span className='flex items-center gap-1.5'>
              <Droplets className='size-4' />
              {patient.blood_type}
            </span>
          )}
        </div>
      </div>
      <div className='flex flex-wrap gap-2'>
        {extraBadges}
        <Badge className='border-emerald-200 bg-emerald-50 text-emerald-800'>
          <CheckCircle2 />
          {patient.status ?? 'Estable'}
        </Badge>
        {lastVisit && (
          <Badge variant='outline'>
            <History />
            Últ. visita:{' '}
            {formatDate(lastVisit)}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
)
