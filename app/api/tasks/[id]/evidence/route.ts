import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { createEvidenceSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // taskId
) {
    try {
        const { id: taskId } = await params
        const body = await request.json()
        const result = createEvidenceSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(result.error.flatten(), { status: 400 })
        }

        const evidence = await prisma.evidence.create({
            data: {
                taskId,
                type: result.data.type,
                url: result.data.url,
                notes: result.data.notes,
                uploadedBy: 'User', // Placeholder or from header
            }
        })

        return NextResponse.json(evidence)
    } catch (error) {
        console.error('[EVIDENCE_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
