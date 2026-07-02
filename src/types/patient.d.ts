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
