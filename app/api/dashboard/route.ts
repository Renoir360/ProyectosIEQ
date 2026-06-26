import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { TASK_STATUS_LABEL } from '@/lib/status'

const TaskStatus = {
    BACKLOG: 'BACKLOG',
    READY: 'READY',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE'
} as const

const TaskPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH'
} as const

export async function GET() {
    try {
        const user = await getCurrentUser()
        const where = {}

        const now = new Date()
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const [projects, totalAreas, stats, upcomingTasks, criticalTasks] = await Promise.all([
            prisma.project.findMany({
                where,
                include: {
                    tasks: { select: { status: true } },
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.area.count({
                where: { project: where }
            }),
            prisma.task.groupBy({
                by: ['status'],
                _count: { status: true },
                where: { project: where }
            }),
            prisma.task.findMany({
                where: {
                    status: { not: 'DONE' },
                    dueDate: {
                        gte: now,
                        lte: next7Days
                    },
                    project: where
                },
                take: 10,
                orderBy: { dueDate: 'asc' },
                include: { project: { select: { id: true, name: true } } }
            }),
            prisma.task.findMany({
                where: {
                    priority: 'HIGH',
                    status: { not: 'DONE' },
                    project: where
                },
                take: 5,
                orderBy: [
                    { dueDate: 'asc' },
                    { updatedAt: 'desc' }
                ],
                include: {
                    project: { select: { name: true } },
                    area: { select: { name: true } }
                }
            })
        ])

        let totalTasks = 0
        let doneTasks = 0
        const statusCounts: Record<string, number> = {
            [TaskStatus.BACKLOG]: 0,
            [TaskStatus.READY]: 0,
            [TaskStatus.IN_PROGRESS]: 0,
            [TaskStatus.DONE]: 0,
        }

        stats.forEach((s) => {
            statusCounts[s.status as string] = s._count.status
            totalTasks += s._count.status
            if (s.status === 'DONE') doneTasks += s._count.status
        })

        const globalProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

        const data = {
            topStats: {
                totalProjects: projects.length,
                totalAreas,
                totalTasks,
                globalProgress
            },
            projectsData: projects.map((p) => {
                const pTotal = p.tasks.length
                const pDone = p.tasks.filter((t) => t.status === 'DONE').length
                const computedProgress = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0
                return {
                    name: p.name,
                    progress: computedProgress,
                    done: pDone,
                    total: pTotal
                }
            }),
            statusData: [
                { name: TASK_STATUS_LABEL[TaskStatus.BACKLOG], value: statusCounts[TaskStatus.BACKLOG], fill: 'var(--chart-1)' },
                { name: TASK_STATUS_LABEL[TaskStatus.READY], value: statusCounts[TaskStatus.READY], fill: 'var(--chart-2)' },
                { name: TASK_STATUS_LABEL[TaskStatus.IN_PROGRESS], value: statusCounts[TaskStatus.IN_PROGRESS], fill: 'var(--chart-3)' },
                { name: TASK_STATUS_LABEL[TaskStatus.DONE], value: statusCounts[TaskStatus.DONE], fill: 'var(--chart-4)' },
            ],
            upcomingTasks,
            criticalTasks
        }

        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60' }
        })
    } catch (error) {
        console.error('[DASHBOARD_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
