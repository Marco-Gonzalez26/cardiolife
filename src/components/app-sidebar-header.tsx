import { HeartPulse } from 'lucide-react'

export const AppSidebarHeader = () => {
  return (
    <>
      <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
        <HeartPulse className='size-5 text-primary' />
      </div>
      <div className='grid leading-tight'>
        <span className='truncate font-semibold tracking-tight text-foreground'>
          Cardiolife
        </span>
        <span className='truncate text-xs text-muted-foreground'>
          Gestión Médica
        </span>
      </div>
    </>
  )
}
