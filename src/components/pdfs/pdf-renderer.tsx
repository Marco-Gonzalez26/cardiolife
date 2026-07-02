'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Eye, Loader2 } from 'lucide-react'

interface PrescriptionPreviewProps {
  patientName: string
  prescriptionData?: any // Add this prop for dynamic data
}

export function PrescriptionPreview({
  patientName,
  prescriptionData
}: PrescriptionPreviewProps) {
  const [downloading, setDownloading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const currentUrlRef = useRef<string | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current)
      }
    }
  }, [])

  // Cleanup when pdfUrl changes
  useEffect(() => {
    if (pdfUrl && currentUrlRef.current && pdfUrl !== currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current)
    }
    currentUrlRef.current = pdfUrl
  }, [pdfUrl])

  const fetchPdf = async () => {
    const response = await fetch('/api/pdf/prescription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName,
        prescriptionData // Pass dynamic data
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate PDF')
    }

    const blob = await response.blob()
    return blob
  }

  const handlePreview = async () => {
    if (previewing) return

    setPreviewing(true)
    try {
      const blob = await fetchPdf()

      // Clean up previous URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }

      const newUrl = URL.createObjectURL(blob)
      setPdfUrl(newUrl)
    } catch (error) {
      console.error('Error generating PDF preview:', error)
    } finally {
      setPreviewing(false)
    }
  }

  const handleDownload = async () => {
    if (downloading) return

    setDownloading(true)
    try {
      const blob = await fetchPdf()
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = `receta-${patientName}.pdf`
      a.click()

      // Clean up immediately after download
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className='flex flex-col h-full w-full gap-2'>
      <div className='flex justify-end gap-2'>
        <Button variant='outline' onClick={handlePreview} disabled={previewing}>
          {previewing ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <Eye className='h-4 w-4 mr-2' />
          )}
          Vista previa
        </Button>
        <Button onClick={handleDownload} disabled={downloading}>
          {downloading ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <Download className='h-4 w-4 mr-2' />
          )}
          Descargar
        </Button>
      </div>

      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          className='flex-1 w-full border rounded min-h-0'
          title='Vista previa receta'
        />
      ) : (
        <div className='flex-1 w-full border rounded flex items-center justify-center text-muted-foreground text-sm'>
          Presiona "Vista previa" para ver la receta
        </div>
      )}
    </div>
  )
}
