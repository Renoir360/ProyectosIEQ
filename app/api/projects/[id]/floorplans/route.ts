
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const floorplans = await prisma.floorplan.findMany({
        where: { projectId: id },
        include: { accessPoints: true }
    })
    return NextResponse.json(floorplans)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: projectId } = await params
        const { name, imageUrl, notes } = await req.json()
        if (!name || !imageUrl) {
            return NextResponse.json({ error: 'Falta nombre o imagen del plano' }, { status: 400 })
        }
        const floorplan = await prisma.floorplan.create({
            data: {
                projectId,
                name,
                imageUrl,
                notes,
                scale: 1.0
            },
            include: { accessPoints: true }
        })

        try {
            const { logAuditEvent } = await import('@/lib/audit')
            await logAuditEvent(projectId, 'CREACION_PLANO', `Se subió el plano WiFi "${name}"`)
        } catch (auditErr) {
            console.error('Error al registrar auditoría de plano:', auditErr)
        }

        return NextResponse.json(floorplan)
    } catch (error: any) {
        console.error('Error al crear plano:', error)
        return NextResponse.json({ error: 'Error al crear plano' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: projectId } = await params
        const { floorplanId } = await req.json()
        if (!floorplanId) {
            return NextResponse.json({ error: 'Falta ID del plano' }, { status: 400 })
        }

        const floorplan = await prisma.floorplan.findUnique({
            where: { id: floorplanId },
            select: { name: true, projectId: true }
        })
        if (!floorplan || floorplan.projectId !== projectId) {
            return NextResponse.json({ error: 'Plano no encontrado' }, { status: 404 })
        }

        await prisma.accessPointPlacement.deleteMany({ where: { floorplanId } })
        await prisma.floorplan.delete({ where: { id: floorplanId } })

        try {
            const { logAuditEvent } = await import('@/lib/audit')
            await logAuditEvent(projectId, 'ELIMINACION_PLANO', `Se eliminó el plano WiFi "${floorplan.name}"`)
        } catch (auditErr) {
            console.error('Error al registrar auditoría:', auditErr)
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error al eliminar plano:', error)
        return NextResponse.json({ error: 'Error al eliminar plano' }, { status: 500 })
    }
}

