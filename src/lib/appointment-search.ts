import { matchesSearch } from './search'
import type { AppointmentWithPatient } from './services/appointments-service'

export const MAX_SEARCH_RESULTS = 30

/**
 * Citas que coinciden con el texto buscado: paciente, cédula, tipo de consulta, estado o notas.
 * Conserva el orden recibido. Sin texto no devuelve nada, para no listar todas las citas.
 */
export const filterAppointments = (
  appointments: AppointmentWithPatient[],
  term: string,
  limit = MAX_SEARCH_RESULTS
): AppointmentWithPatient[] => {
  if (term.trim() === '') return []
  return appointments
    .filter((item) =>
      matchesSearch(
        [
          item.patient.names,
          item.patient.lastnames,
          item.patient.identification,
          item.type,
          item.status,
          item.notes
        ]
          .filter(Boolean)
          .join(' '),
        term
      )
    )
    .slice(0, limit)
}
