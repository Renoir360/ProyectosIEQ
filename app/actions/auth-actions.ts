'use server'

import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET

export type LoginActionState = {
  success?: boolean
  error?: string
}

export async function loginAction(
  prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email y contraseña requeridos.' }
  }

  // Strict check for JWT secret in production
  const secret = JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'secret_v2')
  if (!secret) {
    console.error('CRITICAL: JWT_SECRET environment variable is missing!')
    return { error: 'Error interno del servidor. Por favor contacte soporte.' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: 'Credenciales inválidas.' }
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return { error: 'Credenciales inválidas.' }
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        name: user.name,
        department: user.department,
      },
      secret,
      { expiresIn: '7d' }
    )

    const cookieStore = await cookies()
    cookieStore.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error('Server Action login error:', error)
    return { error: 'Ocurrió un error inesperado al iniciar sesión.' }
  }
}

export type LoginStats = {
  activeProjects: number
  completedProjects: number
  progressPercentage: number
}

export async function getLoginStats(): Promise<LoginStats> {
  try {
    const [activeProjects, completedProjects, allProjects] = await Promise.all([
      prisma.project.count({
        where: {
          status: { in: ['PLANIFICADO', 'EN_PROGRESO', 'PAUSADO'] }
        }
      }),
      prisma.project.count({
        where: {
          status: 'COMPLETADO'
        }
      }),
      prisma.project.findMany({
        select: { progress: true }
      })
    ])

    const totalProgress = allProjects.reduce((acc, p) => acc + p.progress, 0)
    const progressPercentage = allProjects.length > 0 ? Math.round(totalProgress / allProjects.length) : 0

    return {
      activeProjects,
      completedProjects,
      progressPercentage
    }
  } catch (error) {
    console.error('Error fetching login stats:', error)
    return {
      activeProjects: 0,
      completedProjects: 0,
      progressPercentage: 0
    }
  }
}
