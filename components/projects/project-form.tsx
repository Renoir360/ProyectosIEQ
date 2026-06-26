'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export function ProjectForm() {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string[]>>({})

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            budget: formData.get('budget') ? parseFloat(formData.get('budget') as string) : null,
            startDate: formData.get('startDate') as string || null,
            endDate: formData.get('endDate') as string || null,
            status: formData.get('status') as string,
            department: formData.get('department') as string,
            progress: 0,
        }

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                toast({
                    title: "Proyecto creado",
                    description: "El nuevo proyecto se ha registrado con éxito.",
                })
                router.push('/projects')
                router.refresh()
            } else {
                const errorData = await response.json()
                if (errorData.fieldErrors) {
                    setErrors(errorData.fieldErrors)
                }
                toast({
                    variant: "destructive",
                    title: "Error de validación",
                    description: "Por favor revisa los campos requeridos.",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error inesperado",
                description: "No se pudo guardar el proyecto. Reintenta en unos momentos.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card rounded-xl p-6 border border-white/20 shadow-lg space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-[#1CB7BE] rounded-full shadow-[0_0_10px_rgba(28,183,190,0.5)]" />
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Información del Proyecto</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Label htmlFor="name" className="text-slate-700 font-semibold mb-2 block">
                            Título del Proyecto <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            placeholder="Ej: Red Hospitalaria 2026"
                            className="bg-white/50 border-white/30 focus:border-[#1CB7BE] transition-all"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name[0]}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="description" className="text-slate-700 font-semibold mb-2 block">
                            Descripción
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Detalles sobre el alcance y objetivos del proyecto..."
                            className="bg-white/50 border-white/30 focus:border-[#1CB7BE] transition-all"
                        />
                    </div>

                    <div>
                        <Label htmlFor="budget" className="text-slate-700 font-semibold mb-2 block">
                            Presupuesto Estimado ($)
                        </Label>
                        <Input
                            id="budget"
                            name="budget"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="bg-white/50 border-white/30 focus:border-[#1CB7BE] transition-all"
                        />
                    </div>

                    <div>
                        <Label htmlFor="status" className="text-slate-700 font-semibold mb-2 block">
                            Estado Inicial <span className="text-red-500">*</span>
                        </Label>
                        <Select name="status" defaultValue="PLANIFICADO" required>
                            <SelectTrigger className="bg-white/50 border-white/30 focus:border-[#1CB7BE] transition-all">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PLANIFICADO">Planificado</SelectItem>
                                <SelectItem value="EN_PROGRESO">En Progreso</SelectItem>
                                <SelectItem value="PAUSADO">Pausado</SelectItem>
                                <SelectItem value="COMPLETADO">Completado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="department" className="text-slate-700 font-semibold mb-2 block">
                            Departamento <span className="text-red-500">*</span>
                        </Label>
                        <Select name="department" defaultValue="SISTEMAS" required>
                            <SelectTrigger className="bg-white/50 border-white/30 focus:border-[#1CB7BE] transition-all">
                                <SelectValue placeholder="Seleccionar departamento" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SISTEMAS">Sistemas</SelectItem>
                                <SelectItem value="SUMINISTROS">Suministros</SelectItem>
                                <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="startDate" className="text-slate-700 font-semibold mb-2 block">
                            Fecha de Inicio
                        </Label>
                        <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            className="bg-white/50 border-white/30 focus:border-[#1CB7BE] transition-all"
                        />
                    </div>

                    <div>
                        <Label htmlFor="endDate" className="text-slate-700 font-semibold mb-2 block">
                            Fecha Estimada Fin
                        </Label>
                        <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            className="bg-white/50 border-white/30 focus:border-[#1CB7BE] transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/projects" className="flex-1">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full glass-card border-slate-200 hover:bg-slate-50 text-slate-700"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Cancelar
                    </Button>
                </Link>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#1CB7BE] hover:bg-[#1CB7BE]/90 text-white font-bold"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Crear Proyecto
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
