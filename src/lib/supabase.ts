import { createClient } from '@supabase/supabase-js'
import { DB_TABLES } from './constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getCurrentUser = async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: userData } = await supabase
    .from(DB_TABLES.DOCTOR_PROFILE)
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    ...userData
  }
}
