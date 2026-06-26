'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface CreateTaskDialogProps {
    projectId: string
    areas: { id: string; name: string }[]
}

export function CreateTaskDialog({ projectId, areas }: CreateTaskDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        description: '',
        areaId: undefined as string | undefined,
        priority: 'MEDIUM',
        responsible: '',
        dueDate: '',
        acceptanceCriteria: '',
        dependencies: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                projectId,
                ...formData,
                areaId: formData.areaId || undefined,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
            }

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error('Failed to create task')

            setOpen(false)
            setFormData({
                title: '',
                summary: '',
                description: '',
                areaId: '',
                priority: 'MEDIUM',
                responsible: '',
                dueDate: '',
                acceptanceCriteria: '',
                dependencies: ''
            })
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error al crear la tarea')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="btn-gradient-teal text-white px-6 py-3 rounded-lg font-medium border-none">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Tarea
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Tarea</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="title">Título *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="Ej: Instalación AP Quirófano #3"
                            />
                        </div>

                        <div>
                            <Label htmlFor="area">Área</Label>
                            <Select value={formData.areaId} onValueChange={(val) => setFormData({ ...formData, areaId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sin área" />
                                </SelectTrigger>
                                <SelectContent>
                                    {areas.map(area => (
                                        <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="priority">Prioridad</Label>
                            <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Baja</SelectItem>
                                    <SelectItem value="MEDIUM">Media</SelectItem>
                                    <SelectItem value="HIGH">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="responsible">Responsable</Label>
                            <Input
                                id="responsible"
                                value={formData.responsible}
                                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                                placeholder="Nombre del responsable"
                            />
                        </div>

                        <div>
                            <Label htmlFor="dueDate">Fecha Límite</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="summary">Resumen Ejecutivo (Corta) *</Label>
                            <Input
                                id="summary"
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                required
                                maxLength={120}
                                placeholder="Resumen de 1 línea para la tabla"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="description">Detalle Inicial / Notas</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                placeholder="Describe el contexto o diagnóstico inicial..."
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="acceptanceCriteria">Criterios de Aceptación</Label>
                            <Textarea
                                id="acceptanceCriteria"
                                value={formData.acceptanceCriteria}
                                onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                                rows={3}
                                placeholder="¿Qué debe cumplirse para considerar esta tarea completa?"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="dependencies">Dependencias</Label>
                            <Input
                                id="dependencies"
                                value={formData.dependencies}
                                onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
                                placeholder="Ej: PoE en switch, patch cord Cat6, ventana de mantenimiento"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Tarea'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
