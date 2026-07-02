'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const loginWithCode = async (email: string, code: string) => {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: code
  })

  if (error) {
    return {
      user: null,
      error: error.message
    }
  }

  redirect('/dashboard')
}
export async function logout() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}
