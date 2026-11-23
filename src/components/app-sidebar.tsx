'use client'
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Settings,
  ChartNoAxesCombined,
  FileHeart,
  Users,
  PillBottle
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { AppSidebarHeader } from '@/components/app-sidebar-header'
import { usePathname } from 'next/navigation'

const isActivePath = (pathname: string, href: string) =>
  href === '/dashboard'
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)

type Role = 'doctor' | 'secretary' | null

const sidebarItems = [
  {
    name: 'Panel de control',
    href: '/dashboard',
    icon: ChartNoAxesCombined
  },
  {
    name: 'Pacientes',
    href: '/dashboard/patients',
    icon: Users
  },
  {
    name: 'Citas',
    href: '/dashboard/appointments',
    icon: CalendarDays
  },
  {
    name: 'Historias',
    href: '/dashboard/clinic-history',
    icon: ClipboardList
  },
  {
    name: 'Evoluciones',
    href: '/dashboard/evolutions',
    icon: Activity
  },
  {
    name: 'Recetas',
    href: '/dashboard/recipes',
    icon: FileHeart
  },
  {
    name: 'Medicamentos',
    href: '/dashboard/medications',
    icon: PillBottle,
    /** El catálogo lo administra el médico */
    doctorOnly: true
  },

  {
    name: 'Ajustes',
    href: '/dashboard/settings',
    icon: Settings
  }
]

export const AppSidebar = ({ role }: { role: Role }) => {
  const pathname = usePathname()
  const items = sidebarItems.filter(
    (item) => !('doctorOnly' in item && item.doctorOnly) || role === 'doctor'
  )
  return (
    <Sidebar collapsible='icon' variant='sidebar'>
      <SidebarHeader className='p-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size='lg' title='Abrir menú'>
              <Link href='/dashboard' prefetch title='Abrir menú'>
                <AppSidebarHeader />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='p-2'>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                className='h-10 rounded-md px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground'
                asChild
                isActive={isActivePath(pathname, item.href)}
                tooltip={{ children: item.name }}>
                <Link href={item.href} prefetch>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className='p-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild title='Cerrar menú'></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
