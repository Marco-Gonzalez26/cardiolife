'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Ban, CheckCircle2, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { deleteMedication, setMedicationActive } from '@/actions/medications'
import { ConfirmByNameDialog } from '@/components/confirm-by-name-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

/** Ver y Editar a la vista; Desactivar y Eliminar definitivamente en el menú, lejos del botón de editar */
export const MedicationRowActions = ({
  id,
  name,
  active,
  canModify
}: {
  id: string
  name: string
  active: boolean
  canModify: boolean
}) => {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const changeActive = (next: boolean) =>
    startTransition(async () => {
      const result = await setMedicationActive(id, next)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      if (next) {
        toast.success(`${name} activado`)
        return
      }
      toast.success(`${name} desactivado`, {
        description: 'Ya no aparece al crear recetas. Las recetas firmadas no cambian.',
        action: { label: 'Deshacer', onClick: () => changeActive(true) }
      })
    })

  return (
    <div className='flex items-center justify-end gap-1'>
      <Button asChild variant='ghost' size='sm' className='h-11 gap-1.5 text-primary'>
        <Link href={`/dashboard/medications/${id}`} title='Ver medicamento'>
          <Eye className='size-4' />
          <span className='hidden lg:inline'>Ver</span>
        </Link>
      </Button>
      {canModify && (
        <>
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='h-11 gap-1.5 text-muted-foreground'>
            <Link href={`/dashboard/medications/${id}/edit`} title='Editar medicamento'>
              <Pencil className='size-4' />
              <span className='hidden lg:inline'>Editar</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='size-11'
                aria-label={`Más acciones de ${name}`}>
                <MoreHorizontal className='size-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='min-w-56'>
              {active ? (
                <DropdownMenuItem
                  className='min-h-11'
                  disabled={pending}
                  onSelect={() => changeActive(false)}>
                  <Ban /> Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className='min-h-11'
                  disabled={pending}
                  onSelect={() => changeActive(true)}>
                  <CheckCircle2 /> Activar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                className='min-h-11'
                onSelect={() => setDeleteOpen(true)}>
                <Trash2 /> Eliminar definitivamente…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ConfirmByNameDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title='Eliminar medicamento definitivamente'
            expectedName={name}
            confirmLabel='Eliminar definitivamente'
            successMessage='Medicamento eliminado'
            description={
              <>
                Se eliminará <strong>{name}</strong> con todas sus presentaciones y no se
                podrá recuperar. Si ya fue recetado, la base de datos no lo permitirá: en
                ese caso, desactívalo.
              </>
            }
            onConfirm={(typed) => deleteMedication(id, typed)}
          />
        </>
      )}
    </div>
  )
}
