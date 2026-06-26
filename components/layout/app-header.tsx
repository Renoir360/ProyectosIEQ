'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/ui/logout-button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { setCookie } from 'cookies-next'

type AppHeaderProps = {
    user: any // TODO: Fix type
    title?: React.ReactNode
    showDeptSelector?: boolean
    children?: React.ReactNode
}

export function AppHeader({ user, title, showDeptSelector = false, children }: AppHeaderProps) {
    const router = useRouter()

    const handleDeptChange = (value: string) => {
        // Set cookie
        setCookie('selected_department', value)
        router.refresh()
    }

    return (
        <div className="relative overflow-hidden glass-card !bg-white/5 text-slate-900 rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl border border-white/40 mb-2">
            {/* User profile - responsive positioning */}
            <div className="md:absolute md:top-4 md:right-4 z-20 flex items-center justify-end gap-4 mb-4 md:mb-0">
                {user && (
                    <div className="flex items-center gap-3 bg-white/40 dark:bg-black/20 px-3 py-1.5 sm:px-4 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
                        <div className="flex flex-col items-end">
                            <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Bienvenido</span>
                            <span className="text-xs sm:text-sm font-extrabold text-[#1CB7BE] leading-none">{user.name}</span>
                        </div>
                        <div className="h-6 sm:h-8 w-px bg-slate-200 dark:bg-white/10 mx-1" />
                        <LogoutButton />
                    </div>
                )}
            </div>

            {/* Internal decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1CB7BE]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        {/* Logo */}
                        <div className="relative h-12 w-12 flex-shrink-0">
                            <img src="/logo-ieq.png" alt="IEQ" className="h-full w-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
                                WorkCenter
                            </h1>
                            <p className="text-sm font-bold text-[#1CB7BE]">Clínica IEQ</p>
                        </div>
                    </div>

                    {title && <div className="mt-2">{title}</div>}

                    {/* Department Selector for GLOBAL users (Presidencia) */}
                    {showDeptSelector && user?.role === 'PRESIDENCIA' && ( // Using role PRESIDENCIA as proxy for GLOBAL/Presidencia check
                        <div className="mt-4 w-64">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                Ver Departamento:
                            </label>
                            <Select onValueChange={handleDeptChange} defaultValue="GLOBAL">
                                <SelectTrigger className="bg-white/60 border-slate-200">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GLOBAL">Todos (Global)</SelectItem>
                                    <SelectItem value="SISTEMAS">Sistemas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Decorative right side & Actions */}
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    {children}
                </div>
            </div>
        </div>
    )
}
