'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Folder, User } from 'lucide-react'
import Link from 'next/link'
import { TASK_STATUS_LABEL, TASK_STATUS_BADGE_CLASS, TaskStatus } from '@/lib/status'

interface UpcomingTask {
    id: string
    title: string
    status: string
    responsible: string | null
    dueDate: Date | string | null
    project: { id: string; name: string }
}

export function UpcomingTasksList({ tasks }: { tasks: UpcomingTask[] }) {
    if (tasks.length === 0) {
        return (
            <Card className="bg-slate-50 border-dashed">
                <CardContent className="p-6 text-center text-slate-500">
                    No hay tareas pendientes para los próximos 7 días.
                </CardContent>
            </Card>
        )
    }


    const getDaysRemaining = (date: Date | string) => {
        const diff = new Date(date).getTime() - new Date().getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        if (days === 0) return 'Hoy'
        if (days === 1) return 'Mañana'
        if (days < 0) return 'Vencida'
        return `En ${days} días`
    }

    return (
        <div className="space-y-3">
            {tasks.map((task) => (
                <Link key={task.id} href={`/projects/${task.project.id || '#'}`}>
                    <div className="glass-card rounded-xl p-4 shadow-sm transition-all duration-300 hover:glass-card-hover group cursor-pointer border-none overflow-hidden hover:scale-[1.01]">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#1CB7BE] transition-colors leading-none tracking-tight">
                                    {task.title}
                                </h3>
                                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-500/10 rounded-full text-slate-500">
                                        <Folder className="h-3 w-3" />
                                        {task.project.name}
                                    </div>
                                    {task.responsible && (
                                        <div className="flex items-center gap-1.5 font-semibold text-slate-400">
                                            <User className="h-3 w-3" />
                                            {task.responsible}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <Badge variant="outline" className={`${TASK_STATUS_BADGE_CLASS[task.status as TaskStatus]} border-none font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 shadow-sm`}>
                                    {TASK_STATUS_LABEL[task.status as TaskStatus]}
                                </Badge>
                                <div className="mt-2.5 flex items-center justify-end gap-1.5 text-xs font-bold text-amber-600">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {task.dueDate && getDaysRemaining(task.dueDate)}
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
