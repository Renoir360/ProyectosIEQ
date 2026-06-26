import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export default function PurchasesLoading() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 min-h-screen">
            {/* Header Skeleton */}
            <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8 mb-2">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-96" />
                </div>
            </div>

            <div className="relative z-10 space-y-6">
                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

                {/* Filters Skeleton */}
                <div className="glass-card p-6 rounded-xl border border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="glass-card rounded-xl overflow-hidden border border-white/20 shadow-xl">
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 border-b border-white/10 last:border-0">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="flex gap-4">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
