'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function LogoutButton() {
    const router = useRouter()
    const { toast } = useToast()

    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', { method: 'DELETE' })
            toast({
                title: 'Sesión cerrada',
                description: 'Has cerrado sesión correctamente.',
            })
            router.push('/login')
            router.refresh()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
        >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
        </Button>
    )
}
