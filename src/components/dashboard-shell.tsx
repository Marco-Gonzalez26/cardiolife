import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'

import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from './ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { cookies } from 'next/headers'
import { DB_TABLES } from '@/lib/constants'
export async function DashboardShell({
  children
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sidebarDefaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'
  const supabase = await createSupabaseServerClient(cookieStore)

  const { data, error } = await supabase.auth.getClaims()

  if (error || !data) {
    console.log('no user', error, { data })
    // redirect('/login')
  }

  // const { data: profile } = await supabase
  //   .from(DB_TABLES.DOCTOR_PROFILE)
  //   .select('*')
  //   .eq('id', user.id!)
  //   .single()
  // console.log('from dashboard shell', { profile })
  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <AppSidebar />
      <main className='mx-auto w-full p-4 h-screen'>
        <SidebarTrigger className='fixed' />
        {children}
      </main>
    </SidebarProvider>
  )
}
