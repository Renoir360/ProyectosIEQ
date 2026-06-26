'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
    CheckCircle2,
    StickyNote,
    Plus,
    Trash2,
    Edit3,
    Save,
    X,
    Clock,
    User,
    Activity
} from 'lucide-react'
import { TASK_PRIORITY_LABEL, TASK_PRIORITY_COLOR, TaskPriority } from '@/lib/status'
import { TaskDetails } from '@/lib/validators'

interface ProjectMin {
    name: string
}

interface TaskWithDetails {
    id: string
    title: string
    summary: string | null
    responsible: string | null
    priority: string
    dueDate: Date | string | null
    detailsJson: TaskDetails
    dependencyNotes: string | null
    acceptanceCriteria: string | null
    areaId: string | null
    project?: ProjectMin
}

interface TaskDetailDialogProps {
    task: TaskWithDetails
    onUpdate: (taskId: string, data: Record<string, any>) => Promise<void>
    areas: { id: string; name: string }[]
    readOnly?: boolean
}

export function TaskDetailDialog({ task, onUpdate, areas, readOnly }: TaskDetailDialogProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [details, setDetails] = useState<TaskDetails>(() => {
        const d = (task.detailsJson as TaskDetails) || {}
        return {
            diagnostico: d.diagnostico || [],
            pasos: d.pasos || [],
            entregables: d.entregables || [],
            notes: d.notes || ''
        }
    })
    const [summary, setSummary] = useState(task.summary || '')
    const [responsible, setResponsible] = useState(task.responsible || '')
    const [priority, setPriority] = useState(task.priority || 'MEDIUM')
    const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '')
    const [areaId, setAreaId] = useState(task.areaId || 'none')
    const [acceptanceCriteria, setAcceptanceCriteria] = useState(task.acceptanceCriteria || '')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onUpdate(task.id, {
                summary,
                responsible,
                priority,
                areaId: areaId === 'none' ? null : areaId,
                acceptanceCriteria,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                detailsJson: details
            })
            setIsEditing(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    const addItem = (section: keyof Omit<TaskDetails, 'notes'>) => {
        setDetails((prev: TaskDetails) => ({
            ...prev,
            [section]: [...(prev[section] || []), '']
        }))
    }

    const removeItem = (section: keyof Omit<TaskDetails, 'notes'>, index: number) => {
        setDetails((prev: TaskDetails) => ({
            ...prev,
            [section]: prev[section]?.filter((_: string, i: number) => i !== index)
        }))
    }

    const updateItem = (section: keyof Omit<TaskDetails, 'notes'>, index: number, value: string) => {
        setDetails((prev: TaskDetails) => ({
            ...prev,
            [section]: prev[section]?.map((item: string, i: number) => i === index ? value : item)
        }))
    }

    return (
        <Dialog onOpenChange={(open) => { if (!open) setIsEditing(false) }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">Ver Detalle</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between pr-8 border-b pb-4">
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-bold text-slate-900">{task.title}</DialogTitle>
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                            <Badge variant="outline" className={`${TASK_PRIORITY_COLOR[task.priority as TaskPriority]} border-none px-2 py-0 h-5`}>
                                {TASK_PRIORITY_LABEL[task.priority as TaskPriority]}
                            </Badge>
                            <span className="flex items-center gap-1 text-slate-500">
                                <User className="h-3 w-3" />
                                <span className="font-semibold text-slate-700">Responsable:</span> {task.responsible || 'No asignado'}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="h-3 w-3" />
                                <span className="font-semibold text-slate-700">Entrega:</span> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : 'Sin fecha'}
                            </span>
                        </div>
                    </div>
                    {!isEditing ? (
                        !readOnly && (
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="shrink-0">
                                <Edit3 className="h-4 w-4 mr-2" />
                                Editar Tarea
                            </Button>
                        )
                    ) : (
                        <div className="flex gap-2 shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    )}
                </DialogHeader>

                <div className="py-6 space-y-8">
                    {/* Metadata Editing Section */}
                    {isEditing && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                            <div className="space-y-2">
                                <Label htmlFor="edit-priority" className="text-xs font-bold text-blue-700 uppercase">Prioridad</Label>
                                <Select value={priority} onValueChange={(val: TaskPriority) => setPriority(val)}>
                                    <SelectTrigger id="edit-priority" className="bg-white">
                                        <SelectValue placeholder="Prioridad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">{TASK_PRIORITY_LABEL.LOW}</SelectItem>
                                        <SelectItem value="MEDIUM">{TASK_PRIORITY_LABEL.MEDIUM}</SelectItem>
                                        <SelectItem value="HIGH">{TASK_PRIORITY_LABEL.HIGH}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-area" className="text-xs font-bold text-blue-700 uppercase">Área</Label>
                                <Select value={areaId} onValueChange={setAreaId}>
                                    <SelectTrigger id="edit-area" className="bg-white">
                                        <SelectValue placeholder="Sin área" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin área</SelectItem>
                                        {areas.map(area => (
                                            <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-responsible" className="text-xs font-bold text-blue-700 uppercase">Responsable</Label>
                                <Input
                                    id="edit-responsible"
                                    value={responsible}
                                    onChange={(e) => setResponsible(e.target.value)}
                                    placeholder="Nombre del responsable"
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-dueDate" className="text-xs font-bold text-blue-700 uppercase">Fecha Límite</Label>
                                <Input
                                    id="edit-dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Summary Section & Acceptance Criteria */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 p-5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Resumen Ejecutivo
                            </Label>
                            {isEditing ? (
                                <Input
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Resumen corto para la tabla..."
                                    maxLength={120}
                                    className="bg-white font-medium"
                                />
                            ) : (
                                <p className="text-base text-slate-800 font-medium leading-relaxed">
                                    {summary || <span className="text-slate-400 italic font-normal">Sin resumen disponible</span>}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3 p-5 bg-green-50/30 border border-green-100 rounded-xl shadow-sm">
                            <Label className="text-[10px] font-black uppercase text-green-600 tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Criterios de Aceptación
                            </Label>
                            {isEditing ? (
                                <Textarea
                                    value={acceptanceCriteria}
                                    onChange={(e) => setAcceptanceCriteria(e.target.value)}
                                    placeholder="¿Qué define esta tarea como completa?"
                                    rows={2}
                                    className="bg-white text-sm"
                                />
                            ) : (
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {acceptanceCriteria || <span className="text-slate-400 italic font-normal">No definidos</span>}
                                </p>
                            )}
                        </div>
                    </div>

                    <Accordion type="multiple" defaultValue={['diagnostico', 'pasos', 'entregables']} className="w-full space-y-2">
                        {/* Diagnóstico */}
                        <AccordionItem value="diagnostico" className="border rounded-lg px-4 bg-slate-50/50">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                    <Edit3 className="h-4 w-4 text-amber-600" />
                                    Diagnóstico / Hallazgos
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 pt-1">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        {details.diagnostico?.map((item: string, i: number) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    value={item}
                                                    onChange={(e) => updateItem('diagnostico', i, e.target.value)}
                                                    placeholder="Hallazgo..."
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => removeItem('diagnostico', i)}>
                                                    <Trash2 className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => addItem('diagnostico')}>
                                            <Plus className="h-4 w-4 mr-2" /> Agregar Hallazgo
                                        </Button>
                                    </div>
                                ) : (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {details.diagnostico && details.diagnostico.length > 0 ? (
                                            details.diagnostico.map((item: string, i: number) => (
                                                <li key={i} className="text-sm text-slate-600">{item}</li>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No hay registros.</p>
                                        )}
                                    </ul>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        {/* Pasos a seguir */}
                        <AccordionItem value="pasos" className="border rounded-lg px-4 bg-slate-50/50">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                    <Activity className="h-4 w-4 text-blue-600" />
                                    Pasos a seguir / Plan de Acción
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 pt-1">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        {details.pasos?.map((item: string, i: number) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    value={item}
                                                    onChange={(e) => updateItem('pasos', i, e.target.value)}
                                                    placeholder="Pasos..."
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => removeItem('pasos', i)}>
                                                    <Trash2 className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => addItem('pasos')}>
                                            <Plus className="h-4 w-4 mr-2" /> Agregar Paso
                                        </Button>
                                    </div>
                                ) : (
                                    <ul className="list-decimal pl-5 space-y-1">
                                        {details.pasos && details.pasos.length > 0 ? (
                                            details.pasos.map((item: string, i: number) => (
                                                <li key={i} className="text-sm text-slate-600">{item}</li>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No hay registros.</p>
                                        )}
                                    </ul>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        {/* Entregables */}
                        <AccordionItem value="entregables" className="border rounded-lg px-4 bg-slate-50/50">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Entregables Esperados
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 pt-1">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        {details.entregables?.map((item: string, i: number) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    value={item}
                                                    onChange={(e) => updateItem('entregables', i, e.target.value)}
                                                    placeholder="Entregable..."
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => removeItem('entregables', i)}>
                                                    <Trash2 className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => addItem('entregables')}>
                                            <Plus className="h-4 w-4 mr-2" /> Agregar Entregable
                                        </Button>
                                    </div>
                                ) : (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {details.entregables && details.entregables.length > 0 ? (
                                            details.entregables.map((item: string, i: number) => (
                                                <li key={i} className="text-sm text-slate-600 font-medium">{item}</li>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No hay registros.</p>
                                        )}
                                    </ul>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Dependency Notes & Legacy Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {task.dependencyNotes && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <Label className="text-xs font-bold uppercase text-amber-700 flex items-center gap-1 mb-2">
                                    <StickyNote className="h-3 w-3" />
                                    Notas de Dependencia
                                </Label>
                                <p className="text-sm text-amber-900">{task.dependencyNotes}</p>
                            </div>
                        )}
                        {(details.notes || isEditing) && (
                            <div className="p-4 bg-slate-50 border rounded-lg">
                                <Label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Otras Notas</Label>
                                {isEditing ? (
                                    <Textarea
                                        value={details.notes || ''}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDetails((prev: TaskDetails) => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Consideraciones adicionales..."
                                        rows={3}
                                    />
                                ) : (
                                    <p className="text-sm text-slate-600 italic whitespace-pre-wrap">{details.notes}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
