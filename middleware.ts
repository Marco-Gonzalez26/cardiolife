import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('entro en middleware')
  try {
    const res = NextResponse.next()
    const cookiesStore = await cookies()
    const supabase = await createSupabaseServerClient(cookiesStore)

    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    const protectedPaths = ['/dashboard']

    const isProtected = protectedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    )

    if (isProtected && !session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const authRoutes = ['/login']

    const isAuthRoutes = authRoutes.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    )

    if (isAuthRoutes && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return res
  } catch (error) {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
