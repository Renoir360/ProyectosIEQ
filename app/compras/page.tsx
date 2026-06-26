import prisma from '@/lib/db'
import { PurchaseTable } from '@/components/purchases/purchase-table'
import { PurchaseFilters } from '@/components/purchases/purchase-filters'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Home, Plus } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion-wrapper'
import { getCurrentUser } from '@/lib/auth'
import { PurchaseStatsCards } from '@/components/purchases/purchase-stats-cards'
import { PageHeader } from '@/components/layout/page-header'
import { getDepartmentWhere } from '@/lib/department'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

type SearchParams = {
    type?: string
    status?: string
    projectId?: string
    page?: string
}

export default async function ComprasPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const user = await getCurrentUser()
    const cookieStore = await cookies()
    const selectedDept = cookieStore.get('selected_department')?.value
    const deptWhere: any = user ? getDepartmentWhere(user as any, selectedDept) : {}

    const page = parseInt(params.page || '1')
    const limit = 10
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { ...deptWhere } // Start with dept filter (Wait, PurchaseRequest needs project filter or something?)
    // PurchaseRequest has `project` relation. Schema doesn't have department on PurchaseRequest directly.
    // It has `projectId` -> `project`.
    // So if Department filter is { department: '...' }, we need { project: { department: '...' } }

    // Check key in deptWhere
    if (deptWhere.department) {
        where.project = { department: deptWhere.department }
        delete where.department // Remove top level if invalid
    }

    if (params.type && params.type !== 'ALL') where.type = params.type
    if (params.status && params.status !== 'ALL') where.status = params.status
    if (params.projectId && params.projectId !== 'ALL') where.projectId = params.projectId

    const [purchases, total, projects] = await Promise.all([
        prisma.purchaseRequest.findMany({
            where,
            include: {
                project: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.purchaseRequest.count({ where }),
        prisma.project.findMany({
            where: deptWhere, // Use dept filter for projects list too!!
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })
    ])

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 min-h-screen">
            <PageHeader
                title={<>Solicitudes de <span className="text-[var(--color-brand,#1CB7BE)]">Compra</span></>}
                subtitle="Gestión de solicitudes de compra para el Departamento de Sistemas IEQ."
                userName={user?.name || 'Usuario'}
                userRole={user?.role}
                selectedDept={selectedDept}
                actions={
                    <>
                        <Link href="/dashboard">
                            <Button variant="outline" className="glass-card border-slate-200 hover:bg-white/50 text-slate-700 font-bold transition-all shadow-sm">
                                <Home className="mr-2 h-4 w-4" /> Dashboard
                            </Button>
                        </Link>
                        {user?.role === 'SISTEMAS' && (
                            <Link href="/compras/nueva">
                                <Button className="bg-[var(--color-brand,#1CB7BE)] hover:bg-[var(--color-brand,#1CB7BE)]/90 text-white font-bold shadow-lg">
                                    <Plus className="mr-2 h-4 w-4" /> Nueva Solicitud
                                </Button>
                            </Link>
                        )}
                    </>
                }
            />

            <div className="relative z-10 space-y-6">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#1CB7BE]/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                <StaggerContainer className="space-y-6">
                    {/* Statistics Cards */}
                    <StaggerItem>
                        <Suspense fallback={<div className="h-40" />}>
                            <PurchaseStatsCards />
                        </Suspense>
                    </StaggerItem>

                    <StaggerItem>
                        <PurchaseFilters projects={projects} />
                    </StaggerItem>

                    <StaggerItem>
                        <PurchaseTable purchases={purchases} userRole={user?.role} />
                    </StaggerItem>

                    {totalPages > 1 && (
                        <StaggerItem>
                            <div className="flex items-center justify-center gap-2">
                                {page > 1 && (
                                    <Link href={`/compras?${new URLSearchParams({ ...params, page: (page - 1).toString() }).toString()}`}>
                                        <Button variant="outline" className="glass-card">
                                            Anterior
                                        </Button>
                                    </Link>
                                )}
                                <span className="text-sm text-slate-600 font-medium px-4">
                                    Página {page} de {totalPages}
                                </span>
                                {page < totalPages && (
                                    <Link href={`/compras?${new URLSearchParams({ ...params, page: (page + 1).toString() }).toString()}`}>
                                        <Button variant="outline" className="glass-card">
                                            Siguiente
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </StaggerItem>
                    )}
                </StaggerContainer>
            </div>
        </div>
    )
}
