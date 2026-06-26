'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

export function PurchaseStatsCards() {
    const searchParams = useSearchParams()
    const queryString = searchParams.toString()
    const url = `/api/purchases/stats${queryString ? `?${queryString}` : ''}`

    const { data, error, isLoading } = useQuery({
        queryKey: ['purchases', 'stats', queryString],
        queryFn: async () => {
            const res = await fetch(url)
            if (!res.ok) throw new Error('Network response was not ok')
            return res.json()
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    })

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="glass-card border-white/20">
                        <CardHeader className="pb-3">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (error || !data) {
        return null
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Compras 2026 */}
            <Card className="glass-card border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-600">
                        Total Compras
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        <p className="text-3xl font-bold text-[#1CB7BE]">
                            ${data.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500">
                            {data.total} {data.total === 1 ? 'solicitud' : 'solicitudes'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Pendientes */}
            <Card className="glass-card border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-600">
                        Pendientes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        <p className="text-3xl font-bold text-yellow-600">
                            {data.pending}
                        </p>
                        <p className="text-sm text-slate-500">
                            {data.pending === 1 ? 'solicitud' : 'solicitudes'}
                        </p>
                        <p className="text-xs text-yellow-600 font-medium mt-2">
                            EN REVISIÓN
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Completadas */}
            <Card className="glass-card border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-600">
                        Completadas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        <p className="text-3xl font-bold text-green-600">
                            {data.approved}
                        </p>
                        <p className="text-sm text-slate-500">
                            {data.approved === 1 ? 'solicitud' : 'solicitudes'}
                        </p>
                        <p className="text-xs text-green-600 font-medium mt-2">
                            RECIBIDAS
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
