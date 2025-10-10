import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Heart, Users, FileText, Calendar } from 'lucide-react'

export default function Home() {
  return (
    <div className='min-h-screen '>
      <div className='absolute top-0 -z-10 h-full w-full bg-white'>
        <div className='absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(109,147,244,0.5)] opacity-50 blur-[80px]'></div>
      </div>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='bg-blue-600 p-2 rounded-lg'>
              <Heart className='h-6 w-6 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-neutral-900'>Cardiolife</h1>
              <p className='text-xs text-neutral-600'>
                Sistema de Gestión Médica
              </p>
            </div>
          </div>
          <Button className=' font-medium'>Ingresar</Button>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 py-12'>
        <div className='text-center mb-12'>
          <h2 className='text-4xl font-bold text-neutral-900 mb-4'>
            Bienvenido a Cardiolife
          </h2>
          <p className='text-xl text-neutral-600 mb-8'>
            Sistema completo de gestión personalizada para el consultorio del Dr
            Ricardo González
          </p>
          <div className='flex gap-4 justify-center'>
            <Link href='/dashboard'>
              <Button
                size='lg'
                className='text-lg font-semibold'
                variant='default'>
                Ingresar
              </Button>
            </Link>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card>
            <CardHeader>
              <div className='bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3'>
                <Users className='h-6 w-6 text-blue-600' />
              </div>
              <CardTitle>Gestión de Pacientes</CardTitle>
              <CardDescription>
                Registra y administra la información de tus pacientes de forma
                segura
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className='bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3'>
                <Heart className='h-6 w-6 text-green-600' />
              </div>
              <CardTitle>Consultas Médicas</CardTitle>
              <CardDescription>
                Registra consultas con diagnósticos y tratamientos completos
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className='bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3'>
                <FileText className='h-6 w-6 text-purple-600' />
              </div>
              <CardTitle>Recetas Digitales</CardTitle>
              <CardDescription>
                Genera y envía recetas médicas por email y WhatsApp
                automáticamente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className='bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3'>
                <Calendar className='h-6 w-6 text-orange-600' />
              </div>
              <CardTitle>Historia Médica Completa</CardTitle>
              <CardDescription>
                Accede al historial médico completo con evoluciones y estudios
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}
