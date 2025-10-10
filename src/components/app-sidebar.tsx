import { Settings, ChartNoAxesCombined, FileHeart, Users } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { AppSidebarHeader } from '@/components/app-sidebar-header'

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
    name: 'Consultas',
    href: '/dashboard/appointments',
    icon: FileHeart
  },

  {
    name: 'Ajustes',
    href: '/dashboard/settings',
    icon: Settings
  }
]

export const AppSidebar = () => {
  return (
    <Sidebar collapsible='icon' variant='sidebar'>
      <SidebarHeader className='p-1'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild title='Abrir menú'>
              <Link href='/dashboard' prefetch title='Abrir menú'>
                <AppSidebarHeader />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='p-2'>
        <SidebarMenu>
          {sidebarItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                className=''
                asChild
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
    </Sidebar>
  )
}
