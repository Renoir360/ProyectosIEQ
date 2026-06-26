import { AppShell } from "@/components/layout/app-shell"

export default function ComprasLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AppShell>{children}</AppShell>
}
