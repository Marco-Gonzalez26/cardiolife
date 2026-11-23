'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  buildSearchHref,
  getSearchScope,
  type SearchScope
} from '@/lib/search-scope'

const SearchForm = ({ scope, initial }: { scope: SearchScope; initial: string }) => {
  const [query, setQuery] = useState(initial)
  const router = useRouter()

  return (
    <form
      role='search'
      onSubmit={(event) => {
        event.preventDefault()
        router.push(buildSearchHref(scope, query))
      }}
      className='relative w-full max-w-sm'>
      <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        type='search'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={scope.placeholder}
        aria-label={scope.label}
        className='h-10 bg-card pl-9'
      />
    </form>
  )
}

/**
 * Buscador de la barra superior: busca en la entidad de la sección donde está el usuario
 * (medicamentos en Medicamentos, citas en Agenda…); en el resto de pantallas busca pacientes.
 */
export const SectionSearch = () => {
  const pathname = usePathname()
  const query = useSearchParams().get('q') ?? ''
  const scope = getSearchScope(pathname)
  // La clave reinicia el campo al cambiar de sección o de búsqueda, para que nunca muestre texto de otra entidad
  return <SearchForm key={`${scope.entity}:${query}`} scope={scope} initial={query} />
}
