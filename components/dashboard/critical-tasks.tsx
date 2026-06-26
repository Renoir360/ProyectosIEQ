'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User } from 'lucide-react'
import Link from 'next/link'
import {
    TASK_STATUS_LABEL,
    TASK_STATUS_COLOR,
    TASK_PRIORITY_LABEL,
    TASK_PRIORITY_COLOR,
    TaskStatus,
    TaskPriority
} from '@/lib/status'

type CriticalTask = {
    id: string
    projectId: string
    title: string
    status: string
    priority: string
    responsible: string | null
    dueDate: Date | string | null
    project: { name: string }
    area?: { name: string } | null
}

export function CriticalTasksList({ tasks }: { tasks: CriticalTask[] }) {
    if (tasks.length === 0) {
        return (
            <Card className="bg-muted/40">
                <CardContent className="p-6 text-center text-slate-500 text-sm">
                    No hay tareas críticas en este momento.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className="glass-card rounded-xl shadow-md transition-all duration-300 hover:glass-card-hover group border-none border-l-4 overflow-hidden"
                    style={{ borderLeft: `4px solid ${task.priority === 'HIGH' ? '#ef4444' : '#fbbf24'}` }}
                >
                    <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <Link href={`/projects/${task.projectId}`} className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-[#1CB7BE] transition-colors line-clamp-2 leading-tight tracking-tight">
                                    {task.title}
                                </Link>
                                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <span className="truncate bg-slate-500/10 px-2 py-0.5 rounded-full text-slate-500">{task.project.name}</span>
                                    {task.area && <span className="opacity-40">•</span>}
                                    {task.area && <span className="truncate font-semibold">{task.area.name}</span>}
                                </div>
                            </div>
                            <Badge variant="outline" className={`${TASK_STATUS_COLOR[task.status as TaskStatus]} border-none text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 shadow-sm`}>
                                {TASK_STATUS_LABEL[task.status as TaskStatus]}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs border-t border-slate-500/10 pt-3">
                            <Badge variant="outline" className={`${TASK_PRIORITY_COLOR[task.priority as TaskPriority]} text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0 border-none`}>
                                {TASK_PRIORITY_LABEL[task.priority as TaskPriority]}
                            </Badge>
                            {task.responsible && (
                                <div className="flex items-center gap-1.5 font-bold text-slate-400 text-[10px] uppercase tracking-tighter">
                                    <User className="h-3 w-3" />
                                    <span>{task.responsible}</span>
                                </div>
                            )}
                            {task.dueDate && (
                                <div className="flex items-center gap-1.5 font-bold text-slate-500 ml-auto text-[10px]">
                                    <Clock className="h-3.5 w-3.5 text-[#1CB7BE]" />
                                    <span>{new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
