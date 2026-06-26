'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type PurchaseDetailsDialogProps = {
    purchase: {
        id: string
        title: string
        type: string
        estimatedAmount: number
        priority: string
        status: string
        project: { id: string; name: string } | null
        createdAt: Date
        updatedAt: Date
        vendor?: string | null
        vendorLink?: string | null
        description: string
        justification: string
    }
    isOpen: boolean
    onClose: () => void
}

const STATUS_COLORS = {
    BORRADOR: 'bg-gray-500/10 text-gray-700 border-gray-300',
    EN_REVISION: 'bg-yellow-500/10 text-yellow-700 border-yellow-300',
    APROBADO: 'bg-green-500/10 text-green-700 border-green-300',
    RECHAZADO: 'bg-red-500/10 text-red-700 border-red-300',
    COMPRADO: 'bg-blue-500/10 text-blue-700 border-blue-300',
    RECIBIDO: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
}

const STATUS_LABELS = {
    BORRADOR: 'Pendiente',
    EN_REVISION: 'En Revisión',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
    COMPRADO: 'Comprado',
    RECIBIDO: 'Recibido',
}

const PRIORITY_COLORS = {
    NORMAL: 'bg-slate-500/10 text-slate-700 border-slate-300',
    ALTA: 'bg-orange-500/10 text-orange-700 border-orange-300',
    CRITICA: 'bg-red-500/10 text-red-700 border-red-300',
}

const TYPE_LABELS = {
    HARDWARE: 'Hardware',
    SOFTWARE: 'Software',
    SERVICIO: 'Servicio',
    LICENCIA: 'Licencia',
}

export function PurchaseDetailsDialog({ purchase, isOpen, onClose }: PurchaseDetailsDialogProps) {
    const isPDFAvailable = purchase.vendorLink && purchase.vendorLink.startsWith('data:application/pdf')

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{purchase.title}</DialogTitle>
                    <DialogDescription>
                        Detalles completos de la solicitud de compra
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Status and Priority */}
                    <div className="flex flex-wrap gap-3">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Estado</p>
                            <Badge
                                variant="outline"
                                className={STATUS_COLORS[purchase.status as keyof typeof STATUS_COLORS]}
                            >
                                {STATUS_LABELS[purchase.status as keyof typeof STATUS_LABELS] || purchase.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Urgencia</p>
                            <Badge
                                variant="outline"
                                className={PRIORITY_COLORS[purchase.priority as keyof typeof PRIORITY_COLORS]}
                            >
                                {purchase.priority}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Tipo</p>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                {TYPE_LABELS[purchase.type as keyof typeof TYPE_LABELS]}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-700 mb-1">Monto Estimado</p>
                            <p className="text-2xl font-bold text-[#1CB7BE]">
                                ${purchase.estimatedAmount.toFixed(2)}
                            </p>
                        </div>
                        {purchase.vendor && (
                            <div>
                                <p className="text-sm font-semibold text-slate-700 mb-1">Proveedor</p>
                                <p className="text-lg text-slate-800">{purchase.vendor}</p>
                            </div>
                        )}
                    </div>

                    {purchase.project && (
                        <div>
                            <p className="text-sm font-semibold text-slate-700 mb-1">Proyecto Vinculado</p>
                            <Link
                                href={`/projects/${purchase.project.id}`}
                                className="text-[#1CB7BE] hover:underline font-medium"
                            >
                                {purchase.project.name}
                            </Link>
                        </div>
                    )}

                    <Separator />

                    {/* Description */}
                    <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Descripción Técnica</p>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <p className="text-slate-700 whitespace-pre-wrap">{purchase.description}</p>
                        </div>
                    </div>

                    {/* Justification */}
                    <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Justificación</p>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <p className="text-slate-700 whitespace-pre-wrap">{purchase.justification}</p>
                        </div>
                    </div>

                    {/* PDF Quotation */}
                    {isPDFAvailable && (
                        <div>
                            <p className="text-sm font-semibold text-slate-700 mb-2">Cotización PDF</p>
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <iframe
                                    src={purchase.vendorLink!}
                                    className="w-full h-96"
                                    title="PDF Cotización"
                                />
                            </div>
                            <a
                                href={purchase.vendorLink!}
                                download={`cotizacion-${purchase.id}.pdf`}
                                className="inline-flex items-center gap-2 mt-2 text-sm text-[#1CB7BE] hover:underline"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Descargar PDF
                            </a>
                        </div>
                    )}

                    <Separator />

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-slate-500">Creado</p>
                            <p className="text-slate-700 font-medium">
                                {new Date(purchase.createdAt).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">Última actualización</p>
                            <p className="text-slate-700 font-medium">
                                {new Date(purchase.updatedAt).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={onClose} variant="outline">
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
