import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
    console.log('Iniciando migración de detalles de tareas...')

    const tasks = await prisma.task.findMany()

    console.log(`Analizando ${tasks.length} tareas...`)

    for (const task of tasks) {
        // Idempotencia: Saltar si ya tiene detalles (excepto si son null/undefined)
        if (task.detailsJson && typeof task.detailsJson === 'object' && Object.keys(task.detailsJson).length > 0) {
            console.log(`- Saltando: ${task.title} (ya migrada)`)
            continue
        }
        const desc = task.description || ''

        // 1. Generar Summary
        // Limpiar markdown básico y tomar primera línea útil
        const cleanText = desc
            .replace(/[*#_\[\]\-]/g, '') // Quitar caracteres markdown
            .replace(/\s+/g, ' ') // Normalizar espacios
            .trim()

        const summary = cleanText.length > 120
            ? cleanText.substring(0, 117) + '...'
            : cleanText || task.title

        // 2. Parsear Details
        const details: { diagnostico: string[]; pasos: string[]; entregables: string[]; notes: string } = {
            diagnostico: [],
            pasos: [],
            entregables: [],
            notes: ''
        }

        const sections = desc.split(/\n(?=[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:)/)

        let foundStructured = false

        sections.forEach((section: string) => {
            const lower = section.toLowerCase().trim()
            if (lower.startsWith('diagnóstico')) {
                details.diagnostico = parseBullets(section)
                foundStructured = true
            } else if (lower.startsWith('pasos')) {
                details.pasos = parseBullets(section)
                foundStructured = true
            } else if (lower.startsWith('entregable')) {
                details.entregables = parseBullets(section)
                foundStructured = true
            }
        })

        if (!foundStructured) {
            details.notes = desc
        }

        await prisma.task.update({
            where: { id: task.id },
            data: {
                summary,
                detailsJson: details
            }
        })

        console.log(`✓ Migrada tarea: ${task.title}`)
    }

    console.log('Migración completada.')
}

function parseBullets(text: string): string[] {
    // Quitar el encabezado (ej: "Pasos:")
    const content = text.replace(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:\s*/i, '')

    return content
        .split('\n')
        .map(line => line.replace(/^[\s\-*]*\[?[\sx]?\]?\s*/i, '').trim())
        .filter(line => line.length > 0)
}

migrate()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
