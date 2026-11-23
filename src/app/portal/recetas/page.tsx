import { Download, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/format-date'
import { getCurrentPortalPatient } from '@/lib/services/portal-service'
import { getPrescriptionGroups } from '@/lib/services/prescriptions-service'

export default async function PortalRecipesPage() {
  const session = await getCurrentPortalPatient()
  if (!session) return null

  // La RLS solo entrega las recetas ya firmadas por el médico
  const recipes = await getPrescriptionGroups(session.supabase)

  return (
    <>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Mis recetas</h1>
        <p className='mt-1 text-muted-foreground'>
          Recetas firmadas electrónicamente. Cada una tiene un código QR para verificar su autenticidad.
        </p>
      </div>
      {recipes.length === 0 ? (
        <Card className='rounded-2xl shadow-sm'>
          <CardContent className='py-8 text-center text-muted-foreground'>
            Aún no tiene recetas firmadas.
          </CardContent>
        </Card>
      ) : (
        recipes.map((recipe) => {
          const url = `/api/pdf/prescription/${recipe.groupId}`
          return (
            <Card key={recipe.groupId} className='rounded-2xl shadow-sm'>
              <CardContent className='flex flex-wrap items-center justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='flex items-center gap-2 font-semibold'>
                    {formatDate(recipe.issuedAt)}
                    {recipe.status === 'Anulada' && (
                      <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
                        Anulada
                      </Badge>
                    )}
                  </p>
                  <p className='truncate text-sm text-muted-foreground'>
                    {recipe.lines.map((line) => line.medication_snapshot.name).join(', ')}
                  </p>
                  {recipe.diagnosis && (
                    <p className='truncate text-sm text-muted-foreground'>
                      Diagnóstico: {recipe.diagnosis}
                    </p>
                  )}
                </div>
                <div className='flex gap-2'>
                  <Button asChild variant='outline' className='gap-2'>
                    <a href={url} target='_blank' rel='noreferrer'>
                      <ExternalLink className='size-4' />
                      Abrir
                    </a>
                  </Button>
                  <Button asChild className='gap-2'>
                    <a href={`${url}?download=1`}>
                      <Download className='size-4' />
                      Descargar
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </>
  )
}
