/**
 * Iniciales para un avatar: la primera letra de cada parte no vacía, en mayúscula, hasta dos.
 * getInitials('María', 'García') -> 'MG'. Sin partes devuelve '?'.
 */
export const getInitials = (...parts: string[]): string => {
  const letters = parts
    .map((part) => Array.from(part.trim())[0])
    .filter((letter): letter is string => Boolean(letter))
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return letters || '?'
}
