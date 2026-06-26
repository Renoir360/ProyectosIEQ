'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export function AcceptanceCriteria({ projectName }: { projectName: string }) {
    // Define criteria based on project type
    const getCriteria = () => {
        if (projectName.includes('WiFi') || projectName.includes('AP')) {
            return {
                title: 'Criterios de Aceptación - Access Points',
                items: [
                    'Punto de red activo con PoE funcional',
                    'AP adoptado correctamente en controlador',
                    'SSIDs publicados y visibles',
                    'Cobertura RF validada en área',
                    'Documentación as-built completada',
                    'Aceptación formal del área'
                ]
            }
        } else if (projectName.includes('Cámara') || projectName.includes('DVR')) {
            return {
                title: 'Criterios de Aceptación - Videovigilancia',
                items: [
                    'Conectividad de red validada',
                    'Acceso remoto funcional',
                    'Grabación continua verificada',
                    'Calidad de imagen aceptable',
                    'Almacenamiento configurado',
                    'Documentación de IPs y ubicaciones'
                ]
            }
        } else {
            return {
                title: 'Criterios de Aceptación - General',
                items: [
                    'Instalación física completada',
                    'Configuración validada',
                    'Pruebas funcionales exitosas',
                    'Documentación actualizada',
                    'Capacitación realizada (si aplica)',
                    'Aceptación formal del usuario'
                ]
            }
        }
    }

    const criteria = getCriteria()

    return (
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg text-blue-900">{criteria.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {criteria.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
