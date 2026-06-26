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

    const page = parseInt(params.page || '1')
    const limit = 10
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
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
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })
    ])

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 min-h-screen">
            <PageHeader
                title={<>Solicitudes de <span className="text-[#1CB7BE]">Compra</span></>}
                subtitle="Gestión de solicitudes de compra para el Departamento de Sistemas IEQ."
                userName={user?.name || 'Usuario'}
                userRole={user?.role}
                actions={
                    <>
                        <Link href="/dashboard">
                            <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-all">
                                <Home className="mr-2 h-4 w-4" /> Dashboard
                            </Button>
                        </Link>
                        {user?.role === 'SISTEMAS' && (
                            <Link href="/compras/nueva">
                                <Button className="bg-[#1CB7BE] hover:bg-[#177388] text-white font-bold shadow-sm">
                                    <Plus className="mr-2 h-4 w-4" /> Nueva Solicitud
                                </Button>
                            </Link>
                        )}
                    </>
                }
            />

            <div className="space-y-6">
                <StaggerContainer className="space-y-6">
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
                                        <Button variant="outline">Anterior</Button>
                                    </Link>
                                )}
                                <span className="text-sm text-slate-600 font-medium px-4">
                                    Página {page} de {totalPages}
                                </span>
                                {page < totalPages && (
                                    <Link href={`/compras?${new URLSearchParams({ ...params, page: (page + 1).toString() }).toString()}`}>
                                        <Button variant="outline">Siguiente</Button>
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
