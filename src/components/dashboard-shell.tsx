import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from './ui/sidebar'
import { AppSidebar } from './app-sidebar'

export async function DashboardShell({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    // redirect('/login')
  }

  // const { data: profile } = await supabase
  //   .from('users')
  //   .select('*')
  //   .eq('id', user.id)
  //   .single()
  // console.log('from dashboard shell', { profile })
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='container mx-auto w-full p-4'>
        <SidebarTrigger className='fixed' />
        {children}
      </main>
    </SidebarProvider>
  )
}
