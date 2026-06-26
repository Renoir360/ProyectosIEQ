'use client'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Wifi, Upload, Edit2, Trash2, Plus, Loader2, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface AccessPoint {
    id: string
    floorplanId: string
    name: string
    model: string | null
    x: number
    y: number
    radius: number
    channel: string | null
    status: string
    band: string | null
    notes: string | null
}

interface Floorplan {
    id: string
    projectId: string
    name: string
    imageUrl: string
    scale: number | null
    notes: string | null
    accessPoints: AccessPoint[]
}

interface WifiFloorplanProps {
    projectId: string
    userRole?: string
}

// --- Unified AP Form Dialog ---
function ApFormDialog({
    open,
    onOpenChange,
    mode,
    initialData,
    onSubmit,
    onDelete,
    isSaving,
    isDeleting,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    mode: 'create' | 'edit'
    initialData?: AccessPoint | null
    onSubmit: (data: { name: string; model: string; band: string; channel: string; radius: number; status: string; notes: string }) => void
    onDelete?: () => void
    isSaving: boolean
    isDeleting?: boolean
}) {
    const [name, setName] = useState('')
    const [model, setModel] = useState('RG-RAP2260G')
    const [band, setBand] = useState('5GHz')
    const [channel, setChannel] = useState('36')
    const [radius, setRadius] = useState(0.15)
    const [status, setStatus] = useState('planificado')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                setName(initialData.name)
                setModel(initialData.model || 'RG-RAP2260G')
                setBand(initialData.band || '5GHz')
                setChannel(initialData.channel || '36')
                setRadius(initialData.radius)
                setStatus(initialData.status)
                setNotes(initialData.notes || '')
            } else {
                setName('')
                setModel('RG-RAP2260G')
                setBand('5GHz')
                setChannel('36')
                setRadius(0.15)
                setStatus('planificado')
                setNotes('')
            }
        }
    }, [open, mode, initialData])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader className={mode === 'edit' ? 'flex flex-row justify-between items-center pr-6' : ''}>
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        {mode === 'create' ? 'Agregar Punto de Acceso' : 'Detalles del AP'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {mode === 'create' ? 'Formulario para crear un nuevo punto de acceso' : 'Editar o eliminar punto de acceso'}
                    </DialogDescription>
                    {mode === 'edit' && onDelete && (
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={onDelete}
                            disabled={isDeleting}
                            className="h-8 w-8 rounded-full"
                            title="Eliminar AP"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={15} />}
                        </Button>
                    )}
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Nombre</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} className="bg-slate-50" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Modelo</Label>
                            <Input value={model} onChange={e => setModel(e.target.value)} className="bg-slate-50" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Banda</Label>
                            <Select value={band} onValueChange={setBand}>
                                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="5GHz">5 GHz</SelectItem>
                                    <SelectItem value="2.4GHz">2.4 GHz</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Canal</Label>
                            <Input value={channel} onChange={e => setChannel(e.target.value)} className="bg-slate-50" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Cobertura (Radio)</Label>
                            <Select value={String(radius)} onValueChange={val => setRadius(Number(val))}>
                                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="0.05">Mínimo (5%)</SelectItem>
                                    <SelectItem value="0.1">Pequeño (10%)</SelectItem>
                                    <SelectItem value="0.15">Estándar (15%)</SelectItem>
                                    <SelectItem value="0.2">Amplio (20%)</SelectItem>
                                    <SelectItem value="0.25">Máximo (25%)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-slate-500 uppercase">Estado</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="planificado">Planificado</SelectItem>
                                    <SelectItem value="instalado">Instalado</SelectItem>
                                    <SelectItem value="operativo">Operativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Notas de Instalación</Label>
                        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Rack del pasillo norte, altura de 3m" className="bg-slate-50" />
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button
                        onClick={() => onSubmit({ name, model, band, channel, radius, status, notes })}
                        disabled={isSaving || !name.trim()}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === 'create' ? 'Crear AP' : 'Actualizar AP'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// --- Upload Preview Dialog ---
