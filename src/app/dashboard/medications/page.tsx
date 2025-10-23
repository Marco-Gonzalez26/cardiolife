import { AppSection } from '@/components/app-section'
import { PatientsDataTable } from './data-table'
import { columns, ColumnsMedication } from './columns'
import { Button } from '@/components/ui/button'
import { UserRoundPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading } from '@/components/heading'
import Link from 'next/link'
import { getAllPatients } from '@/lib/services/patients-service'
export default async function Page() {
  const patients = (await getAllPatients()) as ColumnsMedication[]

  return (
    <AppSection>
      <div className='space-y-6 w-full mx-auto'>
        <div className='flex items-center justify-between'>
          <div>
            <Heading>Pacientes</Heading>
            <p className='text-muted-foreground'>
              Gestiona la información de tus pacientes
            </p>
          </div>
        </div>
        {/* <div className='grid gap-4 md:grid-cols-4'>
          <Card className=''>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-semitbold'>
                Total Pacientes
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{patients?.length || 0}</div>
              <p className='text-xs text-muted-foreground'>
                Activos en el sistema
              </p>
            </CardContent>
          </Card>
        </div> */}
        <Card className='mt-4'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Lista de Pacientes</CardTitle>
              <Button
                size='lg'
                className='gap-2 hover:cursor-pointer font-semibold'
                variant='default'
                asChild>
                <Link href={'/dashboard/patients/new'}>
                  <UserRoundPlus className='h-5 w-5' />
                  Nuevo Paciente
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PatientsDataTable data={patients} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </AppSection>
  )
}
