import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getDepartmentWhere } from '@/lib/department'
import { cookies } from 'next/headers'
import { ProjectsClient } from '@/components/projects/projects-client'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
    const user = await getCurrentUser()
    const cookieStore = await cookies()
    const selectedDept = cookieStore.get('selected_department')?.value

    const where: any = user ? getDepartmentWhere(user as any, selectedDept) : {}

    const projects = await prisma.project.findMany({
        where, // Apply filter
        orderBy: { createdAt: 'desc' },
    })

    return (
        <ProjectsClient 
            initialData={projects} 
            user={user} 
            selectedDept={selectedDept} 
        />
    )
}
