import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Rutas que no exigen sesión */
const PUBLIC_PATHS = ['/login', '/auth', '/verificar']
/** Pantalla donde se ingresa el código del autenticador (2.º paso) */
const MFA_PATH = '/login/verificar'

/**
 * Se ejecuta en cada petición (src/proxy.ts):
 * 1. refresca la sesión de Supabase (cookies),
 * 2. exige iniciar sesión,
 * 3. exige el segundo paso (TOTP: Google/Microsoft Authenticator) cuando la cuenta ya lo tiene activado.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // No guardes este cliente en una variable global: se crea uno nuevo en cada petición.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  // IMPORTANTE: no pongas código entre createServerClient y getClaims(); si lo quitas,
  // los usuarios pueden ser desconectados al azar.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath))

  /** Redirige conservando las cookies de sesión recién refrescadas */
  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone()
    url.pathname = target
    url.search = ''
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  if (!claims) {
    if (isPublic) return supabaseResponse
    // Las rutas de API responden 401 en lugar de redirigir
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return redirectTo('/login')
  }

  // Sesión iniciada solo con contraseña (AAL1) en una cuenta que ya tiene el 2.º paso: falta verificarlo.
  // El nivel (aal) sale del JWT ya verificado por getClaims(); los factores se consultan con getUser(),
  // que pregunta al servidor de Auth. NO se usan los datos de la cookie (getSession), que se podrían alterar
  // para esconder el factor y saltarse la verificación.
  if (
    !path.startsWith('/auth') &&
    !path.startsWith('/verificar') &&
    path !== MFA_PATH &&
    claims.aal !== 'aal2'
  ) {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    const hasVerifiedFactor = Boolean(
      user?.factors?.some(
        (factor) => factor.factor_type === 'totp' && factor.status === 'verified'
      )
    )
    if (hasVerifiedFactor) {
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Falta la verificación en dos pasos' },
          { status: 401 }
        )
      }
      return redirectTo(MFA_PATH)
    }
  }

  return supabaseResponse
}
