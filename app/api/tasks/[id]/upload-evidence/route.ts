import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: taskId } = await params
        const user = await getCurrentUser()
        
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        if (!file) {
            return NextResponse.json({ error: 'No se ha subido ningún archivo' }, { status: 400 })
        }

        const MAX_SIZE = 10 * 1024 * 1024 // 10MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'El archivo excede el tamaño máximo de 10 MB' }, { status: 413 })
        }

        const ALLOWED_TYPES = ['image/', 'application/pdf']
        if (!ALLOWED_TYPES.some(t => file.type.startsWith(t))) {
            return NextResponse.json({ error: 'Tipo de archivo no permitido. Use imágenes o PDF.' }, { status: 415 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const filePath = `tasks/${taskId}/${fileName}`

        // Subir al bucket "evidences" de Supabase Storage
        const { data, error } = await supabase.storage
            .from('evidences')
            .upload(filePath, buffer, {
                contentType: file.type || 'application/octet-stream',
                upsert: true
            })

        if (error) {
            logError('error', error)
            return NextResponse.json({ error: `Error en almacenamiento: ${error.message}` }, { status: 500 })
        }

        const { data: { publicUrl } } = supabase.storage
            .from('evidences')
            .getPublicUrl(filePath)

        // Determinar tipo de evidencia
        const isImage = file.type.startsWith('image/')
        const evidenceType = isImage ? 'PHOTO' : 'LINK'

        const evidence = await prisma.evidence.create({
            data: {
                taskId,
                type: evidenceType,
                url: publicUrl,
                notes: file.name,
                uploadedBy: user?.name || 'Sistemas'
            }
        })

        // Log de auditoría
        try {
            const task = await prisma.task.findUnique({
                where: { id: taskId },
                select: { projectId: true }
            })
            
            const { logAuditEvent } = await import('@/lib/audit')
            await logAuditEvent(
                task?.projectId || null,
                'SUBIDA_EVIDENCIA',
                `El usuario ${user?.name || 'Sistemas'} subió la evidencia física "${file.name}"`
            )
        } catch (auditErr) {
            logError('error', auditErr)
        }

        return NextResponse.json(evidence)
    } catch (error: unknown) {
        logError('error', error)
        return NextResponse.json({ error: 'Error interno del servidor al procesar la subida' }, { status: 500 })
    }
}
