'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
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

type ActionResult = { error: string } | { success: true }

interface ConfirmDeleteDialogProps {
  title: string
  description: React.ReactNode
  /** Acción del servidor que elimina; debe devolver { error } o { success: true } */
  onConfirm: () => Promise<ActionResult>
  successMessage: string
  /** Etiqueta accesible del botón de la tabla */
  triggerLabel?: string
  /** Si se indica, navega ahí al terminar (útil cuando el registro eliminado era la página actual) */
  redirectTo?: string
}

/** Botón de papelera que pide confirmación antes de eliminar y refresca la página al terminar */
export const ConfirmDeleteDialog = ({
  title,
  description,
  onConfirm,
  successMessage,
  triggerLabel = 'Eliminar',
  redirectTo
}: ConfirmDeleteDialogProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleConfirm = () =>
    startTransition(async () => {
      const result = await onConfirm()
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(successMessage)
      setOpen(false)
      if (redirectTo) router.push(redirectTo)
    })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          title={triggerLabel}
          aria-label={triggerLabel}
          className='gap-1.5 text-red-700 hover:bg-red-50 hover:text-red-700'>
          <Trash2 className='size-4' />
          <span className='hidden lg:inline'>{triggerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className='text-sm text-muted-foreground'>{description}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            disabled={pending}>
            {pending ? <Loader2 className='animate-spin' /> : <Trash2 />}
            Sí, eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
