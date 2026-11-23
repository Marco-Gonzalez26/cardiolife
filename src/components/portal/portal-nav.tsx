'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Heart } from 'lucide-react'
import { logout } from '@/actions/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ACCOUNT_HREF, PORTAL_LINKS, getActivePortalHref } from '@/lib/portal-nav'
import { cn } from '@/lib/utils'

export const PortalNav = ({ name, initials }: { name: string; initials: string }) => {
  const pathname = usePathname()
  const activeHref = getActivePortalHref(pathname)
  const logoutForm = useRef<HTMLFormElement>(null)

  return (
    <header className='sticky top-0 z-10 border-b bg-card'>
      <div className='mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 md:px-8'>
        <Link
          href='/portal'
          className='flex min-h-11 items-center gap-2 rounded-md font-bold text-primary focus-visible:outline-2 focus-visible:outline-ring'>
          <Heart className='size-5' aria-hidden />
          Cardiolife
        </Link>

        <nav
          aria-label='Portal del paciente'
          className='order-3 flex w-full gap-1 overflow-x-auto md:order-2 md:w-auto'>
          {PORTAL_LINKS.map((link) => {
            const active = link.href === activeHref
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring',
                  active && 'bg-accent text-accent-foreground hover:bg-accent'
                )}>
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className='order-2 ml-auto md:order-3'>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Menú de ${name}`}
              className='flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring'>
              <Avatar className='size-8'>
                <AvatarFallback className='bg-accent text-xs font-semibold text-accent-foreground'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className='hidden sm:block'>{name}</span>
              <ChevronDown className='size-4 text-muted-foreground' aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='min-w-48'>
              <DropdownMenuItem asChild className='min-h-11'>
                <Link href={ACCOUNT_HREF}>Mi cuenta</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='min-h-11'
                onSelect={() => logoutForm.current?.requestSubmit()}>
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <form ref={logoutForm} action={logout} className='hidden' />
        </div>
      </div>
    </header>
  )
}
