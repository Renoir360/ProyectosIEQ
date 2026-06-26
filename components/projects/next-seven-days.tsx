'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Task } from '@prisma/client'
import { Clock } from 'lucide-react'
import { TaskStatus, TASK_STATUS_LABEL, TASK_STATUS_COLOR } from '@/lib/status'

interface TaskWithEvidence extends Task {
    evidences: { id: string }[]
}

export function NextSevenDays({ tasks }: { tasks: TaskWithEvidence[] }) {
    if (tasks.length === 0) {
        return (
            <Card className="bg-muted/40">
                <CardHeader>
                    <CardTitle className="text-lg">Próximas Acciones (7 días)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-500">
                    No hay tareas programadas para los próximos 7 días.
                </CardContent>
            </Card>
        )
    }

    const getDaysUntil = (date: Date) => {
        const now = new Date()
        const diff = Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (diff === 0) return 'Hoy'
        if (diff === 1) return 'Mañana'
        if (diff < 0) return 'Vencida'
        return `En ${diff} días`
    }

    return (
        <Card className="bg-white shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Próximas Acciones (7 días)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {tasks.map(task => (
                    <div key={task.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-muted/40 rounded-r">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-2">{task.title}</p>
                                {task.responsible && (
                                    <p className="text-xs text-slate-500 mt-1">{task.responsible}</p>
                                )}
                            </div>
                            <Badge className={`${TASK_STATUS_COLOR[task.status as TaskStatus]} text-white text-xs shrink-0`}>
                                {TASK_STATUS_LABEL[task.status as TaskStatus]}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-medium text-blue-600">
                                {task.dueDate && getDaysUntil(task.dueDate)}
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
