'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, Smartphone } from 'lucide-react'
import { MfaEnroll } from '@/components/security/mfa-enroll'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/components-client'

interface SecurityCardProps {
  enrolled: boolean
  factorId: string | null
  factorName: string | null
}

/** Estado de la verificación en dos pasos y cambio de dispositivo (para cuando cambias de teléfono) */
export const SecurityPanel = ({
  enrolled,
  factorId,
  factorName
}: SecurityCardProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const removeDevice = async () => {
    if (!factorId) return
    setLoading(true)
    const { error } = await createClient().auth.mfa.unenroll({ factorId })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Dispositivo quitado. Activa el nuevo para seguir usando el sistema.')
    setOpen(false)
    router.refresh()
  }

  if (!enrolled) {
    return (
      <div className='space-y-4'>
        <p className='flex items-center gap-2 text-sm text-amber-800'>
          <Badge className='border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100'>
            Inactiva
          </Badge>
          Aún no tienes verificación en dos pasos.
        </p>
        <MfaEnroll />
      </div>
    )
  }

  return (
    <div className='flex flex-wrap items-center justify-between gap-4'>
      <div className='flex items-center gap-3'>
        <div className='flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800'>
          <ShieldCheck className='size-5' />
        </div>
        <div>
          <p className='flex items-center gap-2 font-medium'>
            Verificación en dos pasos
            <Badge className='border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
              Activa
            </Badge>
          </p>
          <p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
            <Smartphone className='size-3.5' />
            {factorName ?? 'App de autenticación'}
          </p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant='outline'>Cambiar de dispositivo</Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Cambiar de dispositivo</DialogTitle>
            <DialogDescription>
              Se quitará el autenticador actual y deberás activar el nuevo
              inmediatamente. Hazlo solo si ya tienes tu teléfono nuevo a la
              mano.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={removeDevice} disabled={loading}>
              {loading ? <Loader2 className='animate-spin' /> : null}
              Quitar y activar otro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
