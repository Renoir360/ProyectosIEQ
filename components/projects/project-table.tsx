'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Eye, Edit, MoreHorizontal, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'

type Project = {
    id: string
    name: string
    description: string | null
    budget: number | null
    status: string
    progress: number
    startDate: Date | null
    endDate: Date | null
}

const STATUS_LABELS: Record<string, { label: string, color: string }> = {
    PLANIFICADO: { label: 'Planificado', color: 'bg-slate-500/10 text-slate-700 border-slate-300' },
    EN_PROGRESO: { label: 'En Progreso', color: 'bg-blue-500/10 text-blue-700 border-blue-300' },
    PAUSADO: { label: 'Pausado', color: 'bg-amber-500/10 text-amber-700 border-amber-300' },
    COMPLETADO: { label: 'Completado', color: 'bg-green-500/10 text-green-700 border-green-300' },
}

export function ProjectTable({ projects }: { projects: Project[] }) {
    if (projects.length === 0) {
        return (
            <div className="text-center py-12 glass-card rounded-xl border border-white/20">
                <p className="text-slate-500 font-medium">No hay proyectos registrados.</p>
            </div>
        )
    }

    return (
        <div className="glass-card rounded-xl overflow-hidden border border-white/20 shadow-xl">
            {/* Desktop Table (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader className="bg-white/40">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">#</TableHead>
                            <TableHead className="font-bold text-slate-700">Título</TableHead>
                            <TableHead className="font-bold text-slate-700">Progreso</TableHead>
                            <TableHead className="font-bold text-slate-700">Presupuesto</TableHead>
                            <TableHead className="font-bold text-slate-700">Estado</TableHead>
                            <TableHead className="text-right font-bold text-slate-700">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project, index) => (
                            <TableRow key={project.id} className="hover:bg-white/30 transition-colors">
                                <TableCell className="font-medium text-slate-500">{index + 1}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">{project.name}</span>
                                        {project.startDate && (
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(project.startDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="min-w-[150px]">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-slate-600">{project.progress}%</span>
                                        </div>
                                        <Progress value={project.progress} className="h-1.5" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {project.budget ? (
                                        <span className="font-bold text-[#1CB7BE] flex items-center">
                                            <DollarSign className="h-3.5 w-3.5" />
                                            {project.budget.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">---</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={STATUS_LABELS[project.status]?.color || ''}>
                                        {STATUS_LABELS[project.status]?.label || project.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/projects/${project.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#1CB7BE] hover:bg-[#1CB7BE]/10">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-100">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards (Hidden on MD+) */}
            <div className="md:hidden space-y-4 p-4">
                {projects.map((project) => (
                    <div key={project.id} className="glass-card p-4 border border-white/20 rounded-lg shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-slate-900">{project.name}</h3>
                            <Badge variant="outline" className={STATUS_LABELS[project.status]?.color || ''}>
                                {STATUS_LABELS[project.status]?.label || project.status}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Progreso</span>
                                <span className="font-bold text-[#1CB7BE]">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-1.5" />
                        </div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Presupuesto</p>
                                <p className="font-bold text-[#1CB7BE]">
                                    ${project.budget?.toLocaleString() || '---'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/projects/${project.id}`}>
                                    <Button variant="outline" size="sm" className="h-8 border-[#1CB7BE] text-[#1CB7BE]">
                                        <Eye className="h-4 w-4 mr-1" /> Ver
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
