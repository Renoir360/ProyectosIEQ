import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { updateProjectSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/projects/[id]
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                areas: {
                    include: {
                        tasks: {
                            include: { evidences: true },
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                },
                // We also want tasks that have no area, or just all tasks?
                // Plan says: "Tabs: Areas y Todas las tareas".
                // So fetching areas->tasks covers categorized ones.
                // We might want to fetch orphans too if any.
                tasks: {
                    where: { areaId: null },
                    include: { evidences: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!project) {
            return new NextResponse('Project not found', { status: 404 })
        }

        return NextResponse.json(project)
    } catch (error) {
        console.error('[PROJECT_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

// PATCH /api/projects/[id]
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
        const result = updateProjectSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(result.error.flatten(), { status: 400 })
        }

        const project = await prisma.project.update({
            where: { id },
            data: result.data
        })

        // Force revalidation of lists where this project appears
        revalidatePath('/projects')
        revalidatePath('/dashboard')
        revalidatePath(`/projects/${id}`)

        return NextResponse.json(project)
    } catch (error) {
        console.error('[PROJECT_PATCH]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
