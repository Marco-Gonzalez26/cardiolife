const normalize = (value: string) => value.trim().replace(/\s+/g, ' ')

/**
 * ¿El texto escrito coincide con el nombre pedido? No importan las mayúsculas ni los espacios
 * sobrantes, pero sí las tildes (Losartán y Losartan son nombres distintos). Nunca acepta vacío.
 */
export const nameMatches = (expected: string, typed: string): boolean => {
  const wanted = normalize(expected)
  const written = normalize(typed)
  return (
    wanted !== '' &&
    written !== '' &&
    wanted.localeCompare(written, 'es', { sensitivity: 'accent' }) === 0
  )
}
