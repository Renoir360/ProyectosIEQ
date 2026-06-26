'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExternalLink, Eye, Pencil, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { PurchaseStatusDialog } from './purchase-status-dialog'
import { PurchaseDetailsDialog } from './purchase-details-dialog'

type PurchaseRequest = {
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

type PurchaseTableProps = {
    purchases: PurchaseRequest[]
    userRole?: string
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

export function PurchaseTable({ purchases, userRole }: PurchaseTableProps) {
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRequest | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    const shareOnWhatsApp = (purchase: PurchaseRequest) => {
        const amount = new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(purchase.estimatedAmount)
        const projectName = purchase.project?.name || 'Global'
        const link = `https://proyectos-ieq.vercel.app/compras`
        
        const text = `Hola Presidencia, desde el departamento de Sistemas se solicita la compra de *${purchase.title}* por un monto de *${amount}* para el proyecto *${projectName}*.\n\nPor favor revise y autorice aquí: ${link}`
        
        const presidenciaPhone = process.env.NEXT_PUBLIC_PRESIDENCIA_PHONE || ''
        const waUrl = presidenciaPhone 
            ? `https://wa.me/${presidenciaPhone}?text=${encodeURIComponent(text)}`
            : `https://wa.me/?text=${encodeURIComponent(text)}`
            
        window.open(waUrl, '_blank')
    }

    const handleEditStatus = (purchase: PurchaseRequest) => {
        setSelectedPurchase(purchase)
        setIsDialogOpen(true)
    }

    const handleViewDetails = (purchase: PurchaseRequest) => {
        setSelectedPurchase(purchase)
        setIsDetailsOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setSelectedPurchase(null)
    }

    const handleCloseDetails = () => {
        setIsDetailsOpen(false)
        setSelectedPurchase(null)
    }

    if (purchases.length === 0) {
        return (
            <div className="glass-card rounded-xl p-12 text-center border border-white/20">
                <p className="text-slate-500 text-lg">No se encontraron solicitudes de compra.</p>
            </div>
        )
    }

    return (
        <div className="glass-card rounded-xl overflow-hidden border border-white/20 shadow-lg">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 bg-white/5">
                            <TableHead className="font-bold text-slate-700">#</TableHead>
                            <TableHead className="font-bold text-slate-700">Título</TableHead>
                            <TableHead className="font-bold text-slate-700">Tipo</TableHead>
                            <TableHead className="font-bold text-slate-700">Monto</TableHead>
                            <TableHead className="font-bold text-slate-700">Urgencia</TableHead>
                            <TableHead className="font-bold text-slate-700">Estado</TableHead>
                            <TableHead className="font-bold text-slate-700">Proyecto</TableHead>
                            <TableHead className="font-bold text-slate-700">Creado</TableHead>
                            <TableHead className="font-bold text-slate-700 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchases.map((purchase, idx) => (
                            <TableRow key={purchase.id} className="border-white/10 hover:bg-white/5">
                                <TableCell className="font-medium text-slate-600">{idx + 1}</TableCell>
                                <TableCell className="font-semibold text-slate-800 max-w-xs truncate">
                                    {purchase.title}
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-slate-600">
                                        {TYPE_LABELS[purchase.type as keyof typeof TYPE_LABELS]}
                                    </span>
                                </TableCell>
                                <TableCell className="font-bold text-[#1CB7BE]">
                                    ${purchase.estimatedAmount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={PRIORITY_COLORS[purchase.priority as keyof typeof PRIORITY_COLORS]}
                                    >
                                        {purchase.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={STATUS_COLORS[purchase.status as keyof typeof STATUS_COLORS]}
                                    >
                                        {STATUS_LABELS[purchase.status as keyof typeof STATUS_LABELS] || purchase.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                    {purchase.project ? (
                                        <Link href={`/projects/${purchase.project.id}`} className="hover:text-[#1CB7BE] transition-colors">
                                            {purchase.project.name}
                                        </Link>
                                    ) : (
                                        <span className="text-slate-400 italic">Sin proyecto</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                    {new Date(purchase.createdAt).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: '2-digit'
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {purchase.vendorLink && (
                                            <a
                                                href={purchase.vendorLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-500 hover:text-[#1CB7BE] transition-colors"
                                                title="Ver cotización"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            title="Ver detalles"
                                            onClick={() => handleViewDetails(purchase)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                            title="Compartir por WhatsApp"
                                            onClick={() => shareOnWhatsApp(purchase)}
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                        </Button>

                                        {/* Actions based on Role */}
                                        {userRole === 'SISTEMAS' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                title="Editar estado"
                                                onClick={() => handleEditStatus(purchase)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}

                                        {userRole === 'PRESIDENCIA' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                title="Gestionar Solicitud"
                                                onClick={() => handleEditStatus(purchase)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
                {purchases.map((purchase, idx) => (
                    <div
                        key={purchase.id}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="text-xs text-slate-500 mb-1">#{idx + 1}</div>
                                <h3 className="font-semibold text-slate-800 mb-2">{purchase.title}</h3>
                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className={STATUS_COLORS[purchase.status as keyof typeof STATUS_COLORS]}
                                    >
                                        {STATUS_LABELS[purchase.status as keyof typeof STATUS_LABELS] || purchase.status.replace('_', ' ')}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={PRIORITY_COLORS[purchase.priority as keyof typeof PRIORITY_COLORS]}
                                    >
                                        {purchase.priority}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-[#1CB7BE] text-lg">
                                    ${purchase.estimatedAmount.toFixed(2)}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {TYPE_LABELS[purchase.type as keyof typeof TYPE_LABELS]}
                                </div>
                            </div>
                        </div>

                        {purchase.project && (
                            <div className="text-sm text-slate-600">
                                Proyecto: <Link href={`/projects/${purchase.project.id}`} className="text-[#1CB7BE] hover:underline">
                                    {purchase.project.name}
                                </Link>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <div className="text-xs text-slate-500">
                                {new Date(purchase.createdAt).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit'
                                })}
                            </div>
                            <div className="flex gap-2">
                                {purchase.vendorLink && (
                                    <a
                                        href={purchase.vendorLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-500 hover:text-[#1CB7BE]"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => shareOnWhatsApp(purchase)}
                                    title="Compartir por WhatsApp"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleViewDetails(purchase)}
                                    title="Ver detalles"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEditStatus(purchase)}
                                    title="Editar estado"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Change Dialog */}
            {selectedPurchase && (
                <PurchaseStatusDialog
                    purchaseId={selectedPurchase.id}
                    currentStatus={selectedPurchase.status}
                    title={selectedPurchase.title}
                    isOpen={isDialogOpen}
                    onClose={handleCloseDialog}
                />
            )}

            {/* Details Dialog */}
            {selectedPurchase && (
                <PurchaseDetailsDialog
                    purchase={selectedPurchase}
                    isOpen={isDetailsOpen}
                    onClose={handleCloseDetails}
                />
            )}
        </div>
    )
}
