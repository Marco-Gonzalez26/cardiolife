export interface Patient {
  id: string
  created_at: string
  names: string
  lastnames: string
  identification: string
  birthdate: Date | string
  age: string
  phone_number?: string
  job?: string
  email?: string
}

export interface CreatePatientData {
  names: string
  lastnames: string
  identification: string
  birthdate: string
  phone_number: string
  job: string
  email?: string
}

export type UpdatePatientData = Partial<CreatePatientData>

/** Fila de la lista de pacientes (con la última consulta calculada) */
export interface PatientListItem {
  id: string
  created_at: string
  names: string
  lastnames: string
  identification: string | null
  age: string | null
  phone_number: string | null
  job: string | null
  risk: string | null
  status: string | null
  /** Fecha (ISO) de la última historia clínica completada */
  last_visit: string | null
}
