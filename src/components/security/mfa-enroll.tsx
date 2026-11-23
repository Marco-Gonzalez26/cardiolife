'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, QrCode, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/components-client'

/**
 * Activación de la verificación en dos pasos (TOTP): se escanea un QR con Google Authenticator o
 * Microsoft Authenticator y se confirma con un primer código de 6 dígitos.
 */
export const MfaEnroll = ({ onEnrolled }: { onEnrolled?: () => void }) => {
  const router = useRouter()
  const [qr, setQr] = useState<string | null>(null)
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const start = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Quita intentos anteriores que quedaron sin confirmar (si no, el alta falla por nombre repetido)
      const { data: factors } = await supabase.auth.mfa.listFactors()
      for (const factor of factors?.all ?? []) {
        if (factor.factor_type === 'totp' && factor.status === 'unverified') {
          await supabase.auth.mfa.unenroll({ factorId: factor.id })
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Cardiolife',
        friendlyName: `Autenticador ${new Date().toISOString().slice(0, 10)}`
      })
      if (error || !data) {
        toast.error(
          error?.message?.toLowerCase().includes('disabled')
            ? 'La verificación en dos pasos está desactivada en Supabase (Authentication → Multi-Factor).'
            : (error?.message ?? 'No se pudo iniciar la activación')
        )
        return
      }
      setFactorId(data.id)
      setQr(data.totp.qr_code)
      setSecret(data.totp.secret)
    } finally {
      setLoading(false)
    }
  }

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault()
    if (code.length !== 6) return
    setLoading(true)
    try {
      const { error } = await createClient().auth.mfa.challengeAndVerify({
        factorId,
        code
      })
      if (error) {
        toast.error('Código incorrecto o vencido. Inténtalo de nuevo.')
        setCode('')
        return
      }
      toast.success('Verificación en dos pasos activada')
      onEnrolled?.()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (!qr) {
    return (
      <Button onClick={start} disabled={loading} className='gap-2 font-semibold'>
        {loading ? <Loader2 className='animate-spin' /> : <ShieldCheck className='size-4' />}
        Activar verificación en dos pasos
      </Button>
    )
  }

  return (
    <form onSubmit={confirm} className='space-y-5'>
      <ol className='list-decimal space-y-1 pl-5 text-sm text-muted-foreground'>
        <li>
          Instala <strong>Google Authenticator</strong> o{' '}
          <strong>Microsoft Authenticator</strong> en tu teléfono.
        </li>
        <li>Escanea este código QR (opción &quot;Agregar cuenta&quot;).</li>
        <li>Ingresa el código de 6 dígitos que muestra la app.</li>
      </ol>

      <div className='flex flex-col items-center gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-start'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt='Código QR para el autenticador' className='size-44' />
        <div className='space-y-2 text-sm'>
          <p className='flex items-center gap-2 font-medium'>
            <QrCode className='size-4' />
            ¿No puedes escanear?
          </p>
          <p className='text-muted-foreground'>
            Ingresa esta clave manualmente en la app:
          </p>
          <code className='block break-all rounded bg-muted px-2 py-1 text-xs'>
            {secret}
          </code>
        </div>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row'>
        <Input
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
          }
          inputMode='numeric'
          autoComplete='one-time-code'
          placeholder='123456'
          aria-label='Código de verificación'
          className='h-11 text-center text-xl tracking-[0.4em] sm:max-w-48'
        />
        <Button type='submit' disabled={loading || code.length !== 6} className='h-11 font-semibold'>
          {loading ? <Loader2 className='animate-spin' /> : null}
          Confirmar y activar
        </Button>
      </div>
    </form>
  )
}
