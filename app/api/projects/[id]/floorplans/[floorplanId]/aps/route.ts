import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// POST: Crear un nuevo Access Point
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string, floorplanId: string }> }) {
    const { floorplanId } = await params
    const data = await req.json()
    const ap = await prisma.accessPointPlacement.create({
        data: { floorplanId: floorplanId, ...data }
    })
    return NextResponse.json(ap)
}

// PATCH: Actualizar ubicación (coordenadas x, y) o detalles (canal, banda, cobertura, etc.)
export async function PATCH(req: NextRequest) {
    try {
        const { id, ...data } = await req.json()
        if (!id) {
            return NextResponse.json({ error: 'Falta ID del AP' }, { status: 400 })
        }
        const ap = await prisma.accessPointPlacement.update({
            where: { id },
            data
        })
        return NextResponse.json(ap)
    } catch (error: unknown) {
        logError('error', error)
        return NextResponse.json({ error: 'Error al actualizar AP' }, { status: 500 })
    }
}

// DELETE: Eliminar un Access Point
export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json()
        if (!id) {
            return NextResponse.json({ error: 'Falta ID del AP' }, { status: 400 })
        }
        await prisma.accessPointPlacement.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        logError('error', error)
        return NextResponse.json({ error: 'Error al eliminar AP' }, { status: 500 })
    }
}