function UploadPreviewDialog({
    open,
    onOpenChange,
    file,
    previewUrl,
    onConfirm,
    isUploading,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    file: File | null
    previewUrl: string | null
    onConfirm: (name: string) => void
    isUploading: boolean
}) {
    const [name, setName] = useState('')

    useEffect(() => {
        if (file) {
            const baseName = file.name.replace(/\.[^.]+$/, '')
            setName(baseName)
        }
    }, [file])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-white">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-800">Confirmar Subida de Plano</DialogTitle>
                    <DialogDescription className="sr-only">Preview y nombre del plano antes de subir</DialogDescription>
                </DialogHeader>
                {previewUrl && (
                    <div className="border rounded-lg overflow-hidden bg-slate-50 max-h-[300px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                )}
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-500 uppercase">Nombre del Plano</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} className="bg-slate-50" />
                </div>
                {file && (
                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}</p>
                )}
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button
                        onClick={() => onConfirm(name)}
                        disabled={isUploading || !name.trim()}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                    >
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Subir Plano
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// --- Main Component ---
export function WifiFloorplan({ projectId, userRole }: WifiFloorplanProps) {
    const { toast } = useToast()
    const containerRef = useRef<HTMLDivElement>(null)
    const [floorplans, setFloorplans] = useState<Floorplan[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [showCoverage, setShowCoverage] = useState(true)
    const [isEditMode, setIsEditMode] = useState(false)
    const [draggingApId, setDraggingApId] = useState<string | null>(null)
    const [hasDragged, setHasDragged] = useState(false)

    // Zoom
    const [zoomLevel, setZoomLevel] = useState(1)
    const MIN_ZOOM = 0.5
    const MAX_ZOOM = 3

    // AP form state
    const [apModalOpen, setApModalOpen] = useState(false)
    const [apModalMode, setApModalMode] = useState<'create' | 'edit'>('create')
    const [selectedAp, setSelectedAp] = useState<AccessPoint | null>(null)
    const [newApCoords, setNewApCoords] = useState<{ x: number; y: number } | null>(null)
    const [isSavingAp, setIsSavingAp] = useState(false)
    const [isDeletingAp, setIsDeletingAp] = useState(false)

    // Upload preview
    const [uploadFile, setUploadFile] = useState<File | null>(null)
    const [uploadPreview, setUploadPreview] = useState<string | null>(null)
    const [isUploadPreviewOpen, setIsUploadPreviewOpen] = useState(false)
    const [isUploadingBlueprint, setIsUploadingBlueprint] = useState(false)

    // Delete floorplan confirmation
    const [isDeleteFpOpen, setIsDeleteFpOpen] = useState(false)
    const [isDeletingFp, setIsDeletingFp] = useState(false)

    // Derived state
    const selected = useMemo(() => floorplans.find(fp => fp.id === selectedId) ?? null, [floorplans, selectedId])

    useEffect(() => {
        fetch(`/api/projects/${projectId}/floorplans`)
            .then(r => r.json())
            .then(data => {
                setFloorplans(data)
                if (data.length > 0) setSelectedId(data[0].id)
            })
    }, [projectId])

    const canEdit = userRole === 'SISTEMAS'

    const updateFloorplanAps = useCallback((floorplanId: string, updater: (aps: AccessPoint[]) => AccessPoint[]) => {
        setFloorplans(prev => prev.map(fp =>
            fp.id === floorplanId ? { ...fp, accessPoints: updater(fp.accessPoints) } : fp
        ))
    }, [])

    // --- Drag handlers ---
    const handleApPointerDown = (e: React.PointerEvent, apId: string) => {
        if (!isEditMode || !canEdit) return
        e.stopPropagation()
        e.preventDefault()
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        setDraggingApId(apId)
        setHasDragged(false)
    }

    const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggingApId || !containerRef.current || !selected) return
        e.preventDefault()
        setHasDragged(true)
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0.01, Math.min(0.99, (e.clientX - rect.left) / rect.width))
        const y = Math.max(0.01, Math.min(0.99, (e.clientY - rect.top) / rect.height))

        updateFloorplanAps(selected.id, aps =>
            aps.map(ap => ap.id === draggingApId ? { ...ap, x, y } : ap)
        )
    }

    const handleContainerPointerUp = async () => {
        if (!draggingApId || !selected) return
        const apId = draggingApId
        setDraggingApId(null)
        setTimeout(() => setHasDragged(false), 150)

        const ap = selected.accessPoints.find(a => a.id === apId)
        if (!ap) return

        try {
            const res = await fetch(`/api/projects/${projectId}/floorplans/${selected.id}/aps`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: apId, x: ap.x, y: ap.y })
            })
            if (!res.ok) throw new Error('Error al actualizar posición')
        } catch {
            toast({ title: 'Error de sincronización', description: 'No se pudo guardar la posición del AP.', variant: 'destructive' })
        }
    }

    // Click on map to add AP
    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isEditMode || !canEdit || !selected || hasDragged) return
        const target = e.target as HTMLElement
        if (target.closest('.ap-pin') || target.closest('[role="dialog"]')) return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height

        setNewApCoords({ x, y })
        setSelectedAp(null)
        setApModalMode('create')
        setApModalOpen(true)
    }

    // Click on pin to edit
    const handleApClick = (e: React.MouseEvent, ap: AccessPoint) => {
        e.stopPropagation()
        if (!isEditMode || !canEdit) return
        setSelectedAp(ap)
        setApModalMode('edit')
        setApModalOpen(true)
    }

    // --- CRUD handlers ---
    const handleApSubmit = async (data: { name: string; model: string; band: string; channel: string; radius: number; status: string; notes: string }) => {
        if (!selected) return
        setIsSavingAp(true)

        try {
            if (apModalMode === 'create' && newApCoords) {
                const res = await fetch(`/api/projects/${projectId}/floorplans/${selected.id}/aps`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, x: newApCoords.x, y: newApCoords.y })
                })
                const newAp = await res.json()
                if (!res.ok) throw new Error(newAp.error || 'Error al guardar AP')
                toast({ title: 'AP Creado', description: `Se agregó "${data.name}" al plano.` })
                updateFloorplanAps(selected.id, aps => [...aps, newAp])
            } else if (apModalMode === 'edit' && selectedAp) {
                const res = await fetch(`/api/projects/${projectId}/floorplans/${selected.id}/aps`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedAp.id, ...data })
                })
                const updatedAp = await res.json()
                if (!res.ok) throw new Error(updatedAp.error || 'Error al actualizar AP')
                toast({ title: 'AP Actualizado', description: `Se guardaron los cambios para "${data.name}"` })
                updateFloorplanAps(selected.id, aps => aps.map(ap => ap.id === selectedAp.id ? updatedAp : ap))
            }
            setApModalOpen(false)
        } catch (err: unknown) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error inesperado', variant: 'destructive' })
        } finally {
            setIsSavingAp(false)
        }
    }

    const handleDeleteAp = async () => {
        if (!selectedAp || !selected) return
        setIsDeletingAp(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/floorplans/${selected.id}/aps`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedAp.id })
            })
            if (!res.ok) throw new Error('Error al eliminar AP')
            toast({ title: 'AP Eliminado', description: `El AP "${selectedAp.name}" fue removido.` })
            updateFloorplanAps(selected.id, aps => aps.filter(ap => ap.id !== selectedAp.id))
            setApModalOpen(false)
        } catch (err: unknown) {
            toast({ title: 'Error al eliminar', description: err instanceof Error ? err.message : 'Error inesperado', variant: 'destructive' })
        } finally {
            setIsDeletingAp(false)
        }
    }

    // --- Delete floorplan ---
    const handleDeleteFloorplan = async () => {
        if (!selected) return
        setIsDeletingFp(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/floorplans`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ floorplanId: selected.id })
            })
            if (!res.ok) throw new Error('Error al eliminar plano')
            toast({ title: 'Plano Eliminado', description: `Se eliminó "${selected.name}" y todos sus APs.` })
            setFloorplans(prev => prev.filter(fp => fp.id !== selected.id))
            setSelectedId(floorplans.find(fp => fp.id !== selected.id)?.id ?? null)
            setIsDeleteFpOpen(false)
            setIsEditMode(false)
        } catch (err: unknown) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error inesperado', variant: 'destructive' })
        } finally {
            setIsDeletingFp(false)
        }
    }

    // --- Upload with preview ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'Archivo muy grande', description: 'El tamaño máximo es 5 MB.', variant: 'destructive' })
            e.target.value = ''
            return
        }

        setUploadFile(file)
        setUploadPreview(URL.createObjectURL(file))
        setIsUploadPreviewOpen(true)
        e.target.value = ''
    }

    const handleConfirmUpload = async (name: string) => {
        if (!uploadFile) return
        setIsUploadingBlueprint(true)

        try {
            const formData = new FormData()
            formData.append('file', uploadFile)

            const uploadRes = await fetch(`/api/projects/${projectId}/floorplans/upload`, {
                method: 'POST',
                body: formData
            })
            const uploadData = await uploadRes.json()
            if (!uploadRes.ok) throw new Error(uploadData.error || 'Error en subida')

            const createRes = await fetch(`/api/projects/${projectId}/floorplans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, imageUrl: uploadData.publicUrl, notes: 'Subido desde la interfaz' })
            })
            const newFp = await createRes.json()
            if (!createRes.ok) throw new Error(newFp.error || 'Error al registrar plano')

            toast({ title: 'Plano agregado', description: `Se registró "${newFp.name}" correctamente.` })
            setFloorplans(prev => [...prev, newFp])
            setSelectedId(newFp.id)
            setIsUploadPreviewOpen(false)
        } catch (err: unknown) {
            toast({ title: 'Error de subida', description: err instanceof Error ? err.message : 'Error inesperado', variant: 'destructive' })
        } finally {
            setIsUploadingBlueprint(false)
            if (uploadPreview) URL.revokeObjectURL(uploadPreview)
            setUploadFile(null)
            setUploadPreview(null)
        }
    }

    // AP summary stats
    const apSummary = useMemo(() => {
        if (!selected) return { total: 0, planificado: 0, instalado: 0, operativo: 0 }
        const aps = selected.accessPoints
        return {
            total: aps.length,
            planificado: aps.filter(a => a.status === 'planificado').length,
            instalado: aps.filter(a => a.status === 'instalado').length,
            operativo: aps.filter(a => a.status === 'operativo').length,
        }
    }, [selected])

    return (
        <div className="space-y-6">
            {/* Header / Selection */}
            <div className="glass-card p-6 rounded-xl border bg-white/50 backdrop-blur-sm">
                <div className="flex justify-between mb-4 items-center flex-wrap gap-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <Wifi className="h-6 w-6 text-teal-600" />
                        Mapa de Cobertura WiFi 6
                    </h3>

                    {canEdit && (
                        <div className="flex gap-2">
                            <input
                                type="file"
                                className="hidden"
                                id="upload-blueprint"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="upload-blueprint">
                                <Button variant="outline" className="gap-2 text-teal-700 border-teal-200 hover:bg-teal-50 cursor-pointer" asChild>
                                    <span><Upload size={16} /> Subir Plano</span>
                                </Button>
                            </label>
                        </div>
                    )}
                </div>

                {floorplans.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg">
                        No hay planos WiFi subidos para este proyecto aún.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {floorplans.map(fp => (
                            <motion.div
                                key={fp.id}
                                whileHover={{ scale: 1.02 }}
                                className={`p-3 cursor-pointer rounded-lg border transition-all ${selectedId === fp.id ? 'ring-2 ring-teal-500 bg-teal-50/50' : 'bg-white hover:shadow-md'}`}
                                onClick={() => { setSelectedId(fp.id); setZoomLevel(1) }}
                            >
                                <div className="h-24 w-full overflow-hidden rounded mb-2 relative bg-slate-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={fp.imageUrl} alt={fp.name} className="w-full h-full object-cover" />
                                </div>
                                <h4 className="font-bold text-xs text-slate-800 truncate">{fp.name}</h4>
                                <p className="text-[10px] text-teal-600 font-bold">{fp.accessPoints.length} APs colocados</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Interactive floorplan */}
            {selected && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 md:p-8 rounded-xl border bg-white shadow-sm">
                    <div className="flex justify-between mb-4 flex-wrap gap-4 items-center">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{selected.name}</h2>
                            <p className="text-slate-500 text-sm font-semibold mt-0.5">
                                {selected.accessPoints.length} Puntos de Acceso
                            </p>
                        </div>
                        <div className="flex gap-2 items-center flex-wrap">
                            {canEdit && (
                                <>
                                    <Button
                                        variant={isEditMode ? 'default' : 'outline'}
                                        onClick={() => {
                                            setIsEditMode(!isEditMode)
                                            if (!isEditMode) {
                                                toast({ title: 'Modo Edición', description: 'Clic en el plano para agregar AP, arrastra para mover, clic en pin para editar.' })
                                            }
                                        }}
                                        className={`gap-2 font-bold ${isEditMode ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'text-slate-700 border-slate-200'}`}
                                    >
                                        <Edit2 size={16} />
                                        {isEditMode ? 'Salir Edición' : 'Modo Edición'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDeleteFpOpen(true)}
                                        className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <Trash2 size={16} /> Eliminar Plano
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setShowCoverage(!showCoverage)}
                                className={`gap-2 font-semibold ${showCoverage ? 'bg-teal-50 border-teal-200 text-teal-700' : 'text-slate-600 border-slate-200'}`}
                            >
                                <Wifi size={16} />
                                {showCoverage ? 'Ocultar Cobertura' : 'Ver Cobertura'}
                            </Button>
                        </div>
                    </div>

                    {/* Zoom controls */}
                    <div className="flex items-center gap-2 mb-3">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(z => Math.max(MIN_ZOOM, z - 0.25))}>
                            <ZoomOut size={14} />
                        </Button>
                        <span className="text-xs font-mono text-slate-500 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(z => Math.min(MAX_ZOOM, z + 0.25))}>
                            <ZoomIn size={14} />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(1)}>
                            <RotateCcw size={14} />
                        </Button>
                    </div>

                    {/* Map container */}
                    <div className="overflow-auto max-h-[650px] border-4 border-slate-200 rounded-2xl bg-slate-100 shadow-inner"
                         style={{ cursor: isEditMode && canEdit ? 'cell' : 'default' }}>
                        <div
                            ref={containerRef}
                            onClick={handleContainerClick}
                            onPointerMove={handleContainerPointerMove}
                            onPointerUp={handleContainerPointerUp}
                            className={`relative select-none origin-top-left transition-transform duration-200 ${isEditMode && canEdit ? 'ring-2 ring-teal-500/20' : ''}`}
                            style={{ transform: `scale(${zoomLevel})`, width: `${100 / zoomLevel}%` }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={selected.imageUrl}
                                alt={selected.name}
                                className="w-full object-contain pointer-events-none"
                                draggable={false}
                            />

                            {/* APs */}
                            {selected.accessPoints.map((ap) => {
                                const is5GHz = ap.band === '5GHz'
                                const radiusPercent = ap.radius * 2 * 100

                                return (
                                    <div key={ap.id} className="absolute inset-0 pointer-events-none">
                                        {showCoverage && (
                                            <div
                                                className="absolute rounded-full opacity-60 mix-blend-multiply pointer-events-none"
                                                style={{
                                                    left: `${ap.x * 100}%`,
                                                    top: `${ap.y * 100}%`,
                                                    width: `${radiusPercent}%`,
                                                    height: 0,
                                                    paddingBottom: `${radiusPercent}%`,
                                                    background: is5GHz
                                                        ? 'radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(59,130,246,0.2) 60%, rgba(59,130,246,0) 100%)'
                                                        : 'radial-gradient(circle, rgba(234,179,8,0.55) 0%, rgba(234,179,8,0.2) 60%, rgba(234,179,8,0) 100%)',
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            />
                                        )}

                                        <div
                                            onPointerDown={(e) => handleApPointerDown(e, ap.id)}
                                            className={`absolute pointer-events-auto ap-pin z-20 ${isEditMode ? 'cursor-grab active:cursor-grabbing' : 'group'}`}
                                            style={{
                                                left: `${ap.x * 100}%`,
                                                top: `${ap.y * 100}%`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={(e) => handleApClick(e, ap)}
                                                className={`relative flex items-center justify-center rounded-full bg-white shadow-2xl border-4 transition-all hover:scale-110 ${isEditMode ? 'border-teal-500 animate-pulse' : (is5GHz ? 'border-blue-500' : 'border-yellow-500')}`}
                                                style={{ width: 44, height: 44 }}
                                            >
                                                <Wifi size={16} className={is5GHz ? 'text-blue-600' : 'text-yellow-600'} />
                                                {isEditMode && (
                                                    <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">M</span>
                                                )}
                                            </button>

                                            {!isEditMode && (
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none min-w-[200px] z-50">
                                                    <div className="font-bold text-[#1CB7BE] mb-0.5">{ap.name}</div>
                                                    <div className="text-gray-300 text-xs mb-2 font-medium">{ap.model || 'RG-RAP2260G'}</div>
                                                    <div className="flex gap-2 text-xs font-mono bg-slate-800 p-1.5 rounded items-center justify-center">
                                                        <span className={is5GHz ? 'text-blue-400 font-bold' : 'text-yellow-400 font-bold'}>{ap.band}</span>
                                                        <span className="text-slate-500">|</span>
                                                        <span>Ch.{ap.channel || 'Auto'}</span>
                                                    </div>
                                                    {ap.notes && (
                                                        <div className="text-[10px] mt-2 pt-2 border-t border-slate-800 text-slate-400 italic">{ap.notes}</div>
                                                    )}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Legend */}
                            <div className="absolute bottom-4 right-4 glass-card px-4 py-3 rounded-xl shadow-xl space-y-2 text-xs border bg-white/95 backdrop-blur pointer-events-none select-none">
                                <div className="font-bold text-slate-500 mb-1 uppercase tracking-wider text-[10px]">Frecuencias</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full ring-2 ring-blue-200" />5GHz (Alta densidad)</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full ring-2 ring-yellow-200" />2.4GHz (Larga distancia)</div>
                            </div>
                        </div>
                    </div>

                    {/* AP Summary Table */}
                    {selected.accessPoints.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Info size={16} className="text-teal-600" />
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Resumen de Access Points</h4>
                                <div className="flex gap-2 ml-auto">
                                    <Badge variant="outline" className="text-[10px]">Total: {apSummary.total}</Badge>
                                    <Badge variant="outline" className="text-[10px] text-slate-500">Plan: {apSummary.planificado}</Badge>
                                    <Badge variant="outline" className="text-[10px] text-amber-600">Inst: {apSummary.instalado}</Badge>
                                    <Badge variant="outline" className="text-[10px] text-green-600">Oper: {apSummary.operativo}</Badge>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                                            <th className="py-2 pr-4">Nombre</th>
                                            <th className="py-2 pr-4">Modelo</th>
                                            <th className="py-2 pr-4">Banda</th>
                                            <th className="py-2 pr-4">Canal</th>
                                            <th className="py-2 pr-4">Estado</th>
                                            <th className="py-2">Notas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {selected.accessPoints.map(ap => (
                                            <tr key={ap.id} className="hover:bg-slate-50/50">
                                                <td className="py-2 pr-4 font-medium">{ap.name}</td>
                                                <td className="py-2 pr-4 text-xs text-slate-500">{ap.model || '-'}</td>
                                                <td className="py-2 pr-4">
                                                    <Badge variant="outline" className={`text-[10px] ${ap.band === '5GHz' ? 'text-blue-600 bg-blue-50' : 'text-yellow-600 bg-yellow-50'}`}>
                                                        {ap.band || '-'}
                                                    </Badge>
                                                </td>
                                                <td className="py-2 pr-4 font-mono text-xs">{ap.channel || 'Auto'}</td>
                                                <td className="py-2 pr-4">
                                                    <Badge variant="outline" className={`text-[10px] capitalize ${
                                                        ap.status === 'operativo' ? 'text-green-600 bg-green-50' :
                                                        ap.status === 'instalado' ? 'text-amber-600 bg-amber-50' :
                                                        'text-slate-500 bg-slate-50'
                                                    }`}>
                                                        {ap.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-2 text-xs text-slate-400 max-w-[200px] truncate">{ap.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* AP Form Dialog (unified create/edit) */}
            <ApFormDialog
                open={apModalOpen}
                onOpenChange={setApModalOpen}
                mode={apModalMode}
                initialData={selectedAp}
                onSubmit={handleApSubmit}
                onDelete={apModalMode === 'edit' ? handleDeleteAp : undefined}
                isSaving={isSavingAp}
                isDeleting={isDeletingAp}
            />

            {/* Upload Preview Dialog */}
            <UploadPreviewDialog
                open={isUploadPreviewOpen}
                onOpenChange={(v) => {
                    setIsUploadPreviewOpen(v)
                    if (!v && uploadPreview) { URL.revokeObjectURL(uploadPreview); setUploadFile(null); setUploadPreview(null) }
                }}
                file={uploadFile}
                previewUrl={uploadPreview}
                onConfirm={handleConfirmUpload}
                isUploading={isUploadingBlueprint}
            />

            {/* Delete Floorplan Confirmation */}
            <Dialog open={isDeleteFpOpen} onOpenChange={setIsDeleteFpOpen}>
                <DialogContent className="sm:max-w-sm bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-slate-800">Eliminar Plano</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de eliminar &quot;{selected?.name}&quot;? Se eliminarán todos los APs asociados. Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteFpOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDeleteFloorplan} disabled={isDeletingFp}>
                            {isDeletingFp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
