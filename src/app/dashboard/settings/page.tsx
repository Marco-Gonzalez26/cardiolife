import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { FileKey2, ShieldCheck, UserRound, Users } from 'lucide-react'
import { AppSection } from '@/components/app-section'
import { DoctorProfileForm } from '@/components/forms/doctor-profile-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { getMfaState } from '@/lib/services/mfa'
import { getDoctorInfo } from '@/lib/services/prescriptions-service'
import { TeamCard } from '@/components/settings/team-card'
import { getMySecretaries } from '@/lib/services/team-service'
import { isAdminConfigured } from '@/lib/supabase/admin'
import { SecurityPanel } from '@/components/security/security-card'
import { CertificateCard } from '@/components/signing/certificate-card'
import { isEncryptionConfigured } from '@/lib/crypto/secret-box'
import { getSigningCertificateInfo } from '@/lib/services/signing-service'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const context = await getDoctorContext(supabase)
  const isDoctor = context?.role === 'doctor'
  const [doctor, mfa, certificate, secretaries] = await Promise.all([
    getDoctorInfo(supabase, context?.doctorId),
    getMfaState(supabase),
    isDoctor ? getSigningCertificateInfo(supabase) : Promise.resolve(null),
    isDoctor && context?.doctorId
      ? getMySecretaries(supabase, context.doctorId)
      : Promise.resolve([])
  ])

  return (
    <AppSection>
      <div className='mx-auto w-full max-w-4xl space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Ajustes</h1>
          <p className='mt-1 text-muted-foreground'>
            {isDoctor
              ? 'Estos datos aparecen en el encabezado y la firma de las recetas en PDF.'
              : 'Información de tu cuenta.'}
          </p>
        </div>

        <Card className='rounded-2xl shadow-sm'>
          <CardHeader className='border-b'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <ShieldCheck className='size-5 text-primary' />
              Seguridad de la cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-4'>
            <SecurityPanel
              enrolled={mfa.enrolled}
              factorId={mfa.factorId}
              factorName={mfa.factorName}
            />
          </CardContent>
        </Card>

        {isDoctor && (
          <Card className='rounded-2xl shadow-sm'>
            <CardHeader className='border-b'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <FileKey2 className='size-5 text-primary' />
                Firma electrónica
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-4'>
              <CertificateCard
                certificate={certificate}
                encryptionConfigured={isEncryptionConfigured()}
              />
            </CardContent>
          </Card>
        )}

        {isDoctor && (
          <Card className='rounded-2xl shadow-sm'>
            <CardHeader className='border-b'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Users className='size-5 text-primary' />
                Equipo (secretarias)
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-4'>
              <TeamCard
                secretaries={secretaries}
                adminConfigured={isAdminConfigured()}
              />
            </CardContent>
          </Card>
        )}

        {isDoctor && doctor ? (
          <Card className='rounded-2xl shadow-sm'>
            <CardHeader className='border-b'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <UserRound className='size-5 text-primary' />
                Perfil del médico
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-2'>
              <DoctorProfileForm
                defaultValues={{
                  fullName: doctor.full_name,
                  specialty: doctor.specialty ?? '',
                  license: doctor.license ?? '',
                  identification: doctor.identification ?? '',
                  phone: doctor.phone ?? '',
                  email: doctor.email,
                  address: doctor.address ?? '',
                  city: doctor.city ?? ''
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className='rounded-2xl shadow-sm'>
            <CardHeader className='border-b'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <UserRound className='size-5 text-primary' />
                Tu cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 pt-4 text-sm'>
              <p>
                <span className='text-muted-foreground'>Correo: </span>
                {context?.email ?? '—'}
              </p>
              <p>
                <span className='text-muted-foreground'>Rol: </span>
                {context?.roleLabel || 'Sin rol asignado'}
              </p>
              {doctor && (
                <p>
                  <span className='text-muted-foreground'>Médico: </span>
                  {doctor.full_name}
                </p>
              )}
              <p className='pt-2 text-muted-foreground'>
                El perfil del consultorio solo lo edita el médico.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppSection>
  )
}
