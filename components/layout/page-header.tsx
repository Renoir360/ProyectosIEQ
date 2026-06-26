'use client'

import { ReactNode } from 'react'
import { MotionWrapper } from '@/components/ui/motion-wrapper'
import { CompactUserMenu } from '@/components/ui/compact-user-menu'
import { DepartmentSelector } from '@/components/layout/department-selector'

interface PageHeaderProps {
    title: ReactNode
    subtitle?: string
    actions?: ReactNode
    userName?: string
    userRole?: string
    selectedDept?: string
}

export function PageHeader({ title, subtitle, actions, userName, userRole, selectedDept }: PageHeaderProps) {
    return (
        <MotionWrapper direction="down">
            <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8 mb-2">
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    {userRole === 'PRESIDENCIA' && (
                        <DepartmentSelector currentDept={selectedDept} userRole={userRole} />
                    )}
                    {userName && <CompactUserMenu userName={userName} />}
                </div>

                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand,#1CB7BE)]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-slate-600 font-semibold max-w-2xl leading-relaxed text-base sm:text-lg">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && <div className="flex flex-wrap gap-3 items-center">{actions}</div>}
                </div>
            </div>
        </MotionWrapper>
    )
}
