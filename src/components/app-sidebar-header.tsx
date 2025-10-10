import { HeartPulse } from 'lucide-react'

export const AppSidebarHeader = () => {
  return (
    <>
      <div className='flex items-center gap-2'>
        <HeartPulse className='h-6 w-6' />
      </div>
      <div className=''>
        <span className='mb-0.5 truncate font-bold text-xl'>Cardiolife</span>
      </div>
    </>
  )
}
