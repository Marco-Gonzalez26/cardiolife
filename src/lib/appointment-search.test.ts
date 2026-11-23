import { describe, expect, it } from 'vitest'
import { filterAppointments } from './appointment-search'
import type { AppointmentWithPatient } from './services/appointments-service'

const appointment = (
  id: string,
  names: string,
  lastnames: string,
  extra: Partial<AppointmentWithPatient> = {}
): AppointmentWithPatient => ({
  id,
  date: '2026-12-12',
  time: '10:30:00',
  type: 'Control',
  status: 'Pendiente',
  notes: null,
  patient: {
    id: `p-${id}`,
    names,
    lastnames,
    identification: '1712345678',
    age: '40'
  },
  ...extra
})

const LIST = [
  appointment('1', 'María', 'García'),
  appointment('2', 'José', 'Pérez', {
    type: 'Primera consulta',
    notes: 'Trae exámenes de laboratorio'
  }),
  appointment('3', 'Ana', 'Pérez', { status: 'Cancelada' })
]

const ids = (items: AppointmentWithPatient[]) => items.map((item) => item.id)

describe('filterAppointments', () => {
  it('encuentra por el nombre del paciente sin importar tildes ni mayúsculas', () => {
    expect(ids(filterAppointments(LIST, 'maria'))).toEqual(['1'])
    expect(ids(filterAppointments(LIST, 'JOSE'))).toEqual(['2'])
  })

  it('encuentra por apellido y deja las citas en el orden recibido', () => {
    expect(ids(filterAppointments(LIST, 'perez'))).toEqual(['2', '3'])
  })

  it('encuentra por cédula', () => {
    expect(ids(filterAppointments(LIST, '1712345678'))).toEqual(['1', '2', '3'])
  })

  it('encuentra por tipo de consulta, estado y notas', () => {
    expect(ids(filterAppointments(LIST, 'primera'))).toEqual(['2'])
    expect(ids(filterAppointments(LIST, 'cancelada'))).toEqual(['3'])
    expect(ids(filterAppointments(LIST, 'laboratorio'))).toEqual(['2'])
  })

  it('acepta nombre y apellido juntos', () => {
    expect(ids(filterAppointments(LIST, 'ana perez'))).toEqual(['3'])
  })

  it('sin texto no devuelve nada: una búsqueda vacía no lista todas las citas', () => {
    expect(filterAppointments(LIST, '')).toEqual([])
    expect(filterAppointments(LIST, '   ')).toEqual([])
  })

  it('sin coincidencias devuelve una lista vacía', () => {
    expect(filterAppointments(LIST, 'zzz')).toEqual([])
  })

  it('respeta el límite de resultados', () => {
    expect(ids(filterAppointments(LIST, 'perez', 1))).toEqual(['2'])
  })
})
