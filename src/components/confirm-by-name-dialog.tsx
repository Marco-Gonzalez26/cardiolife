'use client'

import { useId, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { nameMatches } from '@/lib/confirm-name'

type ActionResult = { error: string } | { success: true }

interface ConfirmByNameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  /** Nombre que hay que escribir para habilitar el botón */
  expectedName: string
  confirmLabel: string
  successMessage: string
  /** Acción del servidor; recibe lo escrito para que el servidor también lo verifique */
  onConfirm: (typedName: string) => Promise<ActionResult>
}

/** Confirmación para acciones irreversibles: hay que escribir el nombre exacto del registro */
export const ConfirmByNameDialog = ({
  open,
  onOpenChange,
  title,
  description,
  expectedName,
  confirmLabel,
  successMessage,
  onConfirm
}: ConfirmByNameDialogProps) => {
  const inputId = useId()
  const [typed, setTyped] = useState('')
  const [pending, startTransition] = useTransition()
  const matches = nameMatches(expectedName, typed)

  const changeOpen = (next: boolean) => {
    if (!next) setTyped('')
    onOpenChange(next)
  }

  const confirm = () =>
    startTransition(async () => {
      const result = await onConfirm(typed)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(successMessage)
      changeOpen(false)
    })

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className='text-sm text-muted-foreground'>{description}</div>
          </DialogDescription>
        </DialogHeader>
        <form
          className='space-y-4'
          onSubmit={(event) => {
            event.preventDefault()
            if (matches && !pending) confirm()
          }}>
          <div className='space-y-2'>
            <Label htmlFor={inputId}>
              Para confirmar, escribe el nombre: <strong>{expectedName}</strong>
            </Label>
            <Input
              id={inputId}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete='off'
              disabled={pending}
            />
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => changeOpen(false)}
              disabled={pending}>
              Cancelar
            </Button>
            <Button type='submit' variant='destructive' disabled={!matches || pending}>
              {pending ? <Loader2 className='animate-spin' /> : <Trash2 />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
