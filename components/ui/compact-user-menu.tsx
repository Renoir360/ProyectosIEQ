'use client'

import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useState, useEffect, useRef } from 'react'

interface CompactUserMenuProps {
    userName: string
}

export function CompactUserMenu({ userName }: CompactUserMenuProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }
    }, [isOpen])

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
        <div className="relative" ref={menuRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-9 w-9 rounded-full bg-[#1CB7BE]/10 hover:bg-[#1CB7BE]/20 text-[#1CB7BE] border border-[#1CB7BE]/30"
            >
                <User className="h-4 w-4" />
            </Button>

            {/* Popup menu - appears on click */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Usuario</p>
                        <p className="text-sm font-medium text-slate-900 mt-0.5">{userName}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            )}
        </div>
    )
}
