import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PrescriptionPreview } from '@/components/pdfs/pdf-renderer'
import { MyTestDocument } from './pdfs/test-pdf'
import { Dispatch, SetStateAction } from 'react'

interface RecipeDialogProps {
  open: boolean
  handleClose: Dispatch<SetStateAction<boolean>>
}

export const DialogDemo = ({ open, handleClose }: RecipeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant='outline'>Abrir receta</Button>
      </DialogTrigger>
      <DialogContent className='h-[85vh] sm:max-w-[900px] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Receta</DialogTitle>
        </DialogHeader>
        <div className='h-full w-full flex'>
          <PrescriptionPreview patientName='Ana María Pérez González' />
        </div>
      </DialogContent>
    </Dialog>
  )
}
