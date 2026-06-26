'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { ExternalLink, FileText, StickyNote, Loader2, MessageCircle } from 'lucide-react'
import { TaskDetailDialog } from './task-detail-dialog'
import { useToast } from '@/hooks/use-toast'
import {
    TASK_STATUS_LABEL,
    TASK_STATUS_COLOR,
    TASK_PRIORITY_LABEL,
    TASK_PRIORITY_COLOR,
    TaskStatus,
    TaskPriority
} from '@/lib/status'
import { TaskDetails } from '@/lib/validators'

type Evidence = {
    id: string
    type: 'LINK' | 'NOTE' | 'PHOTO'
    url: string | null
    notes: string | null
    uploadedBy?: string | null
}

export type TaskWithEvidence = {
    id: string
    title: string
    summary: string | null
    description: string
    detailsJson: TaskDetails
    dependencyNotes: string | null
    status: TaskStatus
    priority: TaskPriority
    responsible: string | null
    dueDate: string | Date | null
    acceptanceCriteria: string | null
    areaId: string | null
    createdAt: string | Date
    evidences: Evidence[]
    projectId: string
}

import { motion } from 'framer-motion'

export function TaskList({ tasks, areas = [], userRole }: { tasks: TaskWithEvidence[], areas?: { id: string; name: string }[], userRole?: string }) {
    const router = useRouter()
    const { toast } = useToast()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false)
    const [selectedTaskForEvidence, setSelectedTaskForEvidence] = useState<string | null>(null)
    const [evidenceType, setEvidenceType] = useState<'LINK' | 'NOTE' | 'FILE'>('NOTE')
    const [evidenceUrl, setEvidenceUrl] = useState('')
    const [evidenceNotes, setEvidenceNotes] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    async function handleStatusChange(taskId: string, newStatus: string) {
        updateTask(taskId, { status: newStatus })
    }

    async function addEvidence() {
        if (!selectedTaskForEvidence) return

        try {
            if (evidenceType === 'FILE') {
                if (!selectedFile) {
                    alert('Por favor selecciona un archivo.')
                    return
                }
                setIsUploading(true)
                const formData = new FormData()
                formData.append('file', selectedFile)

                const res = await fetch(`/api/tasks/${selectedTaskForEvidence}/upload-evidence`, {
                    method: 'POST',
                    body: formData
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Error en subida de archivo')
            } else {
                const res = await fetch(`/api/tasks/${selectedTaskForEvidence}/evidence`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: evidenceType,
                        url: evidenceType === 'LINK' ? evidenceUrl : undefined,
                        notes: evidenceType === 'NOTE' ? evidenceNotes : undefined
                    })
                })

                if (!res.ok) throw new Error('Failed to add evidence')
            }

            toast({
                title: 'Evidencia agregada',
                description: 'Se registró la evidencia correctamente.'
            })
            setEvidenceDialogOpen(false)
            setEvidenceUrl('')
            setEvidenceNotes('')
            setSelectedFile(null)
            setSelectedTaskForEvidence(null)
            router.refresh()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al agregar evidencia'
            toast({ variant: 'destructive', title: 'Error', description: message })
        } finally {
            setIsUploading(false)
        }
    }

    async function updateTask(taskId: string, data: Record<string, unknown>) {
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
            console.error(error)
            const message = error instanceof Error ? error.message : 'Error al actualizar tarea'
            toast({ variant: 'destructive', title: 'Error', description: message })
        } finally {
            setLoadingId(null)
        }
    }

    const shareTaskOnWhatsApp = (task: TaskWithEvidence) => {
        const statusLabel = TASK_STATUS_LABEL[task.status]
        const priorityLabel = TASK_PRIORITY_LABEL[task.priority]
        const link = `https://proyectos-ieq.vercel.app/projects/${task.projectId}`
        
        const text = `📢 *Reporte de Tarea: ${task.title}*\n` +
            `• *Estado:* ${statusLabel}\n` +
            `• *Prioridad:* ${priorityLabel}\n` +
            `• *Responsable:* ${task.responsible || 'No asignado'}\n` +
            `• *Límite:* ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : 'Sin fecha'}\n\n` +
            `Ver más detalles en el panel: ${link}`
            
        const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(waUrl, '_blank')
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center p-8 text-slate-500 bg-white border rounded">
                No hay tareas en esta sección.
            </div>
        )
    }

    return (
        <>
            <div className="glass-card rounded-xl shadow-md transition-all overflow-hidden border-none text-slate-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[35%]">Tarea</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Responsable</TableHead>
                            <TableHead>Fecha Límite</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task, index) => (
                            <motion.tr
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.3)", x: 4 }}
                                className="border-b transition-colors"
                            >
                                <TableCell>
                                    <div className="font-medium">{task.title}</div>
                                    <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                        {task.summary || 'Sin resumen'}
                                    </div>
                                    {task.dependencyNotes && (
                                        <div className="text-[10px] text-amber-600 flex items-center mt-1 font-medium bg-amber-50 px-1.5 py-0.5 rounded w-fit">
                                            <StickyNote className="h-3 w-3 mr-1" />
                                            Pendiente
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`${TASK_PRIORITY_COLOR[task.priority]} text-[10px] px-2 py-0`}>
                                        {TASK_PRIORITY_LABEL[task.priority]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        disabled={loadingId === task.id || userRole !== 'SISTEMAS'}
                                        onValueChange={(val) => handleStatusChange(task.id, val)}
                                        defaultValue={task.status}
                                    >
                                        <SelectTrigger className={`w-[140px] h-9 text-white text-[11px] font-bold uppercase tracking-wider rounded-full border-none shadow-sm ${TASK_STATUS_COLOR[task.status]} transition-all hover:scale-105 active:scale-95`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BACKLOG">{TASK_STATUS_LABEL.BACKLOG}</SelectItem>
                                            <SelectItem value="READY">{TASK_STATUS_LABEL.READY}</SelectItem>
                                            <SelectItem value="IN_PROGRESS">{TASK_STATUS_LABEL.IN_PROGRESS}</SelectItem>
                                            <SelectItem value="DONE">{TASK_STATUS_LABEL.DONE}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {task.responsible || '-'}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <div className="flex justify-end items-center gap-2">
                                        <TaskDetailDialog task={task} onUpdate={updateTask} areas={areas} readOnly={userRole !== 'SISTEMAS'} />

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                            title="Compartir por WhatsApp"
                                            onClick={() => shareTaskOnWhatsApp(task)}
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                        </Button>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon" className="h-8 w-8" title="Evidencias">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl bg-white">
                                                <DialogHeader>
                                                    <DialogTitle>Evidencias: {task.title}</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-4 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-sm font-semibold">Evidencias ({task.evidences.length})</Label>
                                                        {userRole === 'SISTEMAS' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedTaskForEvidence(task.id)
                                                                    setEvidenceDialogOpen(true)
                                                                }}
                                                            >
                                                                Agregar Evidencia
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        {task.evidences.length > 0 ? (
                                                            task.evidences.map((e) => (
                                                                <div key={e.id} className="text-sm border p-3 rounded flex flex-col gap-2 bg-white">
                                                                    <div className="flex items-center gap-2">
                                                                        {e.type === 'PHOTO' ? (
                                                                            <FileText className="h-4 w-4 text-teal-600" />
                                                                        ) : e.type === 'LINK' ? (
                                                                            <ExternalLink className="h-4 w-4 text-blue-600" />
                                                                        ) : (
                                                                            <StickyNote className="h-4 w-4 text-slate-600" />
                                                                        )}
                                                                        {e.url ? (
                                                                            <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate flex-1 font-medium">
                                                                                {e.notes || e.url}
                                                                            </a>
                                                                        ) : (
                                                                            <span className="flex-1 font-medium text-slate-700">{e.notes}</span>
                                                                        )}
                                                                        {e.uploadedBy && (
                                                                            <Badge variant="outline" className="text-[9px] text-slate-400">
                                                                                {e.uploadedBy}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    {e.type === 'PHOTO' && e.url && (
                                                                        <div className="mt-1 h-24 w-fit overflow-hidden rounded border bg-slate-50">
                                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                            <img src={e.url} alt="Evidencia física" className="h-full object-contain mx-auto max-h-[90px]" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded border">
                                                                Sin evidencias. Agrega al menos una para poder marcar como Completado.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Evidence Dialog */}
            <Dialog open={evidenceDialogOpen} onOpenChange={(val) => {
                setEvidenceDialogOpen(val)
                if (!val) {
                    setSelectedFile(null)
                    setEvidenceUrl('')
                    setEvidenceNotes('')
                }
            }}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Agregar Evidencia</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="text-slate-500 font-semibold text-xs uppercase">Tipo de Evidencia</Label>
                            <Select value={evidenceType} onValueChange={(val: 'LINK' | 'NOTE' | 'FILE') => setEvidenceType(val)}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="NOTE">📝 Nota / Bitácora</SelectItem>
                                    <SelectItem value="LINK">🔗 Enlace Externo</SelectItem>
                                    <SelectItem value="FILE">📁 Archivo Físico (Foto / PDF)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {evidenceType === 'LINK' && (
                            <div className="space-y-1">
                                <Label htmlFor="url" className="text-slate-500 font-semibold text-xs uppercase">URL</Label>
                                <Input
                                    id="url"
                                    type="url"
                                    value={evidenceUrl}
                                    onChange={(e) => setEvidenceUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="bg-white"
                                />
                            </div>
                        )}

                        {evidenceType === 'NOTE' && (
                            <div className="space-y-1">
                                <Label htmlFor="notes" className="text-slate-500 font-semibold text-xs uppercase">Notas / Comentario</Label>
                                <Textarea
                                    id="notes"
                                    value={evidenceNotes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEvidenceNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Describe la evidencia del avance..."
                                    className="bg-white"
                                />
                            </div>
                        )}

                        {evidenceType === 'FILE' && (
                            <div className="space-y-2">
                                <Label className="text-slate-500 font-semibold text-xs uppercase">Cargar Archivo</Label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative cursor-pointer bg-slate-50/50">
                                    <input 
                                        type="file" 
                                        id="evidence-file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) setSelectedFile(file)
                                        }}
                                        disabled={isUploading}
                                    />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-700">
                                            {selectedFile ? selectedFile.name : 'Seleccionar o arrastrar archivo'}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Soporte para Imágenes y PDFs'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setEvidenceDialogOpen(false)} disabled={isUploading}>Cancelar</Button>
                        <Button onClick={addEvidence} disabled={isUploading} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin animate-infinite" />
                                    Subiendo...
                                </>
                            ) : (
                                'Agregar Evidencia'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
