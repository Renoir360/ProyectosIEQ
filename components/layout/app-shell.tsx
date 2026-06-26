'use client'

import { FloatingBlobs } from "@/components/ui/floating-blobs"
import { BackgroundGrid } from "@/components/ui/background-grid"

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen dashboard-bg isolate">
            <BackgroundGrid />
            <FloatingBlobs />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}
