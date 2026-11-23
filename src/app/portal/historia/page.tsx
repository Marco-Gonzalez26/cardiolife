import { Field } from '@/components/portal/field'
import { HistoryTabs } from '@/components/portal/history-tabs'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/format-date'
import { getCurrentPortalPatient } from '@/lib/services/portal-service'

export default async function PortalHistoryPage() {
  const session = await getCurrentPortalPatient()
  if (!session) return null

  // La RLS solo entrega las historias completadas por el médico (no los borradores)
  const { data } = await session.supabase
    .from('clinic_history')
    .select('id, date, created_at, reason, diagnosis, treatment_plan')
    .eq('status', 'completed')
    .order('date', { ascending: false })

  return (
    <>
      <HistoryTabs />
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Historia clínica</h1>
        <p className='mt-1 text-muted-foreground'>
          Resumen de sus consultas de primera vez registradas por el médico.
        </p>
      </div>
      {(data ?? []).length === 0 ? (
        <Card className='rounded-2xl shadow-sm'>
          <CardContent className='py-8 text-center text-muted-foreground'>
            Aún no hay historias clínicas disponibles.
          </CardContent>
        </Card>
      ) : (
        (data ?? []).map((history) => (
          <Card key={history.id} className='rounded-2xl shadow-sm'>
            <CardContent className='space-y-3'>
              <p className='text-lg font-semibold'>
                {formatDate(history.date ?? history.created_at)}
              </p>
              <Field label='Motivo de consulta' value={history.reason} />
              <Field label='Diagnóstico' value={history.diagnosis} />
              <Field label='Plan de tratamiento' value={history.treatment_plan} />
            </CardContent>
          </Card>
        ))
      )}
    </>
  )
}
