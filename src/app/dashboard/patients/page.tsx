import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { AppSection } from '@/components/app-section'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getPatientsForList } from '@/lib/services/patients-service'
import { createClient } from '@/lib/supabase/server'
import { columns } from './columns'
import { PatientsDataTable } from './data-table'

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const patients = await getPatientsForList()

  return (
    <AppSection>
      <div className='w-full space-y-6'>
        <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Pacientes</h1>
            <p className='mt-1 text-muted-foreground'>
              Gestión y monitoreo de pacientes registrados.
            </p>
          </div>
          <Button asChild size='lg' className='gap-2 font-semibold'>
            <Link href='/dashboard/patients/new'>
              <Plus className='size-5' />
              Nuevo Paciente
            </Link>
          </Button>
        </div>

        <Card className='gap-0 overflow-hidden rounded-2xl p-0 shadow-sm'>
          <PatientsDataTable
            data={patients}
            columns={columns}
            initialFilter={q ?? ''}
          />
        </Card>
      </div>
    </AppSection>
  )
}
