
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create client specifically for middleware (Supabase weirdness with cookies)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // ROUTE PROTECTION LOGIC
    const path = request.nextUrl.pathname;

    // 1. Protected Routes (Dashboard, Catalog, Settings, etc.)
    if (path.startsWith('/dashboard') || path.startsWith('/app-catalog') || path.startsWith('/access-rights') || path.startsWith('/settings')) {
        if (!user) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 2. Auth Routes (Login Page) - If logged in, redirect to dashboard
    if (path === '/') {
        if (user) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}
