import { UserRoundX } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'
import { AppSection } from './app-section'

export const PatientNotFound = () => {
  return (
    <AppSection>
      <div className='flex flex-col items-center justify-center h-full space-y-4'>
        <UserRoundX className='h-12 w-12 text-neutral-500' />
        <h1 className='text-3xl font-bold text-center'>
          No se encontró el paciente
        </h1>
        <p className='text-center'>
          Si el paciente no existe, puede crear uno nuevo
        </p>
        <Button variant='outline' asChild >
          <Link href='/dashboard/patients'>
            <span>Ir a la página de pacientes</span>
          </Link>
        </Button>
      </div>
    </AppSection>
  )
}
