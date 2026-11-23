export type VerificationStatus = 'valid' | 'annulled' | 'not_found'

/**
 * Qué estado mostrar en la página pública de verificación.
 * La página solo puede afirmar que la receta figura firmada en Cardiolife (o anulada, o inexistente):
 * la validez de la firma electrónica la comprueba el lector en el panel de firmas del PDF.
 */
export const getVerificationStatus = (
  record: { status?: string | null } | null | undefined
): VerificationStatus => {
  if (!record) return 'not_found'
  return record.status === 'Anulada' ? 'annulled' : 'valid'
}

export const verificationCopy: Record<
  VerificationStatus,
  { title: string; description: string }
> = {
  valid: {
    title: 'Receta firmada y registrada',
    description:
      'Figura en Cardiolife con firma electrónica. La validez de la firma se comprueba en el PDF.'
  },
  annulled: {
    title: 'Receta ANULADA',
    description:
      'Esta receta fue firmada pero después el médico la anuló. No debe dispensarse.'
  },
  not_found: {
    title: 'Receta no encontrada',
    description:
      'No existe una receta firmada con este código. Si tiene el documento impreso, desconfíe de él y consulte al consultorio.'
  }
}

export const VERIFICATION_HINT =
  'Para una verificación completa, abra el PDF en Adobe Acrobat o Foxit y revise el panel de firmas, o compare la huella SHA-256 del archivo.'
