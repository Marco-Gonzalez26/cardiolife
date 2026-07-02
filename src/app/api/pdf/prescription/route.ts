import { pdf } from '@react-pdf/renderer'
import { NextRequest, NextResponse } from 'next/server'
import { createElement, ReactElement } from 'react'
import { MyTestDocument } from '@/components/pdfs/test-pdf'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { patientName, prescriptionData } = data

    // Use provided prescription data or create minimal fallback
    const pdfData = prescriptionData || {
      doctor: {
        name: 'Dr. Ricardo J González Soto',
        email: 'funiscor2008@gmail.com',
        phone: '0999-123-456',
        signature: {
          name: 'Dr. Ricardo J González Soto',
          specialty: 'Cardiólogo',
          ci: '1710234567',
          registration: '08952948'
        }
      },
      patient: {
        name: patientName || 'Paciente',
        ci: '1700000000',
        date: new Date().toLocaleDateString('es-EC'),
        nextAppointment: 'En 1 semana'
      },
      medications: [],
      indications: []
    }

    const element = createElement(MyTestDocument, { prescriptionData: pdfData })
    const buffer = await pdf(element).toBlob()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receta-${patientName || 'paciente'}.pdf"`
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return new NextResponse('Error generating PDF', { status: 500 })
  }
}
