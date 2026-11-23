import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { pdf } from '@react-pdf/renderer'
import { PrescriptionDocument } from '@/components/pdfs/prescription-document'
import type {
  PrescriptionPdfData,
  PrescriptionPdfLine
} from '@/components/pdfs/prescription-document'
import { nowInClinic } from '@/lib/date-utils'
import { numberToWords } from '@/lib/number-words'
import {
  getDoctorInfo,
  getNextAppointmentLabel,
  type PrescriptionGroup,
  type PrescriptionLine
} from '@/lib/services/prescriptions-service'
import type { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format-date'
import { buildVerificationQr } from '@/lib/pdf/verification-qr'

type ServerClient = ReturnType<typeof createClient>

/** Logo y marca de agua de la receta: public/heart.png */
export const readLogo = () =>
  readFile(path.join(process.cwd(), 'public', 'heart.png')).catch(
    () => undefined
  )

const toPdfLine = (line: PrescriptionLine): PrescriptionPdfLine => {
  const snapshot = line.medication_snapshot
  // La norma pide el nombre genérico (DCI) primero; el comercial queda entre paréntesis
  const generic = snapshot.genericName?.trim() || snapshot.name
  const brand =
    generic.toLowerCase() !== snapshot.name.trim().toLowerCase()
      ? snapshot.name
      : null

  const instruction =
    line.custom_instructions?.trim() || snapshot.standardInstructions?.trim() || ''
  const frequency = line.custom_frequency?.trim() || ''
  const duration = line.custom_duration?.trim() || ''
  const instructions = [
    instruction,
    frequency && `Frecuencia: ${frequency}.`,
    duration && `Duración: ${duration}.`
  ]
    .filter(Boolean)
    .join(' ')

  return {
    genericName: generic,
    brand,
    strength: `${snapshot.dose} ${snapshot.unit}`,
    form: snapshot.form,
    route: snapshot.route,
    // Cantidad en números y letras, como pide la norma
    quantity: `${line.quantity_amount} (${numberToWords(line.quantity_amount)}) ${line.quantity_unit}`,
    instructions: instructions || 'Según indicación médica.'
  }
}

const withQr = async (groupId: string) => {
  const { url, dataUrl } = await buildVerificationQr(groupId)
  return { qrDataUrl: dataUrl, verifyUrl: url }
}

/** Arma los datos del PDF a partir de la receta guardada, el perfil del médico y la próxima cita */
export async function loadPrescriptionPdfData(
  supabase: ServerClient,
  group: PrescriptionGroup,
  signature?: PrescriptionPdfData['signature']
): Promise<PrescriptionPdfData> {
  const [doctor, nextAppointment] = await Promise.all([
    getDoctorInfo(supabase, group.patient.doctor_profile_id),
    getNextAppointmentLabel(supabase, group.patient.id, nowInClinic().date)
  ])

  return {
    doctor: {
      name: doctor?.full_name ?? 'Médico tratante',
      email: doctor?.email,
      phone: doctor?.phone,
      address: doctor?.address,
      city: doctor?.city,
      specialty: doctor?.specialty,
      license: doctor?.license,
      identification: doctor?.identification
    },
    patient: {
      name: `${group.patient.names} ${group.patient.lastnames}`,
      ci: group.patient.identification ?? '—',
      age: group.patient.age,
      nextAppointment
    },
    date: formatDate(group.issuedAt),
    diagnosis: { text: group.diagnosis, code: group.diagnosisCode },
    lines: group.lines.map(toPdfLine),
    signature: signature ? { ...signature, ...(await withQr(group.groupId)) } : null,
    annulled: group.status === 'Anulada'
  }
}

export async function renderPrescriptionPdf(
  data: PrescriptionPdfData
): Promise<Buffer> {
  const logo = await readLogo()
  const blob = await pdf(PrescriptionDocument({ data, logo })).toBlob()
  return Buffer.from(await blob.arrayBuffer())
}

/** Nombre de archivo seguro (sin tildes ni caracteres raros) */
export const prescriptionFilename = (group: PrescriptionGroup) =>
  `receta-${group.patient.lastnames}-${group.issuedAt}.pdf`
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
