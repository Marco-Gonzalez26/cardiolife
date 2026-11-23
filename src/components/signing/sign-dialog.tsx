'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, PenLine } from 'lucide-react'
import { forgetRememberedPassword, signPrescription } from '@/actions/sign-prescription'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SignDialogProps {
  groupId: string
  patientName: string
  hasCertificate: boolean
  /** La contraseña del certificado ya se ingresó en esta sesión */
  passwordRemembered: boolean
}

/** Firma la receta: contraseña del certificado + código del autenticador (se piden en el momento) */
export const SignDialog = ({
  groupId,
  patientName,
  hasCertificate,
  passwordRemembered
}: SignDialogProps) => {
  const [remembered, setRemembered] = useState(passwordRemembered)
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const result = await signPrescription(groupId, password, code)
      if ('error' in result) {
        toast.error(result.error)
        setCode('')
        if ('code' in result && result.code === 'password_required') {
          setRemembered(false)
        }
        return
      }
      toast.success('Receta firmada electrónicamente')
      setRemembered(true)
      setPassword('')
      setCode('')
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleForget = async () => {
    await forgetRememberedPassword()
    setRemembered(false)
    toast.success('Contraseña olvidada')
  }

  if (!hasCertificate) {
    return (
      <Button asChild variant='outline' className='gap-2 font-semibold'>
        <Link href='/dashboard/settings'>
          <PenLine className='size-4' />
          Configurar firma electrónica
        </Link>
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2 font-semibold'>
          <PenLine className='size-4' />
          Firmar electrónicamente
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>Firmar receta</DialogTitle>
          <DialogDescription>
            Receta de {patientName}. Después de firmarla ya no se podrá editar ni
            eliminar; solo anular.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {remembered ? (
            <p className='text-muted-foreground flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm'>
              Usaremos la contraseña de tu certificado ingresada en esta sesión.
              <Button
                type='button'
                variant='link'
                className='h-auto p-0 text-sm'
                onClick={handleForget}>
                Olvidar
              </Button>
            </p>
          ) : (
            <div className='space-y-2'>
              <Label htmlFor='sign-password' className='font-semibold'>
                Contraseña de tu certificado
              </Label>
              <Input
                id='sign-password'
                type='password'
                autoComplete='current-password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className='h-11'
              />
              <p className='text-muted-foreground text-xs'>
                Se pide una sola vez por sesión.
              </p>
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='sign-code' className='font-semibold'>
              Código del autenticador
            </Label>
            <Input
              id='sign-code'
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              inputMode='numeric'
              autoComplete='one-time-code'
              placeholder='123456'
              className='h-11 text-center text-xl tracking-[0.4em]'
            />
          </div>
          <Button
            type='submit'
            disabled={loading || (!remembered && !password) || code.length !== 6}
            className='h-11 w-full font-semibold'>
            {loading ? <Loader2 className='animate-spin' /> : <PenLine />}
            Firmar receta
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
