'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HISTORY_TABS, isPathWithin } from '@/lib/portal-nav'
import { cn } from '@/lib/utils'

/** Historia clínica y Evoluciones comparten un solo destino de la barra: se alternan con estas pestañas */
export const HistoryTabs = () => {
  const pathname = usePathname()
  return (
    <nav aria-label='Secciones de la historia' className='flex gap-1 border-b'>
      {HISTORY_TABS.map((tab) => {
        const active = isPathWithin(pathname, tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              '-mb-px flex min-h-11 items-center border-b-2 px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
