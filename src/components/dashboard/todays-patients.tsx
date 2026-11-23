import Link from 'next/link'
import { AlertTriangle, IdCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { TodayAppointment } from '@/lib/services/dashboard-service'

const getInitials = (names: string, lastnames: string) =>
  `${names[0] ?? ''}${lastnames[0] ?? ''}`.toUpperCase()

/** "09:00:00" -> "09:00 AM" */
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`
}

const isHighRisk = (risk: string | null) => risk === 'Alto'

const ClinicalStatus = ({
  risk,
  status
}: {
  risk: string | null
  status: string | null
}) => {
  if (isHighRisk(risk)) {
    return (
      <Badge className='rounded-full border-transparent bg-red-100 px-2.5 text-red-800 hover:bg-red-100'>
        <AlertTriangle />
        Riesgo Alto
      </Badge>
    )
  }
  const label = status ?? 'Estable'
  const stable = label === 'Estable'
  return (
    <Badge
      className={cn(
        'rounded-full border-transparent px-2.5',
        stable
          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
          : 'bg-slate-100 text-slate-800 hover:bg-slate-100'
      )}>
      {label}
    </Badge>
  )
}

export const TodaysPatients = ({
  appointments,
  onlyCritical
}: {
  appointments: TodayAppointment[]
  onlyCritical: boolean
}) => {
  return (
    <Card className='shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between pb-4'>
        <CardTitle className='text-lg'>Pacientes del Día</CardTitle>
        <div className='flex items-center gap-2'>
          <Button
            asChild
            size='sm'
            variant={onlyCritical ? 'outline' : 'default'}>
            <Link href='/dashboard'>Todos</Link>
          </Button>
          <Button
            asChild
            size='sm'
            variant={onlyCritical ? 'default' : 'outline'}>
            <Link href='/dashboard?filtro=criticos'>Críticos</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='h-10 px-6 text-muted-foreground'>
                Paciente
              </TableHead>
              <TableHead className='h-10 px-6 text-muted-foreground'>
                Motivo
              </TableHead>
              <TableHead className='h-10 px-6 text-muted-foreground'>
                Estado
              </TableHead>
              <TableHead className='h-10 px-6 text-right text-muted-foreground'>
                Acción
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 && (
              <TableRow className='hover:bg-transparent'>
                <TableCell
                  colSpan={4}
                  className='px-6 py-10 text-center text-muted-foreground'>
                  {onlyCritical
                    ? 'No hay pacientes críticos con cita hoy.'
                    : 'No hay citas programadas para hoy.'}
                </TableCell>
              </TableRow>
            )}
            {appointments.map((appointment) => {
              const { patient } = appointment
              const highRisk = isHighRisk(patient.risk)
              return (
                <TableRow key={appointment.id}>
                  <TableCell className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                          highRisk
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        )}>
                        {getInitials(patient.names, patient.lastnames)}
                      </div>
                      <div className='flex flex-col'>
                        <span className='font-medium text-foreground'>
                          {patient.names} {patient.lastnames}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {formatTime(appointment.time)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='px-6 py-4 text-muted-foreground'>
                    <span className='block text-foreground/80'>
                      {appointment.type}
                    </span>
                    <span className='text-xs'>{appointment.status}</span>
                  </TableCell>
                  <TableCell className='px-6 py-4'>
                    <ClinicalStatus
                      risk={patient.risk}
                      status={patient.status}
                    />
                  </TableCell>
                  <TableCell className='px-6 py-4 text-right'>
                    <Button
                      asChild
                      size='icon'
                      variant='outline'
                      title='Ver ficha del paciente'>
                      <Link
                        href={`/dashboard/patients/${patient.id}`}
                        aria-label={`Ver ficha de ${patient.names} ${patient.lastnames}`}>
                        <IdCard />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
