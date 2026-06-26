import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ProjectsClient } from '@/components/projects/projects-client'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
    const user = await getCurrentUser()

    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return (
        <ProjectsClient
            initialData={projects}
            user={user}
        />
    )
}
