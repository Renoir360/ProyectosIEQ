import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_v2'

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const record = loginAttempts.get(ip)
    if (!record || now - record.lastAttempt > WINDOW_MS) {
        loginAttempts.set(ip, { count: 1, lastAttempt: now })
        return false
    }
    record.count++
    record.lastAttempt = now
    return record.count > MAX_ATTEMPTS
}

function clearAttempts(ip: string) {
    loginAttempts.delete(ip)
}

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Demasiados intentos. Intente de nuevo en 15 minutos.' },
                { status: 429 }
            )
        }

        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email }
        }) as any // Cast to any to avoid stale type validation errors

        if (!user) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
        }

        const isValid = await bcrypt.compare(password, user.passwordHash)

        if (!isValid) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                name: user.name,
                department: user.department
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        const cookieStore = await cookies()
        cookieStore.set('auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        })

        clearAttempts(ip)
        return NextResponse.json({ success: true, redirect: '/dashboard' })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
