import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    // Check for auth cookie
    const session = request.cookies.get('auth')?.value

    const isLoginPage = request.nextUrl.pathname === '/login'

    // Exclude static files, api routes, and public assets from checks if needed
    // For now, we protect everything except /login as per instructions (implicit)
    // Actually user said: "if (!session && !request.nextUrl.pathname.startsWith('/login'))"
    // We should probably check specific exclusions to avoid breaking stuff like /api/auth/login

    // Allow access to API routes related to auth without session if needed (e.g. login)
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next()
    }

    // Also exclude static files/Next.js internals usually
    if (request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname.includes('.')) { // Simple check for files
        return NextResponse.next()
    }

    if (!session && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (session && isLoginPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
