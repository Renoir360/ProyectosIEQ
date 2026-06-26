'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type PurchaseStatusDialogProps = {
    purchaseId: string
    currentStatus: string
    title: string
    isOpen: boolean
    onClose: () => void
}

const STATUS_OPTIONS = [
    { value: 'BORRADOR', label: 'Pendiente', color: 'bg-gray-500/10 text-gray-700' },
    { value: 'EN_REVISION', label: 'En Revisión', color: 'bg-yellow-500/10 text-yellow-700' },
    { value: 'APROBADO', label: 'Aprobado', color: 'bg-green-500/10 text-green-700' },
    { value: 'RECHAZADO', label: 'Rechazado', color: 'bg-red-500/10 text-red-700' },
    { value: 'COMPRADO', label: 'Comprado', color: 'bg-blue-500/10 text-blue-700' },
    { value: 'RECIBIDO', label: 'Recibido', color: 'bg-emerald-500/10 text-emerald-700' },
]

export function PurchaseStatusDialog({
    purchaseId,
    currentStatus,
    title,
    isOpen,
    onClose,
}: PurchaseStatusDialogProps) {
    const router = useRouter()
    const [selectedStatus, setSelectedStatus] = useState(currentStatus)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [rejectionComments, setRejectionComments] = useState('')

    const handleSubmit = async () => {
        if (selectedStatus === currentStatus) {
            onClose()
            return
        }

        // Validate rejection comments if status is RECHAZADO
        if (selectedStatus === 'RECHAZADO' && !rejectionComments.trim()) {
            setError('Los comentarios son obligatorios al rechazar una solicitud.')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const updateData: any = { status: selectedStatus }

            // Add rejection comments if status is RECHAZADO
            if (selectedStatus === 'RECHAZADO') {
                updateData.rejectionComments = rejectionComments.trim()
            } else {
                // Clear rejection comments if changing from RECHAZADO to another status
                updateData.rejectionComments = null
            }

            const response = await fetch(`/api/purchases/${purchaseId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            })

            if (!response.ok) {
                throw new Error('Failed to update status')
            }

            router.refresh()
            onClose()
        } catch (err) {
            setError('Error al actualizar el estado. Por favor, intenta de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const currentStatusOption = STATUS_OPTIONS.find(s => s.value === currentStatus)
    const selectedStatusOption = STATUS_OPTIONS.find(s => s.value === selectedStatus)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cambiar Estado de Solicitud</DialogTitle>
                    <DialogDescription>
                        <span className="font-semibold text-slate-700">{title}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Estado actual</Label>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={currentStatusOption?.color}>
                                {currentStatusOption?.label}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Nuevo estado</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedStatus === 'RECHAZADO' && (
                        <div className="space-y-2">
                            <Label htmlFor="rejectionComments">
                                Comentarios de rechazo <span className="text-red-500">*</span>
                            </Label>
                            <textarea
                                id="rejectionComments"
                                value={rejectionComments}
                                onChange={(e) => setRejectionComments(e.target.value)}
                                placeholder="Indica el motivo del rechazo..."
                                rows={4}
                                className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1CB7BE] resize-none"
                                required
                            />
                            {selectedStatus === 'RECHAZADO' && !rejectionComments.trim() && (
                                <p className="text-xs text-amber-600">
                                    Este campo es obligatorio para rechazar la solicitud
                                </p>
                            )}
                        </div>
                    )}

                    {selectedStatus === 'APROBADO' && currentStatus !== 'APROBADO' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                                ℹ️ Al aprobar, el PDF adjunto se eliminará automáticamente para liberar espacio.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting ||
                            selectedStatus === currentStatus ||
                            (selectedStatus === 'RECHAZADO' && !rejectionComments.trim())
                        }
                        className="bg-[#1CB7BE] hover:bg-[#1CB7BE]/90"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Actualizando...
                            </>
                        ) : (
                            'Actualizar Estado'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
