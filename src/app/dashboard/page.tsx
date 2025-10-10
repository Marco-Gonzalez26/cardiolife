import { AppSection } from '@/components/app-section'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server-props'
import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'

export default async function Page() {
  return (
    <AppSection>
      <h1>Dashboard </h1>
    </AppSection>
  )
}
