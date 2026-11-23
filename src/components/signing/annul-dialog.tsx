'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Ban, Loader2 } from 'lucide-react'
import { annulPrescription } from '@/actions/sign-prescription'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/** Anula una receta firmada (queda el registro y el PDF original; el PDF se marca como anulado) */
export const AnnulDialog = ({ groupId }: { groupId: string }) => {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const result = await annulPrescription(groupId, reason)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Receta anulada')
      setOpen(false)
      setReason('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='gap-2 border-red-200 font-semibold text-red-700 hover:bg-red-50 hover:text-red-700'>
          <Ban className='size-4' />
          Anular
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Anular receta firmada</DialogTitle>
          <DialogDescription>
            La receta no se elimina: queda registrada como anulada y el PDF se
            marcará con &quot;ANULADA&quot;. Para corregirla, emite una receta nueva.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='annul-reason' className='font-semibold'>
            Motivo de la anulación
          </Label>
          <Textarea
            id='annul-reason'
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder='Ej. Error en la dosis del medicamento'
            className='min-h-[90px] resize-none'
          />
        </div>
        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            disabled={loading || reason.trim().length < 5}>
            {loading ? <Loader2 className='animate-spin' /> : <Ban />}
            Anular receta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
