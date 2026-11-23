const UNITS = [
  'cero',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve'
]
const TENS = [
  '',
  '',
  '',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa'
]
const HUNDREDS = [
  '',
  'ciento',
  'doscientos',
  'trescientos',
  'cuatrocientos',
  'quinientos',
  'seiscientos',
  'setecientos',
  'ochocientos',
  'novecientos'
]

const below100 = (n: number): string => {
  if (n < 30) return UNITS[n]
  const ten = Math.floor(n / 10)
  const unit = n % 10
  return unit ? `${TENS[ten]} y ${UNITS[unit]}` : TENS[ten]
}

const below1000 = (n: number): string => {
  if (n === 100) return 'cien'
  const hundred = Math.floor(n / 100)
  const rest = n % 100
  return [HUNDREDS[hundred], rest ? below100(rest) : ''].filter(Boolean).join(' ')
}

/**
 * Número entero (0 a 999 999) en letras, en minúsculas y con apócope ("un", "veintiún")
 * porque se usa delante de un sustantivo: 31 -> "treinta y un", 1 -> "un".
 */
export const numberToWords = (value: number): string => {
  const n = Math.trunc(value)
  if (!Number.isFinite(n) || n < 0 || n > 999_999) return String(value)
  if (n < 1000) return apocope(below1000(n === 0 ? 0 : n) || 'cero')

  const thousands = Math.floor(n / 1000)
  const rest = n % 1000
  const prefix = thousands === 1 ? 'mil' : `${apocope(below1000(thousands))} mil`
  return apocope(rest ? `${prefix} ${below1000(rest)}` : prefix)
}

const apocope = (words: string) =>
  words.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un')
