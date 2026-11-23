import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Decisión del consultorio: a los pacientes se les habla de "usted".
 * Este test recorre los textos que ve el paciente y avisa si vuelve a aparecer el tuteo.
 */
const PATIENT_FACING = [
  'src/app/portal',
  'src/components/portal',
  'src/app/verificar',
  'src/actions/appointments.ts',
  'src/lib/terms.ts',
  'src/lib/verification-copy.ts'
]

const TUTEO =
  /(?<![\p{L}])(tú|tu|tus|puedes|tienes|elige|comunícate|cuéntanos|desconfía|abre|revisa|compara|inicia|ingresa|intenta)(?![\p{L}])/giu

const sourceFiles = (target: string): string[] => {
  const full = path.join(process.cwd(), target)
  if (statSync(full).isFile()) return [full]
  return readdirSync(full).flatMap((entry) => {
    const child = path.join(target, entry)
    if (statSync(path.join(process.cwd(), child)).isDirectory()) return sourceFiles(child)
    return /\.(ts|tsx)$/.test(entry) && !/\.test\./.test(entry)
      ? [path.join(process.cwd(), child)]
      : []
  })
}

/** Quita los comentarios: ahí se habla del paciente en tercera persona y no es texto de pantalla */
const withoutComments = (code: string) =>
  code.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' ')).replace(
    /(^|[^:])\/\/.*$/gm,
    '$1'
  )

describe('texto para el paciente', () => {
  it('trata al paciente de usted, sin tuteo', () => {
    const violations = PATIENT_FACING.flatMap(sourceFiles).flatMap((file) =>
      withoutComments(readFileSync(file, 'utf8'))
        .split('\n')
        .flatMap((line, index) =>
          [...line.matchAll(TUTEO)].map(
            (match) =>
              `${path.relative(process.cwd(), file)}:${index + 1} "${match[0]}"`
          )
        )
    )
    expect(violations).toEqual([])
  })
})
