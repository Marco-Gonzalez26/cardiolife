/** Texto listo para comparar: sin tildes, en minúsculas y con los espacios compactados */
export const normalizeSearch = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

/**
 * ¿El texto cumple la búsqueda? No importan mayúsculas ni tildes ("maria" encuentra "María"),
 * y cada palabra escrita debe aparecer en cualquier orden. Una búsqueda vacía no filtra nada.
 */
export const matchesSearch = (haystack: string, term: string): boolean => {
  const words = normalizeSearch(term).split(' ').filter(Boolean)
  if (words.length === 0) return true
  const text = normalizeSearch(haystack)
  return words.every((word) => text.includes(word))
}
