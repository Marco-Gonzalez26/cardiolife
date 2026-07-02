import { AppSection } from '@/components/app-section'
import { RecipeForm } from '@/components/forms/recipe-form'
import { Button } from '@/components/ui/button'
import { getAllMedications } from '@/lib/services/medications-service'
import { getAllPatients } from '@/lib/services/patients-service'
import { ArrowLeft } from 'lucide-react'
import { Heading } from '@/components/heading'
import Link from 'next/link'

export default async function Page() {
  const patientsRaw = await getAllPatients()
  const patients = patientsRaw.map((p) => ({
    value: p.id,
    label: `${p.names} ${p.lastnames}`,
    ci: p.identification,
  }))
  const medications = await getAllMedications()
  console.log('Medicaments:', medications)
  console.log('Patients:', patientsRaw)
  return (
    <AppSection>
      <div className='space-y-6 w-full mx-auto'>
        <Link href='/dashboard/recipes'>
          <Button variant='ghost' className='hover:bg-neutral-100'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver
          </Button>
        </Link>
        <div className='flex items-center justify-between'>
          <div>
            <Heading>Nueva Receta</Heading>
          </div>
        </div>
        <div className='mt-6 max-w-6xl w-full mx-auto h-full'>
          <RecipeForm patients={patients} medications={medications} />
        </div>
      </div>
    </AppSection>
  )
}
