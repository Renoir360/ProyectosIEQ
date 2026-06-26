
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Seed script for WiFi 6 Project
    const wifi6ProjectId = 'cmkcpdqsq0000h5cgn1ze06ni' // WiFi 6 Project
    const uciPediatricaId = 'cmkcpe0wk000jh5cgudmsrxlu' // UCI Pediátrica

    console.log('Cleaning up UCI Pediátrica floorplans...')
    await prisma.floorplan.deleteMany({
        where: { projectId: uciPediatricaId }
    })

    console.log(`Seeding WiFi 6 data for project ${wifi6ProjectId}...`)

    // Check if floorplan exists to avoid duplicates
    let floorplan = await prisma.floorplan.findFirst({
        where: {
            projectId: wifi6ProjectId,
            name: 'Piso Central - Quirófanos y Estar Médicos'
        }
    })

    let floorplanId = floorplan?.id

    if (!floorplanId) {
        const newFloorplan = await prisma.floorplan.create({
            data: {
                projectId: wifi6ProjectId,
                name: 'Piso Central - Quirófanos y Estar Médicos',
                imageUrl: '/floorplans/wifi6-surgical.png',
                notes: 'Fase 1 WiFi 6: 3x RG-RAP2260G cubriendo Estar Médicos + Q1-Q4'
            }
        })
        floorplanId = newFloorplan.id
        console.log('Created floorplan')
    } else {
        console.log('Floorplan already exists, updating image...')
        await prisma.floorplan.update({
            where: { id: floorplanId },
            data: { imageUrl: '/floorplans/wifi6-surgical.png' }
        })
    }

    // Clear existing APs for this floorplan to ensure clean seed state
    await prisma.accessPointPlacement.deleteMany({
        where: { floorplanId: floorplanId }
    })

    await prisma.accessPointPlacement.createMany({
        data: [
            // AP 1 - Estar Médicos (5GHz amplia) - Now correctly placed
            {
                floorplanId: floorplanId!,
                name: 'AP-MED01',
                model: 'RG-RAP2260G',
                x: 0.38, y: 0.85,
                radius: 0.14,
                channel: '36',
                band: '5GHz',
                status: 'planificado',
                notes: 'Estar Médicos. RG-RAP2260G AX1800. 70m cobertura. PoE rack UCI.'
            },
            // AP 2 - Q1-Q2 (5GHz densidad) - Center Left
            {
                floorplanId: floorplanId!,
                name: 'AP-Q12-01',
                model: 'RG-RAP2260G',
                x: 0.40, y: 0.50,
                radius: 0.09,
                channel: '40',
                band: '5GHz',
                status: 'planificado',
                notes: 'Quirófano 1-2. Alta densidad médica. Montaje techo.'
            },
            // AP 3 - Q3-Q4 (5GHz penetración) - Center Right - Changed to 5GHz
            {
                floorplanId: floorplanId!,
                name: 'AP-Q34-01',
                model: 'RG-RAP2260G',
                x: 0.60, y: 0.50,
                radius: 0.10,
                channel: '48',
                band: '5GHz',
                status: 'planificado',
                notes: 'Quirófano 3-4. Penetración paredes. 50m cobertura.'
            }
        ]
    })

    // --- Floorplan 2: Emergencia Adultos ---
    console.log('Seeding Floorplan: Emergencia Adultos...')

    let floorplan2 = await prisma.floorplan.findFirst({
        where: {
            projectId: wifi6ProjectId,
            name: 'Emergencia Adultos'
        }
    })

    let floorplanId2 = floorplan2?.id

    if (!floorplanId2) {
        const newFloorplan2 = await prisma.floorplan.create({
            data: {
                projectId: wifi6ProjectId,
                name: 'Emergencia Adultos',
                imageUrl: '/floorplans/wifi6-adult-er.png',
                notes: 'Fase 1 WiFi 6: Cobertura Sala de Espera y Emergencia'
            }
        })
        floorplanId2 = newFloorplan2.id
        console.log('Created floorplan: Emergencia Adultos')
    } else {
        console.log('Floorplan Emergencia Adultos already exists, updating image...')
        await prisma.floorplan.update({
            where: { id: floorplanId2 },
            data: { imageUrl: '/floorplans/wifi6-adult-er.png' }
        })
    }

    // Clear existing APs for this floorplan
    await prisma.accessPointPlacement.deleteMany({
        where: { floorplanId: floorplanId2 }
    })

    await prisma.accessPointPlacement.createMany({
        data: [
            {
                floorplanId: floorplanId2!,
                name: 'AP-ER-ADULT01',
                model: 'RG-RAP2260G',
                x: 0.35, y: 0.25, // Estimating position based on "Emergencia Adultos" label location in top-left quadrant
                radius: 0.12,
                channel: '52',
                band: '5GHz',
                status: 'planificado',
                notes: 'Emergencia Adultos. Techo.'
            }
        ]
    })

    console.log('Seeded APs for Emergencia Adultos')


    // --- Floorplan 3: Lobby Maternidad ---
    console.log('Seeding Floorplan: Lobby Maternidad...')

    let floorplan3 = await prisma.floorplan.findFirst({
        where: {
            projectId: wifi6ProjectId,
            name: 'Lobby Maternidad'
        }
    })

    let floorplanId3 = floorplan3?.id

    if (!floorplanId3) {
        const newFloorplan3 = await prisma.floorplan.create({
            data: {
                projectId: wifi6ProjectId,
                name: 'Lobby Maternidad',
                imageUrl: '/floorplans/wifi6-maternity-lobby.png',
                notes: 'Fase 1 WiFi 6: Recepción y Sala de Espera'
            }
        })
        floorplanId3 = newFloorplan3.id
        console.log('Created floorplan: Lobby Maternidad')
    } else {
        console.log('Floorplan Lobby Maternidad already exists, updating image...')
        await prisma.floorplan.update({
            where: { id: floorplanId3 },
            data: { imageUrl: '/floorplans/wifi6-maternity-lobby.png' }
        })
    }

    // Clear existing APs for this floorplan
    await prisma.accessPointPlacement.deleteMany({
        where: { floorplanId: floorplanId3 }
    })

    await prisma.accessPointPlacement.createMany({
        data: [
            {
                floorplanId: floorplanId3!,
                name: 'AP-LOBBY-MAT01',
                model: 'RG-RAP2260G',
                x: 0.50, y: 0.45, // Moved to center/top for "Recepción y Sala de Espera"
                radius: 0.12,
                channel: '60',
                band: '5GHz',
                status: 'planificado',
                notes: 'Lobby Maternidad. Techo.'
            }
        ]
    })

    console.log('Seeded APs for Lobby Maternidad')


    // --- Project: UCI Pediátrica ---
    console.log(`Seeding data for project UCI Pediátrica (${uciPediatricaId})...`)

    // Note: We already cleaned up this project's floorplans at the start of the script.

    const newFloorplanUCI = await prisma.floorplan.create({
        data: {
            projectId: uciPediatricaId,
            name: 'Hospitalización - Pasillo B',
            imageUrl: '/floorplans/uci-pediatrica-hall-b.png',
            notes: 'Fase 1: Cobertura Pasillo B y Habitaciones adyacentes'
        }
    })
    console.log('Created floorplan: Hospitalización - Pasillo B')

    await prisma.accessPointPlacement.createMany({
        data: [
            {
                floorplanId: newFloorplanUCI.id,
                name: 'AP-UCI-HALL-B',
                model: 'RG-RAP2260G',
                x: 0.48, y: 0.50, // Adjusted slightly left
                radius: 0.12,
                channel: '100', // DFS channel example or just another 5GHz
                band: '5GHz',
                status: 'planificado',
                notes: 'Pasillo B. Cobertura habitaciones B4-B10.'
            }
        ]
    })
    console.log('Seeded AP for UCI Pediátrica')

    console.log('Seeding complete')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
