import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'

import { redirect } from 'next/navigation'
import { SidebarInset, SidebarProvider } from './ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { DashboardTopbar } from './dashboard-topbar'
import { cookies } from 'next/headers'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { getMfaState } from '@/lib/services/mfa'
import { MfaGate } from './security/mfa-gate'

export async function DashboardShell({
  children
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sidebarDefaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'
  const supabase = createSupabaseServerClient(cookieStore)

  const context = await getDoctorContext(supabase)
  if (!context) {
    redirect('/login')
  }

  // Un paciente con cuenta no entra al panel del consultorio: va a su portal
  if (!context.role) {
    const { data: ownPatient } = await supabase
      .from('patient')
      .select('id')
      .eq('user_id', context.userId)
      .maybeSingle()
    if (ownPatient) redirect('/portal')
  }

  // El personal (médico y secretarias) no entra sin verificación en dos pasos activada
  if (context.role) {
    const mfa = await getMfaState(supabase)
    if (!mfa.enrolled) return <MfaGate />
  }

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <AppSidebar role={context.role} />
      <SidebarInset className='bg-background'>
        <DashboardTopbar context={context} />
        <main className='w-full flex-1'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
