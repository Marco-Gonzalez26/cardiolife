'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { forgetCertificatePassword } from '@/lib/signing/password-session'

export const loginWithCode = async (email: string, code: string) => {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: code
  })

  if (error) {
    return {
      user: null,
      error: error.message
    }
  }

  // Si la cuenta tiene verificación en dos pasos, falta el código del autenticador
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal?.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
    redirect('/login/verificar')
  }

  redirect('/dashboard')
}
export async function logout() {
  await forgetCertificatePassword()
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
  redirect('/login')
}
