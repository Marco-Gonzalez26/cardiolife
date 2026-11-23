'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, KeyRound, Loader2, UserCheck } from 'lucide-react'
import {
  grantPortalAccess,
  resetPortalPassword,
  revokePortalAccess
} from '@/actions/patient-portal'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface PortalAccessCardProps {
  patientId: string
  patientName: string
  email: string | null
  hasAccess: boolean
}

type Credentials = { email: string; password: string }

/** Acceso del paciente a su portal: crear cuenta, nueva contraseña temporal o quitar acceso */
export const PortalAccessCard = ({
  patientId,
  patientName,
  email,
  hasAccess
}: PortalAccessCardProps) => {
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState<Credentials | null>(null)

  const run = async (
    action: (id: string) => ReturnType<typeof grantPortalAccess>
  ) => {
    setLoading(true)
    try {
      const result = await action(patientId)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      setCredentials({ email: result.email, password: result.password })
    } finally {
      setLoading(false)
    }
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copiado')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  return (
    <Card className='rounded-2xl shadow-sm'>
      <CardHeader className='border-b'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <UserCheck className='size-5 text-primary' />
          Portal del paciente
          {hasAccess ? (
            <Badge className='bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
              Con acceso
            </Badge>
          ) : (
            <Badge variant='secondary'>Sin acceso</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3 pt-4 text-sm'>
        <p className='text-muted-foreground'>
          {hasAccess
            ? `${patientName} puede ver sus citas, historia, evoluciones y recetas firmadas, y solicitar citas.`
            : email
              ? `Se creará una cuenta con ${email} y una contraseña temporal que debes entregarle al paciente.`
              : 'Para dar acceso, primero registra el correo electrónico del paciente (Editar paciente).'}
        </p>
        <div className='flex flex-wrap gap-2'>
          {hasAccess ? (
            <>
              <Button
                variant='outline'
                className='gap-2'
                disabled={loading}
                onClick={() => run(resetPortalPassword)}>
                {loading ? <Loader2 className='animate-spin' /> : <KeyRound className='size-4' />}
                Nueva contraseña temporal
              </Button>
              <ConfirmDeleteDialog
                title='Quitar acceso al portal'
                triggerLabel='Quitar acceso'
                successMessage='Acceso eliminado'
                description={
                  <>
                    Se eliminará la cuenta del portal de <strong>{patientName}</strong>.
                    Su ficha, historia y recetas no se modifican.
                  </>
                }
                onConfirm={() => revokePortalAccess(patientId)}
              />
            </>
          ) : (
            <Button
              className='gap-2 font-semibold'
              disabled={loading || !email}
              onClick={() => run(grantPortalAccess)}>
              {loading && <Loader2 className='animate-spin' />}
              Dar acceso al portal
            </Button>
          )}
        </div>
      </CardContent>

      <Dialog
        open={Boolean(credentials)}
        onOpenChange={(open) => !open && setCredentials(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-2xl'>Credenciales del paciente</DialogTitle>
            <DialogDescription>
              Entrégaselas por un canal seguro. Esta contraseña no se volverá a mostrar y
              el paciente deberá cambiarla al ingresar.
            </DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className='space-y-3'>
              {[
                { label: 'Usuario (correo)', value: credentials.email },
                { label: 'Contraseña temporal', value: credentials.password }
              ].map((item) => (
                <div
                  key={item.label}
                  className='flex items-center justify-between gap-2 rounded-lg border p-3'>
                  <div className='min-w-0'>
                    <p className='text-xs text-muted-foreground'>{item.label}</p>
                    <p className='break-all font-mono text-sm font-semibold'>
                      {item.value}
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label={`Copiar ${item.label}`}
                    onClick={() => copy(item.value)}>
                    <Copy className='size-4' />
                  </Button>
                </div>
              ))}
              <Button
                variant='outline'
                className='w-full gap-2'
                onClick={() =>
                  copy(
                    `Portal Cardiolife\nUsuario: ${credentials.email}\nContraseña temporal: ${credentials.password}`
                  )
                }>
                <Copy className='size-4' />
                Copiar mensaje completo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
