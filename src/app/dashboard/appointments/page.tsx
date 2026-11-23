import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AppSection } from '@/components/app-section'
import { AppointmentDetails } from '@/components/appointments/appointment-details'
import { AppointmentSearchResults } from '@/components/appointments/appointment-search-results'
import { AppointmentsDrawer } from '@/components/appointments/appointments-drawer'
import { DayAgenda } from '@/components/appointments/day-agenda'
import { MonthCalendar } from '@/components/appointments/month-calendar'
import { NewAppointmentDialog } from '@/components/appointments/new-appointment-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  addMonths,
  formatIsoDate,
  getMonthGrid,
  nowInClinic
} from '@/lib/date-utils'
import { filterAppointments } from '@/lib/appointment-search'
import {
  getAppointmentById,
  getAppointmentsBetween,
  getAppointmentsForSearch,
  getPatientOptions
} from '@/lib/services/appointments-service'
import { createClient } from '@/lib/supabase/server'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const ISO_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export default async function AppointmentsPage({
  searchParams
}: {
  searchParams: Promise<{
    mes?: string
    dia?: string
    cita?: string
    paciente?: string
    q?: string
  }>
}) {
  const { mes, dia, cita, paciente, q } = await searchParams

  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const today = nowInClinic().date

  // Si llega ?cita=, se abre en el mes y el día de esa cita
  const selectedId = cita && UUID.test(cita) ? cita : undefined
  const selectedFromUrl = selectedId
    ? await getAppointmentById(supabase, selectedId)
    : null

  const requestedDay = dia && ISO_DATE.test(dia) ? dia : undefined
  const month =
    mes && ISO_MONTH.test(mes)
      ? mes
      : (requestedDay?.slice(0, 7) ??
        selectedFromUrl?.date.slice(0, 7) ??
        today.slice(0, 7))

  const { gridStart, gridEnd } = getMonthGrid(month)
  const [monthAppointments, patients] = await Promise.all([
    getAppointmentsBetween(supabase, gridStart, gridEnd),
    getPatientOptions(supabase)
  ])

  const selectedDay =
    requestedDay ??
    selectedFromUrl?.date ??
    (today.startsWith(month) ? today : `${month}-01`)

  const selected = selectedId
    ? (monthAppointments.find((item) => item.id === selectedId) ??
      selectedFromUrl)
    : null

  const dayAppointments = monthAppointments.filter(
    (item) => item.date === selectedDay && item.status !== 'Cancelada'
  )

  const title = capitalize(
    formatIsoDate(`${month}-01`, { month: 'long', year: 'numeric' })
  )
  const monthHref = (target: string) => `/dashboard/appointments?mes=${target}`

  const presetPatient = patients.some((patient) => patient.id === paciente)
    ? paciente
    : undefined

  // Buscar desde la barra superior (?q=) lista las citas que coinciden, de cualquier fecha
  const searchTerm = (q ?? '').trim().slice(0, 80)
  const searching = Boolean(searchTerm) && !selected && !requestedDay
  const searchResults = searching
    ? filterAppointments(await getAppointmentsForSearch(supabase), searchTerm)
    : []

  // El panel lateral se abre cuando la URL pide un día, una cita o una búsqueda
  const drawerOpen = Boolean(selected || requestedDay || searching)

  return (
    <AppSection>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Agenda de Citas</h1>
          <p className='mt-1 text-muted-foreground'>
            Gestiona tu horario y las citas de tus pacientes.
          </p>
        </div>

        <div className='space-y-4'>
          <Card className='flex-row flex-wrap items-center justify-between gap-4 rounded-2xl p-4 shadow-sm'>
            <h2 className='text-2xl font-semibold'>{title}</h2>
            <div className='flex flex-wrap items-center gap-2'>
              <Button asChild variant='outline' size='icon' title='Mes anterior'>
                <Link href={monthHref(addMonths(month, -1))} aria-label='Mes anterior'>
                  <ChevronLeft />
                </Link>
              </Button>
              <Button asChild variant='outline'>
                <Link href='/dashboard/appointments'>Hoy</Link>
              </Button>
              <Button asChild variant='outline' size='icon' title='Mes siguiente'>
                <Link href={monthHref(addMonths(month, 1))} aria-label='Mes siguiente'>
                  <ChevronRight />
                </Link>
              </Button>
              <NewAppointmentDialog
                key={`nueva-${presetPatient ?? 'sin-paciente'}`}
                patients={patients}
                defaultPatientId={presetPatient}
                defaultDate={today}
              />
            </div>
          </Card>

          <MonthCalendar
            month={month}
            appointments={monthAppointments}
            selectedDay={selectedDay}
            selectedId={selected?.id}
          />
        </div>

        <AppointmentsDrawer
          open={drawerOpen}
          closeHref={monthHref(month)}
          title={
            selected
              ? 'Detalles de la cita'
              : searching
                ? 'Resultados de la búsqueda'
                : 'Agenda del día'
          }>
          {selected ? (
            <AppointmentDetails
              appointment={selected}
              backHref={`/dashboard/appointments?mes=${month}&dia=${selectedDay}`}
            />
          ) : searching ? (
            <AppointmentSearchResults term={searchTerm} results={searchResults} />
          ) : (
            <DayAgenda
              day={selectedDay}
              appointments={dayAppointments}
              action={
                <NewAppointmentDialog
                  key={`dia-${selectedDay}`}
                  patients={patients}
                  defaultDate={selectedDay < today ? today : selectedDay}
                  triggerLabel='Agendar en este día'
                  triggerVariant='outline'
                />
              }
            />
          )}
        </AppointmentsDrawer>
      </div>
    </AppSection>
  )
}
