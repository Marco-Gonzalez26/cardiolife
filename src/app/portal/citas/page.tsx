import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PortalAppointmentActions } from '@/components/portal/portal-appointment-actions'
import { RequestAppointmentDialog } from '@/components/portal/request-appointment-dialog'
import { formatDate } from '@/lib/format-date'
import { getTodayISO } from '@/lib/services/dashboard-service'
import { getCurrentPortalPatient } from '@/lib/services/portal-service'

const STATUS_STYLES: Record<string, string> = {
  Pendiente: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  Confirmada: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  Cancelada: 'bg-red-100 text-red-800 hover:bg-red-100',
  Atendida: 'bg-sky-100 text-sky-800 hover:bg-sky-100'
}

export default async function PortalAppointmentsPage() {
  const session = await getCurrentPortalPatient()
  if (!session) return null
  const { supabase, patient } = session

  const { data } = await supabase
    .from('citas')
    .select('id, date, time, type, status, notes')
    .order('date', { ascending: false })
    .order('time', { ascending: false })
    .limit(100)

  const today = getTodayISO()
  const appointments = data ?? []
  const upcoming = appointments
    .filter((item) => item.date >= today && item.status !== 'Cancelada' && item.status !== 'Atendida')
    .reverse()
  const past = appointments.filter((item) => !upcoming.includes(item))

  const renderRow = (item: (typeof appointments)[number], actions: boolean) => (
    <li
      key={item.id}
      className='flex flex-wrap items-center justify-between gap-3 py-3'>
      <div>
        <p className='font-semibold'>
          {formatDate(item.date)} · {String(item.time).slice(0, 5)}
        </p>
        <p className='text-sm text-muted-foreground'>{item.type}</p>
      </div>
      <div className='flex items-center gap-2'>
        <Badge className={STATUS_STYLES[item.status ?? ''] ?? ''}>
          {item.status}
        </Badge>
        {actions && <PortalAppointmentActions id={item.id} date={item.date} />}
      </div>
    </li>
  )

  return (
    <>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Mis citas</h1>
          <p className='mt-1 text-muted-foreground'>
            Las citas que solicites quedan pendientes hasta que el consultorio las confirme.
          </p>
        </div>
        <RequestAppointmentDialog patientId={patient.id} />
      </div>

      <Card className='rounded-2xl shadow-sm'>
        <CardContent>
          <h2 className='mb-1 font-semibold'>Próximas</h2>
          {upcoming.length === 0 ? (
            <p className='py-4 text-sm text-muted-foreground'>No tiene citas próximas.</p>
          ) : (
            <ul className='divide-y'>{upcoming.map((item) => renderRow(item, true))}</ul>
          )}
        </CardContent>
      </Card>

      {past.length > 0 && (
        <Card className='rounded-2xl shadow-sm'>
          <CardContent>
            <h2 className='mb-1 font-semibold'>Anteriores</h2>
            <ul className='divide-y'>{past.map((item) => renderRow(item, false))}</ul>
          </CardContent>
        </Card>
      )}
    </>
  )
}
