'use client'

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen dashboard-bg">
            {children}
        </div>
    )
}
