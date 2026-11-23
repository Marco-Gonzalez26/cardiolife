import { isPathWithin } from './path'

export { isPathWithin }

export type PortalLink = {
  href: string
  label: string
  /** Otras rutas que viven dentro de este destino y lo mantienen marcado */
  also?: readonly string[]
}

/** Barra del portal: cuatro destinos. La cuenta y la salida van en el menú del paciente. */
export const PORTAL_LINKS: readonly PortalLink[] = [
  { href: '/portal', label: 'Inicio' },
  { href: '/portal/citas', label: 'Citas' },
  { href: '/portal/historia', label: 'Historia', also: ['/portal/evoluciones'] },
  { href: '/portal/recetas', label: 'Recetas' }
]

export const ACCOUNT_HREF = '/portal/cuenta'

/** Pestañas dentro de Historia: las evoluciones forman parte del seguimiento clínico */
export const HISTORY_TABS = [
  { href: '/portal/historia', label: 'Historia clínica' },
  { href: '/portal/evoluciones', label: 'Evoluciones' }
] as const

/** href del destino de la barra que corresponde a la ruta actual, o null si ninguno */
export const getActivePortalHref = (pathname: string): string | null => {
  const link = PORTAL_LINKS.find((candidate) =>
    candidate.href === '/portal'
      ? pathname === candidate.href
      : [candidate.href, ...(candidate.also ?? [])].some((base) =>
          isPathWithin(pathname, base)
        )
  )
  return link?.href ?? null
}
