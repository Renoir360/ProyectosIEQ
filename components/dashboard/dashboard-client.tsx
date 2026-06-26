'use client'

import { lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { KPICards } from './kpi-cards'
import { UpcomingTasksList } from './upcoming-tasks'
import { CriticalTasksList } from './critical-tasks'
import { EmptyState } from './empty-state'
import { LayoutGrid, Receipt, Plus, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CompactUserMenu } from '@/components/ui/compact-user-menu'
import { MotionWrapper, StaggerContainer, StaggerItem } from '../ui/motion-wrapper'

const StatusChart = lazy(() => import('./charts').then(m => ({ default: m.StatusChart })))
const ProgressChart = lazy(() => import('./charts').then(m => ({ default: m.ProgressChart })))

function ChartSkeleton() {
    return <div className="glass-card rounded-xl h-[340px] animate-pulse bg-slate-200/30" />
}

interface DashboardUser {
    userId: string
    role: string
    name?: string
    department: string
}

interface DashboardData {
    topStats: { totalProjects: number; totalAreas: number; totalTasks: number; globalProgress: number }
    projectsData: { name: string; progress: number; done: number; total: number }[]
    statusData: { name: string; value: number; fill: string }[]
    upcomingTasks: unknown[]
    criticalTasks: unknown[]
}

interface DashboardClientProps {
    initialData: DashboardData
    user: DashboardUser | null
}

export function DashboardClient({ initialData, user }: DashboardClientProps) {
    const { data, refetch, isFetching } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await fetch('/api/dashboard')
            if (!res.ok) throw new Error('Network response was not ok')
            return res.json()
        },
        initialData: initialData,
        refetchOnWindowFocus: true
    })

    if (!data || data.topStats.totalProjects === 0) {
        return <EmptyState />
    }

    return (
        <div className="min-h-screen">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
                <MotionWrapper direction="down">
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-700 mb-2">
                        <div className="absolute top-4 right-4 z-20">
                            {user && <CompactUserMenu userName={user.name || 'Usuario'} />}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex-1">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-slate-100 leading-tight">
                                    Clínica IEQ <span className="text-[#1CB7BE]">WorkCenter</span>
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium text-base sm:text-lg mb-4">
                                    Visualiza el avance estratégico y hitos críticos de la transformación tecnológica de Clínica IEQ.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {user?.role === 'SISTEMAS' && (
                                        <Link href="/projects/nuevo">
                                            <Button className="bg-[#1CB7BE] hover:bg-[#177388] text-white font-bold shadow-sm transition-all h-10 px-6">
                                                <Plus className="mr-2 h-5 w-5" /> Nuevo Proyecto
                                            </Button>
                                        </Link>
                                    )}
                                    <Link href="/projects">
                                        <Button variant="outline" className="border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all">
                                            <LayoutGrid className="mr-2 h-4 w-4" /> Proyectos
                                        </Button>
                                    </Link>
                                    <Link href="/compras">
                                        <Button variant="outline" className="border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all">
                                            <Receipt className="mr-2 h-4 w-4" /> Compras
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => refetch()}
                                        disabled={isFetching}
                                        className="text-slate-500 hover:text-[#1CB7BE] hover:bg-white/30 rounded-xl"
                                        title="Actualizar datos"
                                        aria-label="Actualizar datos del dashboard"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                                    </Button>
                                    <span className="sr-only" aria-live="polite">
                                        {isFetching ? 'Actualizando datos...' : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <img
                                    src="/logo-ieq.png"
                                    alt="Logo IEQ"
                                    className="h-20 sm:h-28 md:h-36 w-auto object-contain pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>
                </MotionWrapper>

                <KPICards stats={data.topStats} />

                <div className="relative z-10 space-y-6 sm:space-y-8">
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" delayChildren={0.6}>
                        <StaggerItem className="md:col-span-2 lg:col-span-2 space-y-6 sm:space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Suspense fallback={<ChartSkeleton />}>
                                    <StatusChart data={data.statusData} />
                                </Suspense>
                                <Suspense fallback={<ChartSkeleton />}>
                                    <ProgressChart data={data.projectsData} />
                                </Suspense>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 ml-2">
                                    <div className="w-1 h-6 bg-[#1CB7BE] rounded-full" />
                                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight uppercase text-sm">Próximos Pendientes (7 días)</h2>
                                </div>
                                <UpcomingTasksList tasks={data.upcomingTasks} />
                            </div>
                        </StaggerItem>

                        <StaggerItem className="space-y-4">
                            <div className="flex items-center gap-3 ml-2">
                                <div className="w-1 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight uppercase text-sm">Top 5 Tareas Críticas</h2>
                            </div>
                            <CriticalTasksList tasks={data.criticalTasks} />
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </div>
        </div>
    )
}
