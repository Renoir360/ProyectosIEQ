import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFloorplans() {
    console.log('🔍 Checking floorplans in WiFi 6 project...\n')

    // Find WiFi 6 project
    const wifi6Project = await prisma.project.findFirst({
        where: { name: 'WiFi 6' }
    })

    if (!wifi6Project) {
        console.log('❌ WiFi 6 project not found')
        return
    }

    console.log(`✅ Found WiFi 6 project (ID: ${wifi6Project.id})\n`)

    // Get all floorplans
    const floorplans = await prisma.floorplan.findMany({
        where: { projectId: wifi6Project.id },
        include: {
            _count: {
                select: { accessPoints: true }
            }
        },
        orderBy: { createdAt: 'asc' }
    })

    console.log(`📊 Total floorplans found: ${floorplans.length}\n`)

    // Group by name to find duplicates
    const grouped = floorplans.reduce((acc, fp) => {
        if (!acc[fp.name]) {
            acc[fp.name] = []
        }
        acc[fp.name].push(fp)
        return acc
    }, {} as Record<string, typeof floorplans>)

    // Display grouped results
    for (const [name, plans] of Object.entries(grouped)) {
        console.log(`📁 "${name}" - ${plans.length} occurrence(s)`)
        if (plans.length > 1) {
            console.log('  ⚠️  DUPLICATE DETECTED!')
        }
        plans.forEach((plan, idx) => {
            console.log(`    ${idx + 1}. ID: ${plan.id} | APs: ${plan._count.accessPoints} | Created: ${plan.createdAt.toISOString()}`)
        })
        console.log()
    }

    // Summary
    const duplicates = Object.entries(grouped).filter(([_, plans]) => plans.length > 1)
    if (duplicates.length > 0) {
        console.log(`\n⚠️  Found ${duplicates.length} duplicate floorplan name(s)`)
        console.log(`🔢 Total duplicate records: ${floorplans.length - Object.keys(grouped).length}`)
    } else {
        console.log('\n✅ No duplicates found')
    }
}

checkFloorplans()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
