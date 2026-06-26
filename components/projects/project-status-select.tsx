'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    PROJECT_STATUS_LABEL,
    PROJECT_STATUS_COLOR,
    ProjectStatus
} from '@/lib/status'
import { Badge } from '@/components/ui/badge'

interface ProjectStatusSelectProps {
    projectId: string
    initialStatus: ProjectStatus
    userRole?: string
}

export function ProjectStatusSelect({ projectId, initialStatus, userRole }: ProjectStatusSelectProps) {
    const router = useRouter()
    const [status, setStatus] = useState<ProjectStatus>(initialStatus)
    const [loading, setLoading] = useState(false)

    async function handleStatusChange(newStatus: ProjectStatus) {
        setLoading(true)
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!res.ok) throw new Error('Failed to update status')

            setStatus(newStatus)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error al actualizar el estado del proyecto')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Select
            disabled={loading || userRole !== 'SISTEMAS'}
            onValueChange={(val: ProjectStatus) => handleStatusChange(val)}
            value={status}
        >
            <SelectTrigger className={`w-[140px] h-8 bg-white ${PROJECT_STATUS_COLOR[status]}`}>
                <SelectValue>
                    {PROJECT_STATUS_LABEL[status]}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="PLANIFICADO">{PROJECT_STATUS_LABEL.PLANIFICADO}</SelectItem>
                <SelectItem value="EN_PROGRESO">{PROJECT_STATUS_LABEL.EN_PROGRESO}</SelectItem>
                <SelectItem value="PAUSADO">{PROJECT_STATUS_LABEL.PAUSADO}</SelectItem>
                <SelectItem value="COMPLETADO">{PROJECT_STATUS_LABEL.COMPLETADO}</SelectItem>
            </SelectContent>
        </Select>
    )
}
