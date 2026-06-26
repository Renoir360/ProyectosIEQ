'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Database, Copy } from 'lucide-react'
import { useState } from 'react'

export function EmptyState() {
    const [copied, setCopied] = useState(false)

    const copyCommand = () => {
        navigator.clipboard.writeText('npm run seed')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-6">
            <Card className="max-w-2xl w-full shadow-lg">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                        <Database className="h-8 w-8 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl">Base de Datos Vacía</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                            <div className="space-y-2">
                                <p className="font-medium text-amber-900">No se encontraron proyectos</p>
                                <p className="text-sm text-amber-700">
                                    La base de datos no contiene datos iniciales. Ejecuta el script de seed para cargar los proyectos de ejemplo.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900">Pasos para inicializar:</h3>
                        <ol className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">1.</span>
                                <span>Verifica que <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">DATABASE_URL</code> y <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">DIRECT_URL</code> estén configurados en tu archivo <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">.env</code></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">2.</span>
                                <span>Ejecuta el siguiente comando en tu terminal:</span>
                            </li>
                        </ol>

                        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm flex items-center justify-between">
                            <code>npm run seed</code>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-100 hover:bg-slate-800"
                                onClick={copyCommand}
                            >
                                {copied ? (
                                    <span className="text-green-400">✓ Copiado</span>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copiar
                                    </>
                                )}
                            </Button>
                        </div>

                        <ol className="space-y-2 text-sm text-slate-600" start={3}>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">3.</span>
                                <span>Recarga esta página después de ejecutar el seed</span>
                            </li>
                        </ol>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold text-slate-900 mb-2">Para Deploy en Vercel:</h3>
                        <ul className="space-y-1 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                <span>Configura las variables de entorno en Vercel Dashboard</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                <span>El seed se ejecutará automáticamente en el primer deploy</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
