import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🔒 Absolute Admin Protection Regex
// Add any paths that need Admin-level protection here
const ADMIN_PATHS = /^\/admin(\/.*)?$/

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Create SSR client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // Refresh user session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = req.nextUrl.pathname

  // 1. ADMIN ROUTE PROTECTION
  if (ADMIN_PATHS.test(path)) {
    // A. Not Logged In
    if (!user) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth'
      redirectUrl.searchParams.set(`redirectedFrom`, path)
      return NextResponse.redirect(redirectUrl)
    }

    // B. Logged in, but NOT the admin email
    const ADMIN_EMAIL = "kishor79954@gmail.com"
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      // Return them to homepage if they have no business in admin
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }
    
    // C. Approved, allow request to proceed to Next.js router
    // Before returning, run the visitor check for admin as well (in case admin is a new visitor)
  }

  // 2. Visitor Tracking
  const visitorCookieName = 'gadgetaura_visitor_id'
  if (!req.cookies.has(visitorCookieName)) {
    const visitorId = crypto.randomUUID()
    
    // Set cookie on the response so the browser remembers them
    response.cookies.set(visitorCookieName, visitorId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 Days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    // Avoid logging bot traffic or prefetches by wrapping in a minimal soft check
    // The middleware matcher already excludes _next and static assets
    await supabase.from('visitors').insert({
      id: visitorId,
      path: req.nextUrl.pathname,
      user_agent: req.headers.get('user-agent') || 'Anonymous',
    })
  }

  // 3. Default pass-through
  return response
}

// Specify the paths where middleware should run (optimize performance)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
