import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, Package, Pill, Plus } from 'lucide-react'
import { AppSection } from '@/components/app-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getMedicationList } from '@/lib/services/catalog-service'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { createClient } from '@/lib/supabase/server'
import { MedicationsTable } from './medications-table'

const Stat = ({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) => (
  <Card className='rounded-2xl shadow-sm'>
    <CardContent className='flex items-center gap-4'>
      <div className='flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary'>
        <Icon className='size-5' />
      </div>
      <div>
        <p className='text-2xl font-bold leading-none'>{value}</p>
        <p className='mt-1 text-sm text-muted-foreground'>{label}</p>
      </div>
    </CardContent>
  </Card>
)

export default async function MedicationsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [medications, context] = await Promise.all([
    getMedicationList(supabase),
    getDoctorContext(supabase)
  ])
  // Solo el médico modifica el catálogo; la secretaria lo consulta
  const isDoctor = context?.role === 'doctor'

  const active = medications.filter((medication) => medication.active !== false)
  const presentations = active.reduce(
    (total, medication) =>
      total +
      medication.presentations.filter((item) => item.available !== false).length,
    0
  )
  const monitored = active.filter((medication) => medication.requires_monitoring).length

  return (
    <AppSection>
      <div className='w-full space-y-6'>
        <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Medicamentos</h1>
            <p className='mt-1 text-muted-foreground'>
              Catálogo de medicamentos y presentaciones para recetar.
            </p>
          </div>
          {isDoctor && (
            <Button asChild size='lg' className='gap-2 font-semibold'>
              <Link href='/dashboard/medications/new'>
                <Plus className='size-5' />
                Nuevo Medicamento
              </Link>
            </Button>
          )}
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          <Stat icon={Pill} label='Medicamentos activos' value={active.length} />
          <Stat icon={Package} label='Presentaciones disponibles' value={presentations} />
          <Stat icon={AlertTriangle} label='Requieren monitoreo' value={monitored} />
        </div>

        <Card className='gap-0 overflow-hidden rounded-2xl p-0 shadow-sm'>
          <MedicationsTable
            key={q ?? ''}
            data={medications}
            canModify={isDoctor}
            initialSearch={q}
          />
        </Card>
      </div>
    </AppSection>
  )
}
