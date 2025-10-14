import { NewClinicHistory } from '@/components/create-history'
import { PatientNotFound } from '@/components/patient-not-found'

export default async function NewClinicHistoryPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!id) {
    return <PatientNotFound />
  }

  return <NewClinicHistory patientId={id} />
}
