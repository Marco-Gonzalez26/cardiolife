import { Field } from '@/components/portal/field'
import { HistoryTabs } from '@/components/portal/history-tabs'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/format-date'
import { getCurrentPortalPatient } from '@/lib/services/portal-service'

export default async function PortalEvolutionsPage() {
  const session = await getCurrentPortalPatient()
  if (!session) return null

  // La RLS solo entrega las evoluciones completadas por el médico (no los borradores)
  const { data } = await session.supabase
    .from('evolution')
    .select('id, created_at, diagnosis, treatment, treatment_plan')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  return (
    <>
      <HistoryTabs />
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Evoluciones</h1>
        <p className='mt-1 text-muted-foreground'>
          Seguimiento de sus controles con el médico.
        </p>
      </div>
      {(data ?? []).length === 0 ? (
        <Card className='rounded-2xl shadow-sm'>
          <CardContent className='py-8 text-center text-muted-foreground'>
            Aún no hay evoluciones disponibles.
          </CardContent>
        </Card>
      ) : (
        (data ?? []).map((evolution) => (
          <Card key={evolution.id} className='rounded-2xl shadow-sm'>
            <CardContent className='space-y-3'>
              <p className='text-lg font-semibold'>{formatDate(evolution.created_at)}</p>
              <Field label='Diagnóstico' value={evolution.diagnosis} />
              <Field label='Tratamiento' value={evolution.treatment} />
              <Field label='Plan' value={evolution.treatment_plan} />
            </CardContent>
          </Card>
        ))
      )}
    </>
  )
}
