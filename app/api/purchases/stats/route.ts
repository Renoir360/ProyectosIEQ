import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const projectId = searchParams.get('projectId')

        const year2026Start = new Date('2026-01-01T00:00:00.000Z')

        const where: any = { createdAt: { gte: year2026Start } }
        if (type && type !== 'ALL') where.type = type
        if (status && status !== 'ALL') where.status = status
        if (projectId && projectId !== 'ALL') where.projectId = projectId

        const [aggregate, statusCounts] = await Promise.all([
            prisma.purchaseRequest.aggregate({
                where,
                _sum: { estimatedAmount: true },
                _count: { _all: true }
            }),
            prisma.purchaseRequest.groupBy({
                by: ['status'],
                where,
                _count: { _all: true }
            })
        ])

        const total = aggregate._count._all
        const totalAmount = aggregate._sum.estimatedAmount || 0
        const pending = statusCounts.find(s => s.status === 'EN_REVISION')?._count._all || 0
        const approved = statusCounts
            .filter(s => ['APROBADO', 'COMPRADO', 'RECIBIDO'].includes(s.status))
            .reduce((sum, s) => sum + s._count._all, 0)

        return NextResponse.json({ total, totalAmount, pending, approved })
    } catch (error) {
        console.error('[PURCHASES_STATS_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
