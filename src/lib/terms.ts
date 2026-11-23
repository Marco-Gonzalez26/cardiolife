export type TermsContact = {
  doctorName?: string | null
  email?: string | null
  phone?: string | null
}

export type TermsSection = { id: string; title: string; paragraphs: string[] }

/** Fecha de la última edición del texto (DD/MM/YYYY) */
export const TERMS_UPDATED_AT = '23/11/2026'

/** Mientras sea false, la página avisa que el texto está pendiente de revisión legal. Cambiar a true solo cuando un abogado lo apruebe. */
export const TERMS_LEGALLY_REVIEWED = false

const clean = (value: string | null | undefined) => value?.trim() || undefined

/**
 * Términos y condiciones del portal del paciente. Solo describen lo que el portal hace de verdad.
 * Los datos del consultorio vienen del perfil del médico; si faltan, el texto se adapta sin dejar huecos.
 */
export const buildTerms = (contact: TermsContact): TermsSection[] => {
  const doctorName = clean(contact.doctorName)
  const email = clean(contact.email)
  const phone = clean(contact.phone)

  const contactLines = [
    doctorName && `Médico: ${doctorName}`,
    email && `Correo: ${email}`,
    phone && `Teléfono: ${phone}`
  ].filter((line): line is string => Boolean(line))

  return [
    {
      id: 'quien-ofrece',
      title: 'Quién ofrece el portal',
      paragraphs: [
        `El portal es ofrecido por el consultorio${doctorName ? `, a cargo de ${doctorName}` : ''}. Es un servicio para los pacientes del consultorio.`
      ]
    },
    {
      id: 'que-puede-hacer',
      title: 'Qué puede hacer en el portal',
      paragraphs: [
        'Puede consultar su historia clínica cuando el médico la ha completado, sus evoluciones y sus recetas firmadas, y solicitar, reagendar o cancelar sus citas.',
        'El portal es de consulta: no permite modificar su historia clínica, sus evoluciones ni sus recetas.'
      ]
    },
    {
      id: 'emergencias',
      title: 'No es para emergencias',
      paragraphs: [
        'El portal no sustituye una consulta médica ni la atención de urgencias. Si tiene dolor en el pecho o falta de aire intensa, llame al 911.'
      ]
    },
    {
      id: 'su-cuenta',
      title: 'Su cuenta',
      paragraphs: [
        'La cuenta la crea el consultorio y se le entrega una contraseña temporal. Le recomendamos cambiarla desde «Mi cuenta».',
        'No comparta su contraseña: usted es responsable de lo que se haga con su cuenta. Avise al consultorio si sospecha un uso no autorizado.'
      ]
    },
    {
      id: 'citas',
      title: 'Citas',
      paragraphs: [
        'Una cita solicitada queda en estado «Pendiente» hasta que el consultorio la confirme. Si reagenda una cita, vuelve a «Pendiente».',
        'Puede cancelar sus citas desde el portal.'
      ]
    },
    {
      id: 'recetas',
      title: 'Recetas',
      paragraphs: [
        'Las recetas firmadas electrónicamente se pueden verificar escaneando el código QR del documento. Una receta anulada por el médico ya no debe dispensarse.'
      ]
    },
    {
      id: 'datos-personales',
      title: 'Sus datos personales y de salud',
      paragraphs: [
        'Sus datos de salud son datos sensibles. El consultorio los usa para su atención médica.',
        'La página pública de verificación de recetas, a la que lleva el código QR, muestra datos mínimos: sus iniciales (no su nombre completo ni su cédula), los medicamentos y los datos de la firma.',
        `Usted puede ejercer sus derechos de acceso, rectificación, eliminación, oposición y portabilidad conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador, ${email ? `escribiendo a ${email}` : 'comunicándose con el consultorio'}.`
      ]
    },
    {
      id: 'su-responsabilidad',
      title: 'Su responsabilidad',
      paragraphs: [
        'Mantenga actualizados sus datos de contacto y use el portal solo para consultar su propia información.'
      ]
    },
    {
      id: 'disponibilidad',
      title: 'Disponibilidad',
      paragraphs: [
        'El portal puede no estar disponible por mantenimiento o fallas. En ese caso, comuníquese con el consultorio.'
      ]
    },
    {
      id: 'cambios',
      title: 'Cambios a estos términos',
      paragraphs: [
        'Si estos términos cambian, se actualizará la fecha de este documento y se le informará en el portal.'
      ]
    },
    {
      id: 'contacto',
      title: 'Contacto',
      paragraphs:
        contactLines.length > 0
          ? contactLines
          : ['Comuníquese directamente con el consultorio.']
    }
  ]
}
