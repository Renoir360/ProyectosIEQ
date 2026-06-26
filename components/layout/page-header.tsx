'use client'

import { ReactNode } from 'react'
import { MotionWrapper } from '@/components/ui/motion-wrapper'
import { CompactUserMenu } from '@/components/ui/compact-user-menu'

interface PageHeaderProps {
    title: ReactNode
    subtitle?: string
    actions?: ReactNode
    userName?: string
    userRole?: string
}

export function PageHeader({ title, subtitle, actions, userName }: PageHeaderProps) {
    return (
        <MotionWrapper direction="down">
            <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-6 sm:p-8 mb-2">
                <div className="absolute top-4 right-4 z-20">
                    {userName && <CompactUserMenu userName={userName} />}
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-slate-600 dark:text-slate-400 font-semibold max-w-2xl leading-relaxed text-base sm:text-lg">
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
