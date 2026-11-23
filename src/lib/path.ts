/** La ruta es `base` o está dentro de ella (no basta con empezar igual: /historia-vieja no cuenta) */
export const isPathWithin = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`)
