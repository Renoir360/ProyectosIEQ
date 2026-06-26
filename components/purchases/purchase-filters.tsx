'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type PurchaseFiltersProps = {
    projects: { id: string; name: string }[]
}

const PURCHASE_TYPES = [
    { value: 'ALL', label: 'Todos los tipos' },
    { value: 'HARDWARE', label: 'Hardware' },
    { value: 'SOFTWARE', label: 'Software' },
    { value: 'SERVICIO', label: 'Servicio' },
    { value: 'LICENCIA', label: 'Licencia' },
]

const PURCHASE_STATUSES = [
    { value: 'ALL', label: 'Todos los estados' },
    { value: 'BORRADOR', label: 'Pendiente' },
    { value: 'EN_REVISION', label: 'En Revisión' },
    { value: 'APROBADO', label: 'Aprobado' },
    { value: 'RECHAZADO', label: 'Rechazado' },
    { value: 'COMPRADO', label: 'Comprado' },
    { value: 'RECIBIDO', label: 'Recibido' },
]

export function PurchaseFilters({ projects }: PurchaseFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentType = searchParams.get('type') || 'ALL'
    const currentStatus = searchParams.get('status') || 'ALL'
    const currentProject = searchParams.get('projectId') || 'ALL'

    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'ALL') {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        params.delete('page') // Reset to page 1 when filtering
        router.push(`/compras?${params.toString()}`)
    }, [searchParams, router])

    return (
        <div className="glass-card rounded-xl p-4 border border-white/20 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Tipo</label>
                    <Select value={currentType} onValueChange={(value) => updateFilter('type', value)}>
                        <SelectTrigger className="bg-white/50 border-white/30">
                            <SelectValue placeholder="Filtrar por tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            {PURCHASE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Estado</label>
                    <Select value={currentStatus} onValueChange={(value) => updateFilter('status', value)}>
                        <SelectTrigger className="bg-white/50 border-white/30">
                            <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                            {PURCHASE_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Proyecto</label>
                    <Select value={currentProject} onValueChange={(value) => updateFilter('projectId', value)}>
                        <SelectTrigger className="bg-white/50 border-white/30">
                            <SelectValue placeholder="Filtrar por proyecto" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los proyectos</SelectItem>
                            {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
