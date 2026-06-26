import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { TaskStatus } from '@prisma/client'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15, params is a promise
) {
    try {
        const { id } = await params

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                areas: {
                    include: {
                        tasks: {
                            orderBy: { createdAt: 'desc' }
                        }
                    },
                    orderBy: { name: 'asc' }
                },
                tasks: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!project) {
            return NextResponse.json(
                { error: 'Proyecto no encontrado' },
                { status: 404 }
            )
        }

        const totalTasks = project.tasks.length
        const doneTasks = project.tasks.filter(t => t.status === TaskStatus.DONE).length
        const inProgressTasks = project.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length
        const readyTasks = project.tasks.filter(t => t.status === TaskStatus.READY).length
        const backlogTasks = project.tasks.filter(t => t.status === TaskStatus.BACKLOG).length

        return NextResponse.json({
            project: {
                id: project.id,
                name: project.name,
                description: project.description,
                createdAt: project.createdAt,
                progress: project.progress,
                status: project.status
            },
            stats: {
                totalTasks,
                doneTasks,
                inProgressTasks,
                readyTasks,
                backlogTasks,
                progressPercentage: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
            },
            areas: project.areas.map(area => ({
                id: area.id,
                name: area.name,
                taskCount: area.tasks.length,
                doneCount: area.tasks.filter(t => t.status === TaskStatus.DONE).length
            })),
            tasks: project.tasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                detailsJson: task.detailsJson,
                acceptanceCriteria: task.acceptanceCriteria,
                status: task.status,
                responsible: task.responsible,
                dueDate: task.dueDate,
                areaId: task.areaId
            }))
        })
    } catch (error) {
        logError('error', error)
        return NextResponse.json(
            { error: 'Error al exportar proyecto' },
            { status: 500 }
        )
    }
}
