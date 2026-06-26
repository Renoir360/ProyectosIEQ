'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Layers, CheckSquare, Activity, Info, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { StaggerContainer, StaggerItem } from '../ui/motion-wrapper'

interface Stats {
    totalProjects: number
    totalAreas: number
    totalTasks: number
    globalProgress: number
}

function StatCard({ title, value, subtext, icon: Icon, tooltip, href }: { title: string, value: string | number, subtext: string, icon: any, tooltip: string, href?: string }) {
    return (
        <StaggerItem>
            <div className={`glass-card rounded-xl p-6 hover:glass-card-hover transition-all duration-300 relative group`}>
                {/* Whole Card Link Overlay - sibling to action button to avoid nesting <a> */}
                {href && (
                    <Link href={href} className="absolute inset-0 z-0 rounded-xl" aria-label={title} />
                )}

                <div className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10 pointer-events-none">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs bg-primary text-primary-foreground border-none px-3 py-1.5 shadow-xl">
                                    <p>{tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Icon className={`h-5 w-5 ${href ? 'text-[#1CB7BE] group-hover:scale-110 transition-transform' : 'text-slate-400'}`} />
                    </div>
                </div>
                <div className="relative z-10 pointer-events-none">
                    <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">{subtext}</p>
                </div>
            </div>
        </StaggerItem>
    )
}

export function KPICards({ stats }: { stats: Stats }) {
    return (
        <StaggerContainer className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Proyectos"
                value={stats.totalProjects}
                subtext="Cartera activa"
                icon={FolderKanban}
                tooltip="Cantidad total de proyectos registrados."
                href="/projects"
            />
            <StatCard
                title="Áreas"
                value={stats.totalAreas}
                subtext="Cobertura IT"
                icon={Layers}
                tooltip="Departamentos y unidades de negocio con iniciativas tecnológicas en curso."
            />
            <StatCard
                title="Tareas"
                value={stats.totalTasks}
                subtext="Hitos totales"
                icon={CheckSquare}
                tooltip="Volumen total de tareas y entregables bajo seguimiento."
            />
            <StatCard
                title="Progreso"
                value={`${stats.globalProgress}%`}
                subtext="Nivel de avance"
                icon={Activity}
                tooltip="Promedio del progreso de todos los proyectos activos."
            />
        </StaggerContainer>
    )
}
