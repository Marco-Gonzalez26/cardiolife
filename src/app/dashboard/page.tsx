import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppSection } from '@/components/app-section'
import { AttentionPanel } from '@/components/dashboard/attention-panel'
import { TodaysPatients } from '@/components/dashboard/todays-patients'
import { createClient } from '@/lib/supabase/server'
import {
  CLINIC_TIME_ZONE,
  getDraftEvolutions,
  getDraftHistories,
  getPendingAppointments,
  getHighRiskPatients,
  getTodayAppointments,
  getTodayISO
} from '@/lib/services/dashboard-service'

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ filtro?: string }>
}) {
  const { filtro } = await searchParams
  const onlyCritical = filtro === 'criticos'

  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [appointments, highRisk, drafts, draftEvolutions, pending] = await Promise.all([
    getTodayAppointments(supabase, getTodayISO(), onlyCritical),
    getHighRiskPatients(supabase),
    getDraftHistories(supabase),
    getDraftEvolutions(supabase),
    getPendingAppointments(supabase, getTodayISO())
  ])

  const todayLabel = new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'long',
    timeZone: CLINIC_TIME_ZONE
  }).format(new Date())

  return (
    <AppSection>
      <div className='w-full space-y-8'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-bold tracking-tight text-foreground'>
            Panel de Control
          </h1>
          <p className='text-muted-foreground'>
            Visión general de pacientes para hoy, {todayLabel}.
          </p>
        </div>
        <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
          <div className='xl:col-span-2'>
            <TodaysPatients
              appointments={appointments}
              onlyCritical={onlyCritical}
            />
          </div>
          <AttentionPanel
            highRisk={highRisk}
            drafts={drafts}
            draftEvolutions={draftEvolutions}
            pending={pending}
          />
        </div>
      </div>
    </AppSection>
  )
}
