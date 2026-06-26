import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_v2' // Rotated to force re-login

export async function getCurrentUser() {
    const cookieStore = await cookies()
    const session = cookieStore.get('auth')

    if (!session) return null

    try {
        const decoded = jwt.verify(session.value, JWT_SECRET) as {
            userId: string
            role: string
            name?: string
            department: string
        }
        return decoded
    } catch (error) {
        return null
    }
}
