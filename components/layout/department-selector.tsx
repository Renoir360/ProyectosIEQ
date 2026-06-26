'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { setCookie } from 'cookies-next'
import { useRouter } from 'next/navigation'
import { UserRole } from '@prisma/client' // Adjust import based on your setup

interface DepartmentSelectorProps {
    userRole?: string
    currentDept?: string
    className?: string
}

export function DepartmentSelector({ userRole, currentDept, className }: DepartmentSelectorProps) {
    const router = useRouter()

    if (userRole !== 'PRESIDENCIA') return null

    const handleDeptChange = (value: string) => {
        setCookie('selected_department', value, { path: '/' })
        router.refresh()
    }

    return (
        <div className={className}>
            <div className="flex flex-col items-end gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Vista Departamental
                </label>
                <Select onValueChange={handleDeptChange} defaultValue={currentDept || "GLOBAL"}>
                    <SelectTrigger className="w-[180px] bg-white/60 border-slate-200 h-8 text-xs font-semibold">
                        <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="GLOBAL">Global (Todos)</SelectItem>
                        <SelectItem value="SISTEMAS">Sistemas</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
