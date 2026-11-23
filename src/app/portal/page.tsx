import Link from 'next/link'
import { CalendarDays, FileHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTodayISO } from '@/lib/services/dashboard-service'
import { formatDate } from '@/lib/format-date'
import { getCurrentPortalPatient } from '@/lib/services/portal-service'

export default async function PortalHomePage() {
  const session = await getCurrentPortalPatient()
  if (!session) return null
  const { supabase, patient } = session

  const [{ data: next }, { count: recipes }] = await Promise.all([
    supabase
      .from('citas')
      .select('id, date, time, type, status')
      .gte('date', getTodayISO())
      .neq('status', 'Cancelada')
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('prescriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Firmada')
  ])

  return (
    <>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Hola, {patient.names}</h1>
        <p className='mt-1 text-muted-foreground'>
          Aquí puede ver sus citas, su historia clínica y sus recetas.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='rounded-2xl shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <CalendarDays className='size-5 text-primary' />
              Próxima cita
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {next ? (
              <>
                <p className='text-2xl font-semibold'>
                  {formatDate(next.date)} · {String(next.time).slice(0, 5)}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {next.type} · {next.status}
                </p>
              </>
            ) : (
              <p className='text-muted-foreground'>No tiene citas próximas.</p>
            )}
            <Button asChild variant='outline'>
              <Link href='/portal/citas'>Ver y solicitar citas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className='rounded-2xl shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <FileHeart className='size-5 text-primary' />
              Mis recetas
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <p className='text-2xl font-semibold'>{recipes ?? 0}</p>
            <p className='text-sm text-muted-foreground'>recetas firmadas disponibles</p>
            <Button asChild variant='outline'>
              <Link href='/portal/recetas'>Ver recetas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
