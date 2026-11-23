import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PortalFooter } from '@/components/portal/portal-footer'
import { PortalNav } from '@/components/portal/portal-nav'
import { getInitials } from '@/lib/initials'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { getPortalPatient } from '@/lib/services/portal-service'
import { createClient } from '@/lib/supabase/server'

export default async function PortalLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = createClient(await cookies())
  const context = await getDoctorContext(supabase)
  if (!context) redirect('/login')
  // El personal del consultorio usa el panel, no el portal
  if (context.role) redirect('/dashboard')

  const patient = await getPortalPatient(supabase, context.userId)

  return (
    <div className='min-h-screen bg-muted/40'>
      <PortalNav
        name={patient ? `${patient.names} ${patient.lastnames}` : context.displayName}
        initials={
          patient
            ? getInitials(patient.names, patient.lastnames)
            : getInitials(context.displayName)
        }
      />
      <main className='mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8'>
        {patient ? (
          children
        ) : (
          <div className='rounded-2xl border bg-card p-8 text-center'>
            <h1 className='text-xl font-semibold'>Su cuenta aún no está vinculada</h1>
            <p className='mt-2 text-muted-foreground'>
              Comuníquese con el consultorio para que activen su acceso al portal.
            </p>
          </div>
        )}
      </main>
      <PortalFooter />
    </div>
  )
}
