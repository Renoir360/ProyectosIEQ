'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Project, ProjectStatus } from '@prisma/client'
import { ArrowRight } from 'lucide-react'

import { motion } from 'framer-motion'
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_COLOR, ProjectStatus as ProjectStatusType } from '@/lib/status'

// Extended type with stats
interface ProjectWithStats extends Project {
    _count: { tasks: number }
    tasks: { status: string }[]
}

export function ProjectCard({ project }: { project: ProjectWithStats }) {
    const total = project._count.tasks
    const done = project.tasks.filter(t => t.status === 'DONE').length

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card rounded-xl shadow-md transition-all duration-300 hover:glass-card-hover group overflow-hidden"
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">{project.name}</h3>
                    <Badge variant="outline" className={`${PROJECT_STATUS_COLOR[project.status as ProjectStatusType]} text-[10px] font-bold uppercase tracking-widest px-2 py-0.5`}>
                        {PROJECT_STATUS_LABEL[project.status as ProjectStatusType]}
                    </Badge>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mb-6">
                    {project.description || 'Sin descripción'}
                </p>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter text-slate-400">
                        <span>Progreso General</span>
                        <span className="text-[#1CB7BE]">{project.progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="progress-bar-fill"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold">
                    <div className="text-slate-400 uppercase tracking-tighter">
                        <span className="text-slate-700">{done}</span> / {total} Hitos
                    </div>
                    <Link
                        href={`/projects/${project.id}`}
                        className="flex items-center text-[#1CB7BE] hover:text-[#177388] transition-colors group-hover:translate-x-1 duration-300"
                    >
                        Gestionar <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}
