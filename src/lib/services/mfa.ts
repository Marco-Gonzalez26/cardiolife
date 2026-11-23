import type { createClient } from '@/lib/supabase/server'

type ServerClient = ReturnType<typeof createClient>

export type MfaState = {
  /** Tiene un autenticador (TOTP) verificado */
  enrolled: boolean
  factorId: string | null
  factorName: string | null
}

export async function getMfaState(supabase: ServerClient): Promise<MfaState> {
  const { data } = await supabase.auth.mfa.listFactors()
  // `totp` solo trae los factores ya verificados
  const factor = data?.totp?.[0]
  return {
    enrolled: Boolean(factor),
    factorId: factor?.id ?? null,
    factorName: factor?.friendly_name ?? null
  }
}

/**
 * La sesión ya pasó el segundo factor (AAL2). Se lee del JWT verificado (getClaims), no de la cookie
 * sin verificar, para que no se pueda aparentar un nivel mayor.
 */
export async function isAal2(supabase: ServerClient): Promise<boolean> {
  const { data } = await supabase.auth.getClaims()
  return data?.claims?.aal === 'aal2'
}
