'use client'

import { useRouter } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

/**
 * Panel lateral de la agenda: muestra el día o el detalle de una cita sin quitarle ancho al calendario.
 * Su estado vive en la URL (?dia=, ?cita=): abrir es navegar y cerrar vuelve a la agenda sin selección.
 */
export const AppointmentsDrawer = ({
  open,
  closeHref,
  title,
  children
}: {
  open: boolean
  /** Adónde ir al cerrar el panel */
  closeHref: string
  title: string
  children: React.ReactNode
}) => {
  const router = useRouter()
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) router.push(closeHref)
      }}>
      <SheetContent side='right' className='w-full gap-0 overflow-y-auto p-0 sm:max-w-md'>
        <SheetHeader className='sr-only'>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Panel de la agenda de citas</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
