'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/components-client'

/** Segundo paso del ingreso: código de 6 dígitos de Google Authenticator / Microsoft Authenticator */
export default function VerifyMfaPage() {
  const router = useRouter()
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.mfa.listFactors().then(({ data, error }) => {
      const factor = data?.totp?.[0]
      if (error || !factor) {
        // Sin factor verificado no hay nada que confirmar aquí
        router.replace('/dashboard')
        return
      }
      setFactorId(factor.id)
      setChecking(false)
    })
  }, [router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!factorId || code.length !== 6) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    })
    setLoading(false)

    if (error) {
      toast.error('Código incorrecto o vencido. Inténtalo de nuevo.')
      setCode('')
      return
    }
    router.replace('/dashboard')
    router.refresh()
  }

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.replace('/login')
  }

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-2'>
          <div className='flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <ShieldCheck className='size-6' />
          </div>
          <h1 className='text-xl font-bold'>Verificación en dos pasos</h1>
          <CardDescription>
            Abre Google Authenticator o Microsoft Authenticator e ingresa el
            código de 6 dígitos de Cardiolife.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='grid gap-4'>
            <Input
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              inputMode='numeric'
              autoComplete='one-time-code'
              autoFocus
              placeholder='123456'
              aria-label='Código de verificación'
              disabled={checking}
              className='h-12 text-center text-2xl tracking-[0.5em]'
            />
            <Button
              type='submit'
              disabled={loading || checking || code.length !== 6}
              className='h-11 font-semibold'>
              {loading ? <Loader2 className='animate-spin' /> : null}
              Verificar
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={handleSignOut}
              className='text-muted-foreground'>
              Cerrar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
