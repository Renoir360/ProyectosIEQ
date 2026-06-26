import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'
import { createTaskSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'
import { TaskStatus } from '@/lib/status'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')
        const areaId = searchParams.get('areaId')
        const status = searchParams.get('status')
        const q = searchParams.get('q')

        const where: Prisma.TaskWhereInput = {}
        if (projectId) where.projectId = projectId
        if (areaId) where.areaId = areaId
        if (status) where.status = status as TaskStatus
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { summary: { contains: q, mode: 'insensitive' } },
                { responsible: { contains: q, mode: 'insensitive' } }
            ]
        }

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                orderBy: { orderIndex: 'asc' },
                include: {
                    project: { select: { name: true } },
                    area: { select: { name: true } },
                    evidences: true
                },
                skip,
                take: limit
            }),
            prisma.task.count({ where })
        ])

        return NextResponse.json({
            data: tasks,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error('[TASKS_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== 'SISTEMAS') {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const body = await request.json()
        const result = createTaskSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(result.error.flatten(), { status: 400 })
        }

        const task = await prisma.task.create({
            data: {
                title: result.data.title,
                projectId: result.data.projectId,
                areaId: result.data.areaId || null,
                description: result.data.description,
                summary: result.data.summary || result.data.description.substring(0, 120),
                responsible: result.data.responsible || null,
                dueDate: result.data.dueDate ? new Date(result.data.dueDate) : null,
                acceptanceCriteria: result.data.acceptanceCriteria || null,
                dependencies: result.data.dependencies || null,
                detailsJson: {
                    diagnostico: [],
                    pasos: [],
                    entregables: [],
                    notes: result.data.description
                },
                priority: result.data.priority,
                status: 'BACKLOG',
            }
        })

        // Registrar en auditoría
        try {
            const { logAuditEvent } = await import('@/lib/audit')
            await logAuditEvent(
                task.projectId,
                'CREACION_TAREA',
                `Se creó la tarea "${task.title}" asignada a ${task.responsible || 'nadie'} por ${user.name}`
            )
        } catch (auditErr) {
            console.error('Error al registrar auditoría de creación de tarea:', auditErr)
        }

        return NextResponse.json(task)
    } catch (error) {
        console.error('[TASKS_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
