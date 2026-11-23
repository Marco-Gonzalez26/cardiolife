import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { AppSection } from '@/components/app-section'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { getPrescriptionGroups } from '@/lib/services/prescriptions-service'
import { createClient } from '@/lib/supabase/server'
import { RecipesTable } from './recipes-table'

export default async function RecipesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [recipes, context] = await Promise.all([
    getPrescriptionGroups(supabase),
    getDoctorContext(supabase)
  ])
  // Solo el médico emite, edita y elimina recetas; la secretaria las consulta y descarga el PDF
  const isDoctor = context?.role === 'doctor'

  return (
    <AppSection>
      <div className='w-full space-y-6'>
        <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Recetas</h1>
            <p className='mt-1 text-muted-foreground'>
              Recetas médicas emitidas, con vista previa y descarga en PDF.
            </p>
          </div>
          {isDoctor && (
            <Button asChild size='lg' className='gap-2 font-semibold'>
              <Link href='/dashboard/recipes/new'>
                <Plus className='size-5' />
                Nueva Receta
              </Link>
            </Button>
          )}
        </div>
        <Card className='gap-0 overflow-hidden rounded-2xl p-0 shadow-sm'>
          <RecipesTable
            key={q ?? ''}
            data={recipes}
            canModify={isDoctor}
            initialSearch={q}
          />
        </Card>
      </div>
    </AppSection>
  )
}
