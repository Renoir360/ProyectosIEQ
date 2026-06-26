'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, Loader2, ArrowRight } from 'lucide-react'
import { TaskWithEvidence } from './task-list'
import { TaskDetailDialog } from './task-detail-dialog'
import { useToast } from '@/hooks/use-toast'
import {
    TASK_PRIORITY_LABEL,
    TASK_PRIORITY_COLOR,
    TaskStatus,
} from '@/lib/status'

interface TaskKanbanProps {
    tasks: TaskWithEvidence[]
    areas?: { id: string; name: string }[]
    userRole?: string
}

export function TaskKanban({ tasks: initialTasks, areas = [], userRole }: TaskKanbanProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [tasks, setTasks] = useState(initialTasks)
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const columns: { status: TaskStatus; label: string; bg: string; border: string; glow: string }[] = [
        { status: 'BACKLOG', label: 'Pendientes', bg: 'bg-slate-50/40 dark:bg-slate-900/40', border: 'border-slate-200/50 dark:border-slate-800/50', glow: 'shadow-slate-500/5' },
        { status: 'READY', label: 'Listas', bg: 'bg-amber-50/20 dark:bg-amber-950/10', border: 'border-amber-200/30 dark:border-amber-900/30', glow: 'shadow-amber-500/5' },
        { status: 'IN_PROGRESS', label: 'En Progreso', bg: 'bg-blue-50/20 dark:bg-blue-950/10', border: 'border-blue-200/30 dark:border-blue-900/30', glow: 'shadow-blue-500/5' },
        { status: 'DONE', label: 'Completadas', bg: 'bg-green-50/20 dark:bg-green-950/10', border: 'border-green-200/30 dark:border-green-900/30', glow: 'shadow-green-500/5' }
    ]

    const handleStatusChange = useCallback(async (taskId: string, newStatus: TaskStatus) => {
        const prevTasks = tasks
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
        setLoadingId(taskId)

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to update')
            }

            router.refresh()
        } catch (error) {
            setTasks(prevTasks)
            const message = error instanceof Error ? error.message : 'Error al actualizar estado'
            toast({ variant: 'destructive', title: 'Error', description: message })
        } finally {
            setLoadingId(null)
        }
    }, [tasks, router, toast])

    async function updateTask(taskId: string, data: Record<string, any>) {
        setLoadingId(taskId)
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to update')
            }

            router.refresh()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al actualizar tarea'
            toast({ variant: 'destructive', title: 'Error', description: message })
        } finally {
            setLoadingId(null)
        }
    }

    const onDragStart = (e: React.DragEvent, id: string) => {
        if (userRole !== 'SISTEMAS') return
        setDraggingId(id)
        e.dataTransfer.setData('text/plain', id)
        e.dataTransfer.effectAllowed = 'move'
    }

    const onDragEnd = () => setDraggingId(null)

    const onDragOver = (e: React.DragEvent) => {
        if (userRole !== 'SISTEMAS') return
        e.preventDefault()
    }

    const onDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
        if (userRole !== 'SISTEMAS') return
        e.preventDefault()
        const id = e.dataTransfer.getData('text/plain')
        if (id && draggingId === id) {
            const task = tasks.find(t => t.id === id)
            if (task && task.status !== targetStatus) {
                handleStatusChange(id, targetStatus)
            }
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px] items-start">
            {columns.map((col) => {
                const colTasks = tasks.filter(t => t.status === col.status)

                return (
                    <div
                        key={col.status}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, col.status)}
                        className={`flex flex-col h-full min-h-[500px] p-4 rounded-2xl border ${col.bg} ${col.border} ${col.glow} shadow-lg backdrop-blur-md transition-all duration-300`}
                    >
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${col.status === 'DONE' ? 'bg-green-500' : col.status === 'IN_PROGRESS' ? 'bg-blue-500' : col.status === 'READY' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                {col.label}
                            </span>
                            <Badge variant="secondary" className="bg-white/30 dark:bg-slate-800/30 text-[10px] font-bold">
                                {colTasks.length}
                            </Badge>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[550px] pr-1 scrollbar-thin">
                            {colTasks.length === 0 ? (
                                <div className="h-24 border border-dashed border-slate-300/40 dark:border-slate-700/40 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium italic">
                                    Arrastra tareas aquí
                                </div>
                            ) : (
                                colTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        draggable={userRole === 'SISTEMAS' && loadingId !== task.id}
                                        onDragStart={(e) => onDragStart(e, task.id)}
                                        onDragEnd={onDragEnd}
                                        className={`glass-card p-4 rounded-xl border border-white/20 hover:border-[#1CB7BE]/50 transition-all cursor-grab active:cursor-grabbing hover:shadow-xl group relative select-none ${
                                            draggingId === task.id ? 'opacity-35 scale-95' : 'opacity-100'
                                        } ${loadingId === task.id ? 'pointer-events-none' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="outline" className={`${TASK_PRIORITY_COLOR[task.priority]} text-[9px] px-2 py-0 border-none`}>
                                                {TASK_PRIORITY_LABEL[task.priority]}
                                            </Badge>
                                            {task.responsible && (
                                                <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                                                    <User size={10} className="text-[#1CB7BE]" />
                                                    {task.responsible.split(' ')[0]}
                                                </div>
                                            )}
                                        </div>

                                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-[#1CB7BE] transition-colors leading-tight mb-1">
                                            {task.title}
                                        </h4>
                                        {task.summary && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                                                {task.summary}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-[10px] text-slate-400 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={10} className="text-[#1CB7BE]" />
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : 'Sin fecha'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TaskDetailDialog task={task} onUpdate={updateTask} areas={areas} readOnly={userRole !== 'SISTEMAS'} />
                                            </div>
                                        </div>

                                        {userRole === 'SISTEMAS' && col.status !== 'DONE' && (
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded-md border border-slate-200">
                                                <button
                                                    onClick={() => {
                                                        const next: Record<TaskStatus, TaskStatus> = { BACKLOG: 'READY', READY: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'DONE' }
                                                        handleStatusChange(task.id, next[col.status])
                                                    }}
                                                    className="text-slate-600 hover:text-[#1CB7BE] p-0.5"
                                                    title="Avanzar"
                                                >
                                                    <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        )}

                                        {loadingId === task.id && (
                                            <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 rounded-xl flex items-center justify-center backdrop-blur-xs">
                                                <Loader2 className="animate-spin text-[#1CB7BE] h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
