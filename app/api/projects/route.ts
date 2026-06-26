import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { cookies } from 'next/headers'
import { getDepartmentWhere } from '@/lib/department'

const projectSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    description: z.string().optional().nullable(),
    budget: z.number().optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    status: z.enum(['PLANIFICADO', 'EN_PROGRESO', 'PAUSADO', 'COMPLETADO']),
    department: z.enum(['SISTEMAS', 'GLOBAL']).default('SISTEMAS'),
    progress: z.number().min(0).max(100).default(0)
})

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== 'SISTEMAS') {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const body = await req.json()
        const validatedData = projectSchema.parse(body)

        const project = await prisma.project.create({
            data: {
                ...validatedData,
                startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
                endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
                // @ts-ignore
                department: validatedData.department,
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ fieldErrors: error.flatten().fieldErrors }, { status: 400 })
        }
        console.error('[PROJECTS_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser()
        const cookieStore = await cookies()
        const selectedDept = cookieStore.get('selected_department')?.value
        const where: any = user ? getDepartmentWhere(user as any, selectedDept) : {}

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { tasks: true }
                    }
                },
                skip,
                take: limit
            }),
            prisma.project.count({ where })
        ])

        return NextResponse.json({
            data: projects,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }, {
            headers: { 'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60' }
        })
    } catch (error) {
        console.error('[PROJECTS_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
