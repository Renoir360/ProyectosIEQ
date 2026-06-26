import { logError } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { updatePurchaseRequestSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/purchases/[id]
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const purchase = await prisma.purchaseRequest.findUnique({
            where: { id },
            include: {
                project: {
                    select: { id: true, name: true }
                }
            }
        })

        if (!purchase) {
            return new NextResponse('Purchase request not found', { status: 404 })
        }

        return NextResponse.json(purchase)
    } catch (error) {
        logError('PURCHASE_GET', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

// PATCH /api/purchases/[id]
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) return new NextResponse("Unauthorized", { status: 401 })

        const { id } = await params
        const body = await request.json()
        const result = updatePurchaseRequestSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(result.error.flatten(), { status: 400 })
        }

        const updateData = { ...result.data }

        // Obtener estado original antes de actualizar para auditoría y comparación
        const currentPurchase = await prisma.purchaseRequest.findUnique({
            where: { id },
            select: { status: true, title: true, projectId: true, estimatedAmount: true, justification: true }
        })

        if (!currentPurchase) {
            return new NextResponse('Purchase request not found', { status: 404 })
        }

        // RBAC Logic
        if (user.role !== 'SISTEMAS') {
            if (user.role === 'PRESIDENCIA') {
                // Check if only updating status and optional rejection comments
                const allowedKeys = ['status', 'rejectionComments']
                const keys = Object.keys(updateData)
                const hasUnauthorizedKeys = keys.some(key => !allowedKeys.includes(key))

                if (hasUnauthorizedKeys) {
                    return new NextResponse("Forbidden: Presidencia can only update status", { status: 403 })
                }
            } else {
                return new NextResponse("Forbidden", { status: 403 })
            }
        }

        // If status is being changed to APROBADO, automatically clear the PDF link
        if (updateData.status === 'APROBADO') {
            updateData.vendorLink = null
        }

        const purchase = await prisma.purchaseRequest.update({
            where: { id },
            data: updateData,
            include: {
                project: {
                    select: { id: true, name: true }
                }
            }
        })

        // Registrar auditoría
        try {
            const { logAuditEvent } = await import('@/lib/audit')
            if (updateData.status && updateData.status !== currentPurchase.status) {
                await logAuditEvent(
                    purchase.projectId,
                    'CAMBIO_ESTADO_COMPRA',
                    `Se cambió el estado de la compra "${currentPurchase.title}" de "${currentPurchase.status}" a "${updateData.status}" por ${user.name}`
                )
            } else {
                await logAuditEvent(
                    purchase.projectId,
                    'ACTUALIZACION_COMPRA',
                    `Se actualizaron los datos de la compra "${currentPurchase.title}" por ${user.name}`
                )
            }
        } catch (auditErr) {
            logError('error', auditErr)
        }

        // Notificar a Sistemas si Presidencia aprobó o rechazó la compra
        if (user.role === 'PRESIDENCIA' && updateData.status && updateData.status !== currentPurchase.status) {
            const type = updateData.status === 'APROBADO' ? 'APPROVED' : (updateData.status === 'RECHAZADO' ? 'REJECTED' : null)
            if (type) {
                try {
                    const { sendPurchaseEmail } = await import('@/lib/email')
                    await sendPurchaseEmail(
                        {
                            id: purchase.id,
                            title: purchase.title,
                            estimatedAmount: purchase.estimatedAmount,
                            justification: purchase.justification,
                            project: purchase.project,
                            rejectionComments: purchase.rejectionComments
                        },
                        type,
                        'sistemas@clinicaieq.com',
                        'Sistemas IEQ'
                    )
                } catch (mailErr) {
                    logError('error', mailErr)
                }
            }
        }

        // Revalidate pages where this purchase request appears
        revalidatePath('/compras')

        return NextResponse.json(purchase)
    } catch (error) {
        logError('PURCHASE_PATCH', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'SISTEMAS') {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const { id } = await params
        await prisma.purchaseRequest.delete({ where: { id } })

        revalidatePath('/compras')
        return NextResponse.json({ success: true })
    } catch (error) {
        logError('PURCHASE_DELETE', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
