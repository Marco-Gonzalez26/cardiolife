import { AppSection } from '@/components/app-section'
import { MedicationsDataTable } from './data-table'
import { columns, ColumnsMedication } from './columns'
import { Button } from '@/components/ui/button'
import { PillBottle, UserRoundPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading } from '@/components/heading'
import Link from 'next/link'
import { getAllMedications } from '@/lib/services/medications-service'
export default async function Page() {
  const medications = (await getAllMedications()) as ColumnsMedication[]
  const activeMedications = medications.filter(
    (medication) => medication.active
  )
  console.log({ medications })
  return (
    <AppSection>
      <div className='space-y-6 w-full mx-auto'>
        <div className='flex items-center justify-between'>
          <div>
            <Heading>Medicamentos</Heading>
            <p className='text-muted-foreground'>
              Gestiona la información de la base de datos de medicamentos
            </p>
          </div>
        </div>
        <div className='grid gap-4 md:grid-cols-4'>
          <Card className=''>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-semitbold'>
                Total Medicamentos
              </CardTitle>
              <PillBottle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {activeMedications?.length || 0}
              </div>
              <p className='text-xs text-muted-foreground'>
                Activos en el sistema
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className='mt-4'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Lista de Pacientes</CardTitle>
              <Button
                size='lg'
                className='gap-2 hover:cursor-pointer font-semibold'
                variant='default'
                asChild>
                <Link href={'/dashboard/medications/new'}>
                  <UserRoundPlus className='h-5 w-5' />
                  Nuevo Medicamento
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MedicationsDataTable data={medications} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </AppSection>
  )
}
