'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/components-client'

/** El paciente cambia su propia contraseña (la temporal que le entregó el consultorio) */
export const ChangePasswordForm = () => {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (password.length < 10) {
      toast.error('La contraseña debe tener al menos 10 caracteres')
      return
    }
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      const { error } = await createClient().auth.updateUser({
        password,
        data: { must_change_password: false }
      })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('Contraseña actualizada')
      setPassword('')
      setConfirm('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='max-w-sm space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='new-password' className='font-semibold'>
          Nueva contraseña
        </Label>
        <Input
          id='new-password'
          type='password'
          autoComplete='new-password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className='h-11'
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='confirm-password' className='font-semibold'>
          Repite la contraseña
        </Label>
        <Input
          id='confirm-password'
          type='password'
          autoComplete='new-password'
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className='h-11'
        />
      </div>
      <Button type='submit' disabled={loading} className='font-semibold'>
        {loading && <Loader2 className='animate-spin' />}
        Guardar contraseña
      </Button>
    </form>
  )
}
