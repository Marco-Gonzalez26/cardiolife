'use client'
import {
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
    name: 'Recetas',
    href: '/dashboard/recipes',
    icon: FileHeart
  },
  {
    name: 'Medicamentos',
    href: '/dashboard/medications',
    icon: PillBottle
  },

  {
    name: 'Ajustes',
    href: '/dashboard/settings',
    icon: Settings
  }
]

export const AppSidebar = () => {
  const pathname = usePathname()
  return (
    <Sidebar collapsible='icon' variant='sidebar'>
      <SidebarHeader className='p-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild title='Abrir menú'>
              <Link href='/dashboard' prefetch title='Abrir menú'>
                <>
                  <AppSidebarHeader />
                </>
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
