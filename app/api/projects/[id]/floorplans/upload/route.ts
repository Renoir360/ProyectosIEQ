import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: projectId } = await params
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        
        if (!file) {
            return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Limpiar el nombre del archivo y añadir timestamp
        const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const filePath = `projects/${projectId}/${cleanName}`

        // Subir al bucket "floorplans" de Supabase Storage
        const { data, error } = await supabase.storage
            .from('floorplans')
            .upload(filePath, buffer, {
                contentType: file.type || 'image/png',
                upsert: true
            })

        if (error) {
            console.error('Error al subir plano a Supabase:', error)
            return NextResponse.json({ error: `Error de almacenamiento: ${error.message}` }, { status: 500 })
        }

        // Obtener la URL pública del plano
        const { data: { publicUrl } } = supabase.storage
            .from('floorplans')
            .getPublicUrl(filePath)

        return NextResponse.json({ publicUrl })
    } catch (error: any) {
        console.error('Error en endpoint de subida de plano:', error)
        return NextResponse.json({ error: 'Error interno del servidor al procesar el archivo' }, { status: 500 })
    }
}
