import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AlertTriangle, ArrowLeft, Pencil } from 'lucide-react'
import { AppSection } from '@/components/app-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { getMedicationDetail } from '@/lib/services/catalog-service'
import { getDoctorContext } from '@/lib/services/doctor-context'
import { createClient } from '@/lib/supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function MedicationPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!UUID.test(id)) notFound()

  const supabase = createClient(await cookies())
  // El layout y la página se renderizan en paralelo: sin sesión no se consulta nada
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) redirect('/login')

  const [medication, context] = await Promise.all([
    getMedicationDetail(supabase, id),
    getDoctorContext(supabase)
  ])
  if (!medication) notFound()
  const isDoctor = context?.role === 'doctor'

  return (
    <AppSection>
      <div className='w-full space-y-6'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <Button asChild variant='ghost' className='-ml-3'>
            <Link href='/dashboard/medications'>
              <ArrowLeft />
              Volver a medicamentos
            </Link>
          </Button>
          {isDoctor && (
            <Button asChild className='gap-2 font-semibold'>
              <Link href={`/dashboard/medications/${id}/edit`}>
                <Pencil className='size-4' />
                Editar
              </Link>
            </Button>
          )}
        </div>

        <div className='space-y-2'>
          <div className='flex flex-wrap items-center gap-3'>
            <h1 className='text-3xl font-bold tracking-tight'>{medication.name}</h1>
            {medication.active === false ? (
              <Badge className='border-transparent bg-slate-100 text-slate-700 hover:bg-slate-100'>
                Inactivo
              </Badge>
            ) : (
              <Badge className='border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
                Activo
              </Badge>
            )}
            {medication.requires_monitoring && (
              <Badge className='border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100'>
                Requiere monitoreo
              </Badge>
            )}
          </div>
          <p className='text-muted-foreground'>
            {[medication.generic_name, medication.category?.name]
              .filter(Boolean)
              .join(' · ') || 'Sin datos adicionales'}
          </p>
        </div>

        {(medication.warnings || medication.notes) && (
          <div className='grid gap-4 md:grid-cols-2'>
            {medication.warnings && (
              <Card className='rounded-2xl border-amber-200 bg-amber-50/50 shadow-sm'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base text-amber-900'>
                    <AlertTriangle className='size-5' />
                    Advertencias
                  </CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-amber-900'>
                  {medication.warnings}
                </CardContent>
              </Card>
            )}
            {medication.notes && (
              <Card className='rounded-2xl shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-base'>Notas</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground'>
                  {medication.notes}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card className='gap-0 overflow-hidden rounded-2xl p-0 shadow-sm'>
          <CardHeader className='border-b p-4'>
            <CardTitle className='text-base'>
              Presentaciones ({medication.presentations.length})
            </CardTitle>
          </CardHeader>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  {['Dosis', 'Forma', 'Vía', 'Frecuencia', 'Indicación estándar', 'Estado'].map(
                    (heading) => (
                      <TableHead
                        key={heading}
                        className='h-11 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                        {heading}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {medication.presentations.map((presentation) => (
                  <TableRow key={presentation.id}>
                    <TableCell className='px-4 py-3 font-semibold'>
                      {presentation.dose} {presentation.unit}
                    </TableCell>
                    <TableCell className='px-4 py-3'>{presentation.form}</TableCell>
                    <TableCell className='px-4 py-3'>{presentation.route}</TableCell>
                    <TableCell className='px-4 py-3 text-muted-foreground'>
                      {presentation.common_frequency || '—'}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-muted-foreground'>
                      {presentation.standard_instructions || '—'}
                    </TableCell>
                    <TableCell className='px-4 py-3'>
                      {presentation.available === false ? (
                        <Badge variant='secondary'>No disponible</Badge>
                      ) : (
                        <Badge className='border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
                          Disponible
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AppSection>
  )
}
