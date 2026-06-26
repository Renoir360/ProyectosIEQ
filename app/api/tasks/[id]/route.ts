import { logError } from '@/lib/logger'
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { Prisma, ProjectStatus } from '@prisma/client'
import { updateTaskSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== 'SISTEMAS') {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const { id } = await params
        const body = await request.json()
        const result = updateTaskSchema.safeParse(body)

        if (!result.success) {
            logError('TASK_PATCH] Invalid body:', body)
            logError('TASK_PATCH] Validation error:', result.error.flatten())
            return NextResponse.json(result.error.flatten(), { status: 400 })
        }

        // Atomic transaction
        let originalStatus = ''
        let originalTitle = ''

        const updatedTask = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Get current task for JSON merge and validation
            const currentTask = await tx.task.findUnique({
                where: { id },
                select: { detailsJson: true, projectId: true, title: true, status: true }
            })
            if (currentTask) {
                originalStatus = currentTask.status
                originalTitle = currentTask.title
            }

            if (!currentTask) {
                throw new Error('Task not found')
            }

            // 2. Validate Area belongs to Project if provided
            if (result.data.areaId) {
                const area = await tx.area.findUnique({
                    where: { id: result.data.areaId },
                    select: { projectId: true }
                })
                if (!area || area.projectId !== currentTask.projectId) {
                    throw new Error('Invalid Area for this project')
                }
            }

            // 3. Prepare update data
            const updateData: Record<string, any> = { ...result.data }

            // Merge detailsJson if provided
            if (result.data.detailsJson) {
                const currentDetails = (currentTask.detailsJson as Record<string, any>) || {}
                updateData.detailsJson = {
                    ...currentDetails,
                    ...result.data.detailsJson
                }
            }

            // Convert dueDate string to Date
            if (result.data.dueDate !== undefined) {
                updateData.dueDate = result.data.dueDate ? new Date(result.data.dueDate) : null
            }

            // 4. Update the task
            const task = await tx.task.update({
                where: { id },
                data: updateData
            })

            // 5. Recalculate Project Progress if status changed
            if (result.data.status) {
                const projectId = task.projectId
                // Optimized parallel counts to reduce transaction duration
                const [total, done, inProgress] = await Promise.all([
                    tx.task.count({ where: { projectId } }),
                    tx.task.count({ where: { projectId, status: 'DONE' } }),
                    tx.task.count({ where: { projectId, status: 'IN_PROGRESS' } })
                ])

                let progress = 0
                if (total > 0) {
                    progress = Math.round((done / total) * 100)
                }

                let projectStatus: ProjectStatus = ProjectStatus.PLANIFICADO
                if (total > 0 && done === total) {
                    projectStatus = ProjectStatus.COMPLETADO
                } else if (inProgress > 0 || done > 0) {
                    projectStatus = ProjectStatus.EN_PROGRESO
                }

                await tx.project.update({
                    where: { id: projectId },
                    data: { progress, status: projectStatus }
                })
            }

            return task
        })

        // Registrar auditoría
        try {
            const { logAuditEvent } = await import('@/lib/audit')
            if (result.data.status && result.data.status !== originalStatus) {
                await logAuditEvent(
                    updatedTask.projectId,
                    'CAMBIO_ESTADO_TAREA',
                    `Se cambió el estado de la tarea "${originalTitle}" de "${originalStatus}" a "${result.data.status}" por ${user.name}`
                )
            } else {
                await logAuditEvent(
                    updatedTask.projectId,
                    'ACTUALIZACION_TAREA',
                    `Se actualizaron los datos de la tarea "${originalTitle}" por ${user.name}`
                )
            }
        } catch (auditErr) {
            logError('error', auditErr)
        }

        return NextResponse.json(updatedTask)
    } catch (error) {
        logError('TASK_PATCH_ERROR', error)
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}


