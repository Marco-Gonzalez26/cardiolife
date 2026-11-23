'use client'

import { ShieldAlert } from 'lucide-react'
import { logout } from '@/actions/auth'
import { MfaEnroll } from '@/components/security/mfa-enroll'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

/**
 * Pantalla que bloquea el dashboard al personal (médico y secretarias) hasta que active la
 * verificación en dos pasos. Los datos clínicos son sensibles: la contraseña sola no basta.
 */
export const MfaGate = () => (
  <div className='flex min-h-screen items-center justify-center bg-background p-4'>
    <Card className='w-full max-w-xl'>
      <CardHeader className='space-y-2'>
        <div className='flex size-11 items-center justify-center rounded-lg bg-amber-100 text-amber-800'>
          <ShieldAlert className='size-6' />
        </div>
        <h1 className='text-xl font-bold'>Activa la verificación en dos pasos</h1>
        <CardDescription>
          Para proteger los datos de los pacientes, el acceso del personal
          requiere un segundo factor. Solo tarda un minuto y se hace una vez por
          dispositivo.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <MfaEnroll />
        <form action={logout}>
          <Button type='submit' variant='ghost' className='text-muted-foreground'>
            Cerrar sesión
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
)
