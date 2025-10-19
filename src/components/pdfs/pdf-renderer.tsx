'use client'
import { DocumentProps } from '@react-pdf/renderer'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

import { ReactElement } from 'react'

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center h-full w-full'>
        <Loader2 className='h-4 w-4 animate-spin' />
        Cargando PDF...
      </div>
    )
  }
)
export default function PDFRenderer({
  children
}: {
  children: ReactElement<DocumentProps>
}) {
  return (
    <PDFViewer width='100%' height='100%'>
      {children}
    </PDFViewer>
  )
}
