'use client'

import { formatDate } from '@/lib/format-date'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, FileKey2, Loader2, Trash2, Upload } from 'lucide-react'
import {
  removeSigningCertificate,
  saveSigningCertificate
} from '@/actions/signing-certificate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SigningCertificateInfo } from '@/lib/services/signing-service'

const DAY_MS = 24 * 60 * 60 * 1000

/** Extrae el nombre del titular (CN) del asunto "CN=..., O=..., C=EC" */
const commonName = (subject: string) =>
  subject.match(/CN=([^,]+)/)?.[1] ?? subject

interface CertificateCardProps {
  certificate: SigningCertificateInfo | null
  /** El servidor tiene SIGNING_ENCRYPTION_KEY configurada */
  encryptionConfigured: boolean
}

export const CertificateCard = ({
  certificate,
  encryptionConfigured
}: CertificateCardProps) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [showForm, setShowForm] = useState(!certificate)
  const [password, setPassword] = useState('')
  const [fileName, setFileName] = useState('')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  // Se fija al montar: Date.now() no se puede llamar directamente durante el render
  const [renderedAt] = useState(() => Date.now())

  const daysLeft = certificate
    ? Math.floor((new Date(certificate.validTo).getTime() - renderedAt) / DAY_MS)
    : 0

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast.error('Selecciona el archivo de tu certificado (.p12 o .pfx).')
      return
    }
    const formData = new FormData()
    formData.set('certificate', file)
    formData.set('password', password)

    setSaving(true)
    try {
      const result = await saveSigningCertificate(formData)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(`Certificado de ${result.commonName} guardado`)
      setPassword('')
      setFileName('')
      if (fileRef.current) fileRef.current.value = ''
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('¿Quitar el certificado? No podrás firmar recetas hasta subir uno nuevo.')) return
    setRemoving(true)
    try {
      const result = await removeSigningCertificate()
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Certificado eliminado')
      setShowForm(true)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className='space-y-5'>
      {!encryptionConfigured && (
        <p className='flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800'>
          <AlertTriangle className='mt-0.5 size-4 shrink-0' />
          El servidor no tiene configurada la clave de cifrado
          (SIGNING_ENCRYPTION_KEY). Sin ella no se puede guardar el certificado.
        </p>
      )}

      {certificate && (
        <div className='space-y-3 rounded-lg border bg-background p-4'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='flex items-start gap-3'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <FileKey2 className='size-5' />
              </div>
              <div className='min-w-0'>
                <p className='font-semibold'>{commonName(certificate.subject)}</p>
                <p className='text-sm text-muted-foreground'>
                  Emitido por {commonName(certificate.issuer)}
                </p>
              </div>
            </div>
            {daysLeft < 0 ? (
              <Badge className='border-transparent bg-red-100 text-red-800 hover:bg-red-100'>
                Vencido
              </Badge>
            ) : daysLeft <= 30 ? (
              <Badge className='border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100'>
                Vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
              </Badge>
            ) : (
              <Badge className='border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
                Vigente
              </Badge>
            )}
          </div>
          <dl className='grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2'>
            <div>
              <dt className='text-muted-foreground'>Vigencia</dt>
              <dd>
                {formatDate(certificate.validFrom)} – {formatDate(certificate.validTo)}
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Huella SHA-256</dt>
              <dd className='font-mono text-xs'>
                {certificate.fingerprintSha256.slice(0, 24)}…
              </dd>
            </div>
          </dl>
          {!showForm && (
            <div className='flex flex-wrap gap-2 pt-1'>
              <Button variant='outline' size='sm' onClick={() => setShowForm(true)}>
                <Upload className='size-4' />
                Reemplazar certificado
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleRemove}
                disabled={removing}
                className='text-red-700 hover:bg-red-50 hover:text-red-700'>
                {removing ? <Loader2 className='animate-spin' /> : <Trash2 className='size-4' />}
                Quitar
              </Button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Sube tu certificado de firma electrónica (archivo <strong>.p12</strong> o{' '}
            <strong>.pfx</strong>). Se guarda <strong>cifrado</strong> y la contraseña{' '}
            <strong>no se almacena</strong>: se te pedirá cada vez que firmes una receta.
          </p>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='certificate-file' className='font-semibold'>
                Archivo del certificado
              </Label>
              <Input
                id='certificate-file'
                ref={fileRef}
                type='file'
                accept='.p12,.pfx'
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
                className='h-11'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='certificate-password' className='font-semibold'>
                Contraseña del certificado
              </Label>
              <Input
                id='certificate-password'
                type='password'
                autoComplete='off'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className='h-11'
              />
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button
              type='submit'
              disabled={saving || !fileName || !password || !encryptionConfigured}
              className='font-semibold'>
              {saving ? <Loader2 className='animate-spin' /> : <Upload className='size-4' />}
              Guardar certificado
            </Button>
            {certificate && (
              <Button type='button' variant='ghost' onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
