'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Task = {
    id: string
    title: string
}

type Project = {
    id: string
    name: string
    tasks: Task[]
}

type PurchaseFormProps = {
    projects: Project[]
}

export function PurchaseForm({ projects }: PurchaseFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [quotationFile, setQuotationFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        const formData = new FormData(e.currentTarget)

        // Convert PDF to base64 if uploaded (temporary solution)
        let quotationData: string | null = null
        if (quotationFile) {
            quotationData = await new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.readAsDataURL(quotationFile)
            })
        }

        const taskIdVal = formData.get('taskId') as string
        const taskId = taskIdVal && taskIdVal !== 'NONE' ? taskIdVal : null
        const projectIdVal = formData.get('projectId') as string
        const projectId = projectIdVal && projectIdVal !== 'NONE' ? projectIdVal : null

        const data = {
            title: formData.get('title') as string,
            type: formData.get('type') as string,
            projectId,
            taskId,
            vendor: formData.get('vendor') as string || null,
            vendorLink: quotationData, // Store base64 PDF temporarily
            estimatedAmount: parseFloat(formData.get('estimatedAmount') as string),
            priority: formData.get('priority') as string,
            description: formData.get('description') as string,
            justification: formData.get('justification') as string,
        }

        try {
            const response = await fetch('/api/purchases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                toast({
                    title: "Solicitud creada",
                    description: "La solicitud de compra se ha registrado con éxito.",
                })
                router.push('/compras')
                router.refresh()
            } else {
                const errorData = await response.json()
                if (errorData.fieldErrors) {
                    setErrors(errorData.fieldErrors)
                }
                toast({
                    variant: "destructive",
                    title: "Error de validación",
                    description: "Por favor revisa los campos del formulario.",
                })
                throw new Error('Failed to create purchase request')
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error inesperado",
                description: "No se pudo guardar la compra. Reintenta en unos momentos.",
            })
            setErrors({ _form: 'Error al crear la solicitud. Por favor, intenta de nuevo.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card rounded-xl p-6 border border-white/20 shadow-lg space-y-6">
                <h2 className="text-xl font-bold text-slate-800">Información General</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Label htmlFor="title" className="text-slate-700 font-semibold">
                            Título <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            placeholder="Ej: Switch WiFi6 para Piso Central"
                            className="mt-2 bg-white/50 border-white/30"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <Label htmlFor="type" className="text-slate-700 font-semibold">
                            Tipo <span className="text-red-500">*</span>
                        </Label>
                        <Select name="type" required defaultValue="HARDWARE">
                            <SelectTrigger className="mt-2 bg-white/50 border-white/30">
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HARDWARE">Hardware</SelectItem>
                                <SelectItem value="SOFTWARE">Software</SelectItem>
                                <SelectItem value="SERVICIO">Servicio</SelectItem>
                                <SelectItem value="LICENCIA">Licencia</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                    </div>

                    <div>
                        <Label htmlFor="priority" className="text-slate-700 font-semibold">
                            Urgencia <span className="text-red-500">*</span>
                        </Label>
                        <Select name="priority" required defaultValue="NORMAL">
                            <SelectTrigger className="mt-2 bg-white/50 border-white/30">
                                <SelectValue placeholder="Seleccionar urgencia" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NORMAL">Normal</SelectItem>
                                <SelectItem value="ALTA">Alta</SelectItem>
                                <SelectItem value="CRITICA">Crítica</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
                    </div>

                    <div>
                        <Label htmlFor="projectId" className="text-slate-700 font-semibold">
                            Proyecto (opcional)
                        </Label>
                        <Select name="projectId" onValueChange={(val) => setSelectedProjectId(val === 'NONE' ? null : val)}>
                            <SelectTrigger className="mt-2 bg-white/50 border-white/30">
                                <SelectValue placeholder="Sin proyecto" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">Sin proyecto</SelectItem>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedProjectId && (
                        <div>
                            <Label htmlFor="taskId" className="text-slate-700 font-semibold">
                                Vincular a Tarea (opcional)
                            </Label>
                            <Select name="taskId">
                                <SelectTrigger className="mt-2 bg-white/50 border-white/30">
                                    <SelectValue placeholder="Sin tarea (general del proyecto)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NONE">Sin tarea (general del proyecto)</SelectItem>
                                    {projects
                                        .find((p) => p.id === selectedProjectId)
                                        ?.tasks.map((task) => (
                                            <SelectItem key={task.id} value={task.id}>
                                                {task.title}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="estimatedAmount" className="text-slate-700 font-semibold">
                            Monto Estimado (USD) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="estimatedAmount"
                            name="estimatedAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            placeholder="500.00"
                            className="mt-2 bg-white/50 border-white/30"
                        />
                        {errors.estimatedAmount && <p className="text-red-500 text-sm mt-1">{errors.estimatedAmount}</p>}
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-xl p-6 border border-white/20 shadow-lg space-y-6">
                <h2 className="text-xl font-bold text-slate-800">Detalles del Proveedor</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="vendor" className="text-slate-700 font-semibold">
                            Proveedor
                        </Label>
                        <Input
                            id="vendor"
                            name="vendor"
                            placeholder="Ej: TechStore Venezuela"
                            className="mt-2 bg-white/50 border-white/30"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="quotationFile" className="text-slate-700 font-semibold">
                            Cotización (PDF)
                        </Label>
                        <div className="mt-2 space-y-3">
                            <div className="flex items-center gap-3">
                                <Input
                                    id="quotationFile"
                                    name="quotationFile"
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            setQuotationFile(file)
                                            const url = URL.createObjectURL(file)
                                            setPreviewUrl(url)
                                        } else {
                                            setQuotationFile(null)
                                            setPreviewUrl(null)
                                        }
                                    }}
                                    className="bg-white/50 border-white/30"
                                />
                                {quotationFile && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setQuotationFile(null)
                                            setPreviewUrl(null)
                                            const input = document.getElementById('quotationFile') as HTMLInputElement
                                            if (input) input.value = ''
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Quitar
                                    </Button>
                                )}
                            </div>

                            {previewUrl && quotationFile && (
                                <div className="border border-white/30 rounded-lg p-4 bg-white/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-slate-700">
                                            Vista previa: {quotationFile.name}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {(quotationFile.size / 1024).toFixed(1)} KB
                                        </span>
                                    </div>
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-96 rounded border border-white/20"
                                        title="PDF Preview"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-xl p-6 border border-white/20 shadow-lg space-y-6">
                <h2 className="text-xl font-bold text-slate-800">Descripción y Justificación</h2>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="description" className="text-slate-700 font-semibold">
                            Descripción Técnica <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            required
                            rows={4}
                            placeholder="Describe las especificaciones técnicas del producto o servicio..."
                            className="mt-2 bg-white/50 border-white/30 resize-none"
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <Label htmlFor="justification" className="text-slate-700 font-semibold">
                            Justificación <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="justification"
                            name="justification"
                            required
                            rows={6}
                            placeholder="Explica por qué es necesaria esta compra, los beneficios esperados, y el impacto en el proyecto o área..."
                            className="mt-2 bg-white/50 border-white/30 resize-none"
                        />
                        {errors.justification && <p className="text-red-500 text-sm mt-1">{errors.justification}</p>}
                    </div>
                </div>
            </div>

            {errors._form && (
                <div className="glass-card rounded-xl p-4 border border-red-300 bg-red-50/50">
                    <p className="text-red-700 font-semibold">{errors._form}</p>
                </div>
            )}

            <div className="flex items-center gap-4">
                <Link href="/compras">
                    <Button type="button" variant="outline" className="glass-card">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Cancelar
                    </Button>
                </Link>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1CB7BE] hover:bg-[#1CB7BE]/90 text-white font-bold"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creando...
                        </>
                    ) : (
                        'Crear Solicitud'
                    )}
                </Button>
            </div>
        </form>
    )
}
