import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  loadPrescriptionPdfData,
  prescriptionFilename,
  renderPrescriptionPdf
} from '@/lib/pdf/prescription-pdf'
import { getPrescriptionGroup } from '@/lib/services/prescriptions-service'
import { SIGNED_BUCKET } from '@/lib/signing/constants'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/format-date'

export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params
  if (!UUID.test(groupId)) {
    return new NextResponse('Receta no encontrada', { status: 404 })
  }

  const supabase = createClient(await cookies())
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims) return new NextResponse('No autorizado', { status: 401 })

  // La RLS filtra: solo el personal del paciente (o el propio paciente) puede ver la receta
  const prescription = await getPrescriptionGroup(supabase, groupId)
  if (!prescription) {
    return new NextResponse('Receta no encontrada', { status: 404 })
  }

  try {
    const url = new URL(request.url)
    const wantsOriginal = url.searchParams.has('original')
    const annulled = prescription.status === 'Anulada'

    let buffer: Buffer
    if (prescription.signedPdfPath && (!annulled || wantsOriginal)) {
      // Receta firmada: se entrega EXACTAMENTE el PDF que se firmó (no se vuelve a generar)
      const { data: file, error } = await supabase.storage
        .from(SIGNED_BUCKET)
        .download(prescription.signedPdfPath)
      if (error || !file) {
        return new NextResponse('No se encontró el PDF firmado', { status: 404 })
      }
      buffer = Buffer.from(await file.arrayBuffer())
    } else {
      // Sin firmar, o anulada: se genera una copia (la anulada lleva la marca "ANULADA")
      const signature = prescription.signedAt
        ? {
            signerName:
              prescription.signerSubject?.match(/CN=([^,]+)/)?.[1] ?? 'el médico',
            signedAt: formatDateTime(prescription.signedAt)
          }
        : null
      const data = await loadPrescriptionPdfData(supabase, prescription, signature)
      buffer = await renderPrescriptionPdf(data)
    }

    const download = url.searchParams.has('download')
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${prescriptionFilename(prescription)}"`,
        'Cache-Control': 'private, no-store'
      }
    })
  } catch (error) {
    console.error('Error al generar el PDF de la receta', error)
    return new NextResponse('No se pudo generar el PDF', { status: 500 })
  }
}
