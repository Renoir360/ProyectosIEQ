import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDuplicateFloorplans() {
    console.log('🧹 Starting cleanup of duplicate floorplans...\n')

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

    let totalDeleted = 0

    // For each group, keep the oldest (first) and delete the rest
    for (const [name, plans] of Object.entries(grouped)) {
        if (plans.length > 1) {
            console.log(`📁 Processing "${name}" - ${plans.length} copies found`)
            const toKeep = plans[0] // Keep the oldest one
            const toDelete = plans.slice(1) // Delete the rest

            console.log(`  ✅ Keeping: ID ${toKeep.id} (created ${toKeep.createdAt.toISOString()})`)

            for (const duplicate of toDelete) {
                // First, delete associated access points
                const deletedAPs = await prisma.accessPointPlacement.deleteMany({
                    where: { floorplanId: duplicate.id }
                })

                // Then delete the floorplan
                await prisma.floorplan.delete({
                    where: { id: duplicate.id }
                })

                console.log(`  🗑️  Deleted: ID ${duplicate.id} (${deletedAPs.count} APs removed)`)
                totalDeleted++
            }
            console.log()
        }
    }

    if (totalDeleted > 0) {
        console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} duplicate floorplan(s)`)
    } else {
        console.log('\n✅ No duplicates found, nothing to clean up')
    }

    // Verify final state
    const finalCount = await prisma.floorplan.count({
        where: { projectId: wifi6Project.id }
    })
    console.log(`📊 Final floorplan count: ${finalCount}`)
}

cleanupDuplicateFloorplans()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
