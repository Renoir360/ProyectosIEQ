import prisma from '@/lib/db'
import { getCurrentUser } from './auth'

export async function logAuditEvent(
    projectId: string | null,
    action: string,
    details: string
) {
    try {
        const sessionUser = await getCurrentUser()
        if (!sessionUser) return

        // Obtener el email del usuario de la base de datos a partir del id de sesión
        const user = await prisma.user.findUnique({
            where: { id: sessionUser.userId },
            select: { email: true }
        })

        await prisma.auditLog.create({
            data: {
                projectId,
                action,
                details,
                userEmail: user?.email || null,
                userName: sessionUser.name || null
            }
        })
    } catch (error) {
        console.error('Error al guardar log de auditoría:', error)
    }
}
