'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'

interface Props {
    children?: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    private handleRetry = () => {
        this.setState({ hasError: false })
        window.location.reload()
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 glass-card border-red-200/50 rounded-2xl text-center space-y-6">
                    <div className="bg-red-50 p-4 rounded-full">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Algo salió mal</h2>
                        <p className="text-slate-600 max-w-md mx-auto">
                            Hubo un error al cargar esta sección. Por favor, intenta de nuevo.
                        </p>
                    </div>
                    <Button
                        onClick={this.handleRetry}
                        className="bg-[#1CB7BE] hover:bg-[#1CB7BE]/90 text-white font-bold gap-2"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Reintentar
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
}
