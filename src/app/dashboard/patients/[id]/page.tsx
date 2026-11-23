import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CalendarClock,
  Activity,
  CheckCircle2,
  Pill,
  FilePlus2,
  FileText,
  Mail,
  Pencil,
  Phone,
  Briefcase
} from 'lucide-react'
import { AppSection } from '@/components/app-section'
import { PatientNotFound } from '@/components/patient-not-found'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { getTodayISO } from '@/lib/services/dashboard-service'
import { cn } from '@/lib/utils'
import { PortalAccessCard } from '@/components/patients/portal-access-card'
import { formatDate } from '@/lib/format-date'

type HistoryRow = {
  id: number
  date: string | null
  created_at: string
  status: 'draft' | 'completed'
  reason: string | null
  diagnosis: string | null
  physical_exam: { weight: string | null; height: string | null } | null
}

type EvolutionRow = {
  id: string
  created_at: string
  diagnosis: string | null
  treatment_plan: string | null
}

type PrescriptionRow = {
  prescription_group_id: string | null
  id: string
  issued_at: string | null
  medication_snapshot: { name: string; dose: string; unit: string }
}

type AppointmentRow = {
  id: string
  date: string
  time: string
  type: string
  status: string
}

/** "03/10/2026 · 09:30" */
const formatAppointment = (date: string, time: string) =>
  `${formatDate(date)} · ${time.slice(0, 5)}`

const InfoTile = ({
  label,
  value,
  className
}: {
  label: string
  value: string
  className?: string
}) => (
  <div className={cn('rounded-lg border bg-background p-4', className)}>
    <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
      {label}
    </p>
    <p className='mt-1 font-medium text-foreground'>{value}</p>
  </div>
)

