import { isPathWithin } from './path'

export type SearchEntity =
  | 'patients'
  | 'medications'
  | 'recipes'
  | 'evolutions'
  | 'histories'
  | 'appointments'

export type SearchScope = {
  entity: SearchEntity
  /** Lista de la entidad, adonde lleva la búsqueda (?q=) */
  path: string
  placeholder: string
  label: string
}

const PATIENTS: SearchScope = {
  entity: 'patients',
  path: '/dashboard/patients',
  placeholder: 'Buscar paciente…',
  label: 'Buscar paciente'
}

/** Cada sección busca en su propia entidad; el resto de pantallas (inicio, ajustes…) busca pacientes */
const SECTIONS: SearchScope[] = [
  PATIENTS,
  {
    entity: 'medications',
    path: '/dashboard/medications',
    placeholder: 'Buscar medicamento…',
    label: 'Buscar medicamento'
  },
  {
    entity: 'recipes',
    path: '/dashboard/recipes',
    placeholder: 'Buscar receta…',
    label: 'Buscar receta'
  },
  {
    entity: 'evolutions',
    path: '/dashboard/evolutions',
    placeholder: 'Buscar evolución…',
    label: 'Buscar evolución'
  },
  {
    entity: 'histories',
    path: '/dashboard/clinic-history',
    placeholder: 'Buscar historia clínica…',
    label: 'Buscar historia clínica'
  },
  {
    entity: 'appointments',
    path: '/dashboard/appointments',
    placeholder: 'Buscar cita…',
    label: 'Buscar cita'
  }
]

export const getSearchScope = (pathname: string): SearchScope =>
  SECTIONS.find((scope) => isPathWithin(pathname, scope.path)) ?? PATIENTS

/** Dirección de la lista de la entidad con el texto buscado; sin texto, la lista completa */
export const buildSearchHref = (scope: SearchScope, term: string): string => {
  const text = term.trim()
  return text ? `${scope.path}?q=${encodeURIComponent(text)}` : scope.path
}
