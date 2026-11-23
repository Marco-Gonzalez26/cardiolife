import QRCode from 'qrcode'
import { getAppOrigin } from '@/lib/app-url'

/** Enlace público donde cualquiera puede comprobar que la receta es auténtica */
export const verificationUrl = async (groupId: string) =>
  `${await getAppOrigin()}/verificar/${groupId}`

/** QR (PNG en data URI) que apunta a la página de verificación de la receta */
export async function buildVerificationQr(groupId: string) {
  const url = await verificationUrl(groupId)
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 220
  })
  return { url, dataUrl }
}
