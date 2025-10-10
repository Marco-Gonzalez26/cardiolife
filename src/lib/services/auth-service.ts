import { supabase } from '@/lib/supabase'
import { email } from 'zod'

export const loginWithCode = async (email: string, code: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: code
    })
    if (error) {
      throw new Error(error.message)
    }
    return { user: data.user, error: null }
  } catch (error) {
    return {
      user: null,
      error:
        error instanceof Error ? error.message : 'Ocurrió un error al ingresar'
    }
  }
}

export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}

export const getSession = async () => {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()
  if (error) {
    throw new Error(error.message)
  }
  return session
}

export const onAuthStateChange = (
  callback: (event: string, session: any) => void
) => {
  return supabase.auth.onAuthStateChange(callback)
}
