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
import { DepartmentSelector } from '@/components/layout/department-selector'
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
    selectedDept?: string
}

export function DashboardClient({ initialData, user, selectedDept }: DashboardClientProps) {
    // TanStack Query with client-side caching and background synchronization
    const { data, refetch, isFetching } = useQuery({
        queryKey: ['dashboard', selectedDept],
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
                    <div className="relative overflow-hidden glass-card !bg-white/5 text-slate-900 rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl border border-white/40 mb-2">
                        {/* Compact user menu - top right */}
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                            {user?.role === 'PRESIDENCIA' && (
                                <DepartmentSelector currentDept={selectedDept} userRole={user.role} />
                            )}
                            {user && <CompactUserMenu userName={user.name || 'Usuario'} />}
                        </div>

                        {/* Internal decorative blobs for depth */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1CB7BE]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex-1">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-slate-900 leading-tight">
                                    Clínica IEQ <span className="text-[#1CB7BE] relative">WorkCenter
                                        <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#1CB7BE]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                                        </svg>
                                    </span>
                                </h1>
                                <p className="text-slate-600 max-w-2xl leading-relaxed font-medium text-base sm:text-lg mb-4">
                                    Visualiza el avance estratégico y hitos críticos de la transformación tecnológica de Clínica IEQ.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {user?.role === 'SISTEMAS' && (
                                        <Link href="/projects/nuevo">
                                            <Button className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold shadow-lg hover:shadow-xl transition-all h-10 px-6">
                                                <Plus className="mr-2 h-5 w-5" /> Nuevo Proyecto
                                            </Button>
                                        </Link>
                                    )}
                                    <Link href="/projects">
                                        <Button variant="outline" className="glass-card border-slate-200 hover:bg-white/50 text-slate-700 font-bold transition-all shadow-sm">
                                            <LayoutGrid className="mr-2 h-4 w-4" /> Proyectos
                                        </Button>
                                    </Link>
                                    <Link href="/compras">
                                        <Button variant="outline" className="glass-card border-slate-200 hover:bg-white/50 text-slate-700 font-bold transition-all shadow-sm">
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
                            <div className="flex-shrink-0 relative">
                                <div className="absolute inset-0 bg-[#1CB7BE]/10 blur-3xl rounded-full" />
                                <img
                                    src="/logo-ieq.png"
                                    alt="Logo IEQ"
                                    className="relative h-20 sm:h-28 md:h-36 w-auto object-contain transition-all hover:scale-105 duration-700 pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>
                </MotionWrapper>

                <div className="relative">
                    {/* Decorative element for depth */}
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#1CB7BE]/5 rounded-full blur-[80px]" />
                    <KPICards stats={data.topStats} />
                </div>

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
                                    <div className="w-1 h-6 bg-[#1CB7BE] rounded-full shadow-[0_0_10px_rgba(28,183,190,0.5)]" />
                                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight uppercase text-sm">Próximos Pendientes (7 días)</h2>
                                </div>
                                <UpcomingTasksList tasks={data.upcomingTasks} />
                            </div>
                        </StaggerItem>

                        <StaggerItem className="space-y-4">
                            <div className="flex items-center gap-3 ml-2">
                                <div className="w-1 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight uppercase text-sm">Top 5 Tareas Críticas</h2>
                            </div>
                            <CriticalTasksList tasks={data.criticalTasks} />
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </div>
        </div>
    )
}
