import { logError } from '@/lib/logger'
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { createPurchaseRequestSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/purchases
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const projectId = searchParams.get('projectId')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        // Build where clause
        const where: Record<string, unknown> = {}
        if (type && type !== 'ALL') where.type = type
        if (status && status !== 'ALL') where.status = status
        if (projectId && projectId !== 'ALL') where.projectId = projectId

        const [purchases, total] = await Promise.all([
            prisma.purchaseRequest.findMany({
                where,
                include: {
                    project: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.purchaseRequest.count({ where })
        ])

        return NextResponse.json({
            data: purchases,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        logError('PURCHASES_GET', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

// POST /api/purchases
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== 'SISTEMAS') {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const body = await request.json()
        const result = createPurchaseRequestSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(result.error.flatten(), { status: 400 })
        }

        const purchase = await prisma.purchaseRequest.create({
            data: {
                ...result.data,
                department: user.department as 'SISTEMAS' | 'GLOBAL'
            },
            include: {
                project: {
                    select: { id: true, name: true }
                }
            }
        })

        // Registrar auditoría
        try {
            const { logAuditEvent } = await import('@/lib/audit')
            await logAuditEvent(
                purchase.projectId,
                'CREACION_COMPRA',
                `Se creó una solicitud de compra de tipo "${purchase.type}" para "${purchase.title}" por un monto de $${purchase.estimatedAmount} por ${user.name}`
            )
        } catch (auditErr) {
            logError('error', auditErr)
        }

        // Notificar a Presidencia si está en revisión
        if (purchase.status === 'EN_REVISION') {
            try {
                const { sendPurchaseEmail } = await import('@/lib/email')
                await sendPurchaseEmail(
                    purchase,
                    'PENDING_APPROVAL',
                    'presidencia@clinicaieq.com',
                    'Presidencia IEQ'
                )
            } catch (mailErr) {
                logError('error', mailErr)
            }
        }

        return NextResponse.json(purchase, { status: 201 })
    } catch (error) {
        logError('PURCHASES_POST', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