export default async function PatientViewPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [
    { data: patient },
    { data: histories },
    { data: appointments },
    { data: evolutions },
    { data: prescriptions },
    context
  ] = await Promise.all([
      supabase.from('patient').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('clinic_history')
        .select(
          'id, date, created_at, status, reason, diagnosis, physical_exam(weight, height)'
        )
        .eq('patient_id', id)
        .order('date', { ascending: false }),
      supabase
        .from('citas')
        .select('id, date, time, type, status')
        .eq('patient_id', id)
        .gte('date', getTodayISO())
        .neq('status', 'Cancelada')
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(5),
      supabase
        .from('evolution')
        .select('id, created_at, diagnosis, treatment_plan')
        .eq('patient_id', id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('prescriptions')
        .select('id, prescription_group_id, issued_at, medication_snapshot')
        .eq('patient_id', id)
        .order('issued_at', { ascending: false })
        .limit(60),
      getDoctorContext(supabase)
    ])

  if (!patient) return <PatientNotFound />

  const historyList = (histories ?? []) as unknown as HistoryRow[]
  const appointmentList = (appointments ?? []) as AppointmentRow[]
  const evolutionList = (evolutions ?? []) as EvolutionRow[]
  const isDoctor = context?.role === 'doctor'

  // Una receta = varias filas con el mismo prescription_group_id
  const recipeGroups = new Map<string, { issuedAt: string; names: string[] }>()
  for (const row of (prescriptions ?? []) as PrescriptionRow[]) {
    const key = row.prescription_group_id ?? row.id
    const group = recipeGroups.get(key) ?? {
      issuedAt: row.issued_at ?? '',
      names: []
    }
    group.names.push(row.medication_snapshot.name)
    recipeGroups.set(key, group)
  }
  const recipeList = [...recipeGroups.entries()].slice(0, 5)
  const latestCompleted = historyList.find((h) => h.status === 'completed')
  const vitals = latestCompleted?.physical_exam
  const initials = `${patient.names[0] ?? ''}${patient.lastnames[0] ?? ''}`.toUpperCase()
  const fullName = `${patient.names} ${patient.lastnames}`

  return (
    <AppSection>
      <div className='w-full space-y-6'>
        <nav aria-label='Ruta' className='text-sm text-muted-foreground'>
          <Link href='/dashboard/patients' className='hover:text-foreground'>
            Pacientes
          </Link>
          <span className='mx-2'>›</span>
          <span className='text-foreground'>{fullName}</span>
        </nav>

        <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Ficha del Paciente
          </h1>
          <div className='flex flex-wrap gap-2'>
            <Button asChild variant='outline' className='font-semibold'>
              <Link href={`/dashboard/patients/${id}/edit`}>
                <Pencil />
                Editar
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              className='border-primary font-semibold text-primary hover:text-primary'>
              <a href='#historias'>Historial Completo</a>
            </Button>
            <Button asChild className='font-semibold'>
              <Link href={`/dashboard/appointments?paciente=${id}`}>
                Agendar Consulta
              </Link>
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <div className='space-y-6 lg:col-span-1'>
          <Card className='rounded-2xl shadow-sm'>
            <CardContent className='space-y-6'>
              <div className='flex flex-col items-center gap-3 text-center'>
                <div className='relative'>
                  <div className='flex size-24 items-center justify-center rounded-full bg-accent text-3xl font-bold text-accent-foreground'>
                    {initials}
                  </div>
                  <span
                    title={patient.status ?? 'Estable'}
                    className='absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-card bg-emerald-500 text-white'>
                    <CheckCircle2 className='size-4' />
                  </span>
                </div>
                <div>
                  <h2 className='text-xl font-semibold'>{fullName}</h2>
                  <p className='text-sm text-muted-foreground'>
                    {[
                      patient.identification && `ID: ${patient.identification}`,
                      patient.age && `${patient.age} años`
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <InfoTile label='Sangre' value={patient.blood_type || '—'} />
                <InfoTile
                  label='Peso / Altura'
                  value={
                    vitals?.weight && vitals?.height
                      ? `${vitals.weight} kg / ${vitals.height} cm`
                      : '—'
                  }
                />
                <InfoTile
                  className='col-span-2'
                  label='Condición principal'
                  value={
                    latestCompleted?.diagnosis || 'Sin diagnóstico registrado'
                  }
                />
              </div>

              <ul className='space-y-3 border-t pt-4 text-sm'>
                <li className='flex items-center gap-3 text-muted-foreground'>
                  <Phone className='size-4 shrink-0' />
                  {patient.phone_number || 'Teléfono no registrado'}
                </li>
                <li className='flex items-center gap-3 text-muted-foreground'>
                  <Mail className='size-4 shrink-0' />
                  <span className='truncate'>
                    {patient.email || 'Correo no registrado'}
                  </span>
                </li>
                <li className='flex items-center gap-3 text-muted-foreground'>
                  <Briefcase className='size-4 shrink-0' />
                  {patient.job || 'Ocupación no registrada'}
                </li>
              </ul>
            </CardContent>
          </Card>
            <PortalAccessCard
              patientId={patient.id}
              patientName={fullName}
              email={patient.email}
              hasAccess={Boolean(patient.user_id)}
            />
          </div>

          <div className='space-y-6 lg:col-span-2'>
            <Card id='historias' className='rounded-2xl shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between border-b pb-4'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <FileText className='size-5 text-primary' />
                  Historias Clínicas
                </CardTitle>
                <Button asChild size='sm'>
                  <Link href={`/dashboard/patients/${id}/clinic-history/new`}>
                    <FilePlus2 />
                    Nueva historia
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className='pt-4'>
                {historyList.length === 0 ? (
                  <p className='py-8 text-center text-muted-foreground'>
                    Este paciente aún no tiene historias clínicas.
                  </p>
                ) : (
                  <ul className='divide-y'>
                    {historyList.map((history) => (
                      <li
                        key={history.id}
                        className='flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center'>
                        <div className='min-w-0 space-y-1'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <span className='font-semibold'>
                              {formatDate(history.date ?? history.created_at)}
                            </span>
                            {history.status === 'draft' ? (
                              <Badge className='border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100'>
                                Borrador
                              </Badge>
                            ) : (
                              <Badge className='border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
                                Completada
                              </Badge>
                            )}
                          </div>
                          <p className='truncate text-sm text-muted-foreground'>
                            {history.reason || 'Sin motivo de consulta'}
                          </p>
                          {history.diagnosis && (
                            <p className='truncate text-sm'>
                              <span className='text-muted-foreground'>
                                Diagnóstico:{' '}
                              </span>
                              {history.diagnosis}
                            </p>
                          )}
                        </div>
                        <Button asChild variant='outline' size='sm'>
                          <Link
                            href={`/dashboard/patients/${id}/clinic-history/new?historia=${history.id}${history.status === 'completed' ? '&modo=ver' : ''}`}>
                            {history.status === 'draft' ? 'Continuar' : 'Ver'}
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className='rounded-2xl shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between border-b pb-4'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Activity className='size-5 text-primary' />
                  Evoluciones
                </CardTitle>
                {isDoctor && (
                  <Button asChild size='sm'>
                    <Link href={`/dashboard/patients/${id}/evolutions/new`}>
                      <FilePlus2 />
                      Nueva evolución
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent className='pt-4'>
                {evolutionList.length === 0 ? (
                  <p className='py-4 text-center text-muted-foreground'>
                    Aún no hay evoluciones registradas.
                  </p>
                ) : (
                  <ul className='divide-y'>
                    {evolutionList.map((evolution) => (
                      <li
                        key={evolution.id}
                        className='flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center'>
                        <div className='min-w-0'>
                          <p className='font-semibold'>
                            {formatDate(evolution.created_at)}
                          </p>
                          <p className='truncate text-sm text-muted-foreground'>
                            {evolution.diagnosis || 'Sin diagnóstico'}
                          </p>
                        </div>
                        <Button asChild variant='outline' size='sm'>
                          <Link
                            href={`/dashboard/patients/${id}/evolutions/${evolution.id}`}>
                            Ver
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className='rounded-2xl shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between border-b pb-4'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Pill className='size-5 text-primary' />
                  Recetas
                </CardTitle>
                {isDoctor && (
                  <Button asChild size='sm'>
                    <Link href={`/dashboard/recipes/new?paciente=${id}`}>
                      <FilePlus2 />
                      Nueva receta
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent className='pt-4'>
                {recipeList.length === 0 ? (
                  <p className='py-4 text-center text-muted-foreground'>
                    Aún no hay recetas emitidas.
                  </p>
                ) : (
                  <ul className='divide-y'>
                    {recipeList.map(([groupId, recipe]) => (
                      <li
                        key={groupId}
                        className='flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center'>
                        <div className='min-w-0'>
                          <p className='font-semibold'>
                            {recipe.issuedAt
                              ? formatDate(recipe.issuedAt)
                              : 'Sin fecha'}
                          </p>
                          <p className='truncate text-sm text-muted-foreground'>
                            {recipe.names.join(', ')}
                          </p>
                        </div>
                        <Button asChild variant='outline' size='sm'>
                          <Link href={`/dashboard/recipes/${groupId}`}>Ver</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className='rounded-2xl shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between border-b pb-4'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <CalendarClock className='size-5 text-primary' />
                  Próximas Citas
                </CardTitle>
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/dashboard/appointments?paciente=${id}`}>
                    Agendar
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className='pt-4'>
                {appointmentList.length === 0 ? (
                  <p className='py-4 text-center text-muted-foreground'>
                    No hay citas próximas.
                  </p>
                ) : (
                  <ul className='divide-y'>
                    {appointmentList.map((appointment) => (
                      <li
                        key={appointment.id}
                        className='flex items-center justify-between gap-3 py-3'>
                        <div>
                          <p className='font-medium'>
                            {formatAppointment(
                              appointment.date,
                              appointment.time
                            )}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {appointment.type}
                          </p>
                        </div>
                        <Badge variant='outline'>{appointment.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppSection>
  )
}
