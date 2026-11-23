import Link from 'next/link'
import { CalendarClock, FilePen, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type {
  DraftEvolution,
  DraftHistory,
  PatientSummary,
  PendingAppointment
} from '@/lib/services/dashboard-service'
import { formatDate } from '@/lib/format-date'

/** Panel lateral: pacientes de riesgo alto e historias clínicas pendientes de completar */
export const AttentionPanel = ({
  highRisk,
  drafts,
  draftEvolutions,
  pending
}: {
  highRisk: PatientSummary[]
  drafts: DraftHistory[]
  draftEvolutions: DraftEvolution[]
  pending: PendingAppointment[]
}) => {
  return (
    <div className='flex flex-col gap-6'>
      <Card className='shadow-sm'>
        <CardHeader className='border-b pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <CalendarClock className='size-5 text-primary' />
            Citas por confirmar
          </CardTitle>
          <p className='pt-1 text-sm text-muted-foreground'>
            Citas solicitadas que esperan confirmación.
          </p>
        </CardHeader>
        <CardContent className='flex flex-col gap-3 pt-4'>
          {pending.length === 0 && (
            <p className='text-sm text-muted-foreground'>No hay citas por confirmar.</p>
          )}
          {pending.map((item) => (
            <div
              key={item.id}
              className='flex items-center justify-between gap-3 rounded-lg border p-3'>
              <div className='flex flex-col'>
                <span className='text-sm font-semibold text-foreground'>
                  {item.patient.names} {item.patient.lastnames}
                </span>
                <span className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
                  {formatDate(item.date)} · {item.time.slice(0, 5)}
                </span>
              </div>
              <Button asChild size='sm' variant='outline'>
                <Link href={`/dashboard/appointments?mes=${item.date.slice(0, 7)}&dia=${item.date}&cita=${item.id}`}>
                  Revisar
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className='shadow-sm'>
        <CardHeader className='border-b pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <ShieldAlert className='size-5 text-destructive' />
            Pacientes de Riesgo Alto
          </CardTitle>
          <p className='pt-1 text-sm text-muted-foreground'>
            Pacientes marcados con riesgo alto que requieren seguimiento.
          </p>
        </CardHeader>
        <CardContent className='flex flex-col gap-3 pt-4'>
          {highRisk.length === 0 && (
            <p className='text-sm text-muted-foreground'>
              No hay pacientes con riesgo alto.
            </p>
          )}
          {highRisk.map((patient) => (
            <div
              key={patient.id}
              className='flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3'>
              <div className='flex items-center gap-2'>
                <span className='size-2.5 shrink-0 rounded-full bg-red-500' />
                <span className='text-sm font-semibold text-red-900'>
                  {patient.names} {patient.lastnames}
                </span>
              </div>
              <Button asChild size='sm' variant='destructive'>
                <Link href={`/dashboard/patients/${patient.id}`}>Revisar</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className='shadow-sm'>
        <CardHeader className='border-b pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <FilePen className='size-5 text-primary' />
            Historias en Borrador
          </CardTitle>
          <p className='pt-1 text-sm text-muted-foreground'>
            Historias clínicas guardadas sin completar.
          </p>
        </CardHeader>
        <CardContent className='flex flex-col gap-3 pt-4'>
          {drafts.length === 0 && (
            <p className='text-sm text-muted-foreground'>
              No hay borradores pendientes.
            </p>
          )}
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className='flex items-center justify-between gap-3 rounded-lg border p-3'>
              <div className='flex flex-col'>
                <span className='text-sm font-semibold text-foreground'>
                  {draft.patient.names} {draft.patient.lastnames}
                </span>
                <span className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
                  Guardado {formatDate(draft.created_at)}
                </span>
              </div>
              <Button asChild size='sm' variant='outline'>
                <Link
                  href={`/dashboard/patients/${draft.patient_id}/clinic-history/new?historia=${draft.id}`}>
                  Continuar
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className='shadow-sm'>
        <CardHeader className='border-b pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <FilePen className='size-5 text-primary' />
            Evoluciones en Borrador
          </CardTitle>
          <p className='pt-1 text-sm text-muted-foreground'>
            Evoluciones guardadas sin completar.
          </p>
        </CardHeader>
        <CardContent className='flex flex-col gap-3 pt-4'>
          {draftEvolutions.length === 0 && (
            <p className='text-sm text-muted-foreground'>No hay borradores pendientes.</p>
          )}
          {draftEvolutions.map((draft) => (
            <div
              key={draft.id}
              className='flex items-center justify-between gap-3 rounded-lg border p-3'>
              <div className='flex flex-col'>
                <span className='text-sm font-semibold text-foreground'>
                  {draft.patient.names} {draft.patient.lastnames}
                </span>
                <span className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
                  Guardado {formatDate(draft.created_at)}
                </span>
              </div>
              <Button asChild size='sm' variant='outline'>
                <Link
                  href={`/dashboard/patients/${draft.patient_id}/evolutions/${draft.id}?modo=editar`}>
                  Continuar
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
