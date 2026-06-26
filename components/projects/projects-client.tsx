'use client'

import { useQuery } from '@tanstack/react-query'
import { ProjectTable } from './project-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Home, Plus, RefreshCw } from 'lucide-react'
import { MotionWrapper } from '@/components/ui/motion-wrapper'
import { CompactUserMenu } from '@/components/ui/compact-user-menu'

interface ProjectsClientProps {
    initialData: Record<string, unknown>[]
    user: { role?: string; name?: string } | null
}

export function ProjectsClient({ initialData, user }: ProjectsClientProps) {
    const { data: projectsResponse, refetch, isFetching } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await fetch('/api/projects')
            if (!res.ok) throw new Error('Failed to fetch projects')
            const json = await res.json()
            return json.data ?? json
        },
        initialData: initialData,
        refetchOnWindowFocus: true
    })

    const projects = Array.isArray(projectsResponse) ? projectsResponse : (projectsResponse?.data ?? projectsResponse ?? [])

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 min-h-screen">
            <MotionWrapper direction="down">
                <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-6 sm:p-8 mb-2">

                    {/* Compact user menu - top right */}
                    <div className="absolute top-4 right-4 z-20">
                        {user && <CompactUserMenu userName={user.name || 'Usuario'} />}
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1 flex-1">
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                                Portafolio de <span className="text-[#1CB7BE]">Proyectos</span>
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 font-semibold max-w-2xl leading-relaxed text-base sm:text-lg text-pretty">
                                Gestión estratégica y monitoreo de la cartera de proyectos tecnológicos IEQ 2026.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                            {user?.role === 'SISTEMAS' && (
                                <Link href="/projects/nuevo">
                                    <Button className="bg-[#1CB7BE] hover:bg-[#177388] text-white font-bold shadow-sm transition-all h-11 px-6">
                                        <Plus className="mr-2 h-5 w-5" /> Nuevo Proyecto
                                    </Button>
                                </Link>
                            )}
                            <Link href="/dashboard">
                                <Button variant="outline" className="glass-card border-slate-200 hover:bg-white/50 text-slate-700 font-bold transition-all shadow-sm h-11 px-6">
                                    <Home className="mr-2 h-4 w-4" /> Dashboard
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => refetch()}
                                disabled={isFetching}
                                className="text-slate-500 hover:text-[#1CB7BE] hover:bg-white/30 rounded-xl h-11 w-11"
                                title="Actualizar proyectos"
                            >
                                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>
            </MotionWrapper>

            <div className="relative z-10">
                <MotionWrapper direction="up" delay={0.2}>
                    <ProjectTable projects={projects} />
                </MotionWrapper>
            </div>
        </div>
    )
}
