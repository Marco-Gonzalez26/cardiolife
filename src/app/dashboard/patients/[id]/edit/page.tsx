import { getPatientById } from '@/lib/services/patients-service'

import { EditPatient } from '@/components/edit-patient'
import { PatientFormData } from '@/lib/validations/patient'
import { PatientNotFound } from '@/components/patient-not-found'
export default async function EditPatientPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const patient = (await getPatientById(id)) as PatientFormData
  if (!patient || patient === null) {
    return <PatientNotFound />
  }

  return <EditPatient id={id} patient={patient} />
}
