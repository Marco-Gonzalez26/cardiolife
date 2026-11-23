import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

/**
 * Cifrado simétrico AES-256-GCM para guardar el certificado de firma en la base de datos.
 * La clave vive SOLO en el servidor (SIGNING_ENCRYPTION_KEY): quien robe la base de datos
 * sin esa clave no puede usar el certificado.
 *
 * Formato guardado (base64): iv (12 bytes) | etiqueta de autenticación (16) | texto cifrado.
 */
const IV_LENGTH = 12
const TAG_LENGTH = 16

const getKey = (): Buffer => {
  const raw = process.env.SIGNING_ENCRYPTION_KEY
  if (!raw) {
    throw new Error(
      'Falta SIGNING_ENCRYPTION_KEY en el servidor (32 bytes en base64). Genera una con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
    )
  }
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) {
    throw new Error('SIGNING_ENCRYPTION_KEY debe tener exactamente 32 bytes en base64')
  }
  return key
}

export const isEncryptionConfigured = () => {
  try {
    getKey()
    return true
  } catch {
    return false
  }
}

export const encryptSecret = (plain: Buffer): string => {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64')
}

export const decryptSecret = (payload: string): Buffer => {
  const data = Buffer.from(payload, 'base64')
  const iv = data.subarray(0, IV_LENGTH)
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH)
  const decipher = createDecipheriv('aes-256-gcm', getKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()])
}
