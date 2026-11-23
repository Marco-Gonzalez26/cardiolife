import { Suspense } from 'react'
import { Bell, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SectionSearch } from '@/components/section-search'
import type { DoctorContext } from '@/lib/services/doctor-context'

const getInitials = (name: string) =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

export const DashboardTopbar = ({
  context
}: {
  context: DoctorContext | null
}) => {
  return (
    <header className='sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-8'>
      <SidebarTrigger className='-ml-2 text-muted-foreground' />
      <Suspense fallback={null}>
        <SectionSearch />
      </Suspense>
      <div className='ml-auto flex items-center gap-4'>
        {/* Sin fuente de datos todavía: notifications_log es de salida, no una bandeja */}
        <button
          type='button'
          aria-label='Notificaciones'
          className='relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'>
          <Bell className='size-5' />
        </button>
        {context && (
          <div className='flex items-center gap-3'>
            <div className='hidden text-right sm:block'>
              <p className='text-sm font-medium leading-none text-foreground'>
                {context.displayName}
              </p>
              {context.roleLabel && (
                <p className='mt-1 text-xs text-muted-foreground'>
                  {context.roleLabel}
                </p>
              )}
            </div>
            <Avatar className='size-9 border border-border'>
              <AvatarFallback className='bg-accent text-sm font-semibold text-accent-foreground'>
                {getInitials(context.displayName)}
              </AvatarFallback>
            </Avatar>
            <form action={logout}>
              <button
                type='submit'
                aria-label='Cerrar sesión'
                title='Cerrar sesión'
                className='rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'>
                <LogOut className='size-5' />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
