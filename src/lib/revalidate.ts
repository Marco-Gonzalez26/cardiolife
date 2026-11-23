import { revalidatePath } from 'next/cache'

/**
 * Invalida el caché de TODO el dashboard. Llamarla al final de cada Server Action que escribe datos:
 * así la página que se está viendo se vuelve a renderizar sola, con datos frescos, sin que el
 * cliente tenga que llamar a `router.refresh()`.
 *
 * Es un solo consultorio y las páginas son dinámicas (leen la sesión), así que invalidar todo el árbol
 * es barato y evita tener que acordarse de listar cada ruta que depende del dato (el panel principal,
 * las listas, la ficha del paciente, el formulario de recetas, etc.).
 *
 * Solo funciona dentro de Server Actions o Route Handlers.
 */
export const refreshDashboard = () => {
  revalidatePath('/dashboard', 'layout')
  // El portal del paciente muestra los mismos datos (citas, recetas, evoluciones)
  revalidatePath('/portal', 'layout')
}
