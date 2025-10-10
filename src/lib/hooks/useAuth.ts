'use client'
import { onAuthStateChange } from '@/lib/services/auth-service'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface User {
  id: string
  email?: string
  fullName: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      if (error || !session) {
        setUser(null)
        return
      }
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            fullName: profile?.fullName
          })
        }
      }
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription }
    } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            fullName: profile.full_name
          })
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/login')
        toast.success('Sesión cerrada correctamente')
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
    setUser(null)
    toast.success('Sesión cerrada correctamente')
    router.push('/login')
  }

  return { user, logout, loading }
}
