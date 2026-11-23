import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChangePasswordForm } from '@/components/portal/change-password-form'
import { formatDate } from '@/lib/format-date'
import { getCurrentPortalPatient } from '@/lib/services/portal-service'

export default async function PortalAccountPage() {
  const session = await getCurrentPortalPatient()
  if (!session) return null
  const { patient } = session

  return (
    <>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Mi cuenta</h1>
      </div>
      <Card className='rounded-2xl shadow-sm'>
        <CardHeader>
          <CardTitle className='text-base'>Mis datos</CardTitle>
        </CardHeader>
        <CardContent className='space-y-1 text-sm'>
          <p>
            <span className='text-muted-foreground'>Nombre: </span>
            {patient.names} {patient.lastnames}
          </p>
          <p>
            <span className='text-muted-foreground'>Cédula: </span>
            {patient.identification ?? '—'}
          </p>
          <p>
            <span className='text-muted-foreground'>Fecha de nacimiento: </span>
            {formatDate(patient.birthdate) || '—'}
          </p>
          <p>
            <span className='text-muted-foreground'>Correo: </span>
            {patient.email ?? '—'}
          </p>
          <p className='pt-2 text-muted-foreground'>
            Si algún dato es incorrecto, avísale al consultorio.
          </p>
        </CardContent>
      </Card>
      <Card className='rounded-2xl shadow-sm'>
        <CardHeader>
          <CardTitle className='text-base'>Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </>
  )
}
