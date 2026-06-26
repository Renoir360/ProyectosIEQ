'use client'

import { useState } from 'react'
import { Download, Loader } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ExportPDFButtonProps {
    projectId: string
    projectName: string
}

// Colores corporativos IEQ
const COLORS: Record<string, [number, number, number]> = {
    teal: [28, 183, 190],
    tealLight: [200, 245, 247],
    dark: [30, 41, 59],
    white: [255, 255, 255],
    gray: [100, 100, 100],
    grayLight: [240, 240, 240],
    success: [22, 163, 74],
    warning: [245, 158, 11],
    info: [59, 130, 246],
    muted: [148, 163, 184]
}

const STATUS_COLORS: Record<string, [number, number, number]> = {
    DONE: [22, 163, 74],
    IN_PROGRESS: [59, 130, 246],
    READY: [245, 158, 11],
    BACKLOG: [148, 163, 184]
}

const STATUS_LABELS: Record<string, string> = {
    DONE: 'COMPLETADO',
    IN_PROGRESS: 'EN PROGRESO',
    READY: 'LISTO',
    BACKLOG: 'PENDIENTE'
}

export function ExportPDFButton({ projectId, projectName }: ExportPDFButtonProps) {
    const [loading, setLoading] = useState(false)

    // Función para cargar el logo como base64
    const loadLogo = async (): Promise<string> => {
        try {
            const response = await fetch('/logo-ieq.png')
            const blob = await response.blob()
            return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.readAsDataURL(blob)
            })
        } catch {
            return ''
        }
    }

    // Dibujar barra de progreso
    const drawProgressBar = (pdf: jsPDF, x: number, y: number, width: number, percentage: number, color: [number, number, number]) => {
        const height = 6
        // Fondo gris
        pdf.setFillColor(240, 240, 240)
        pdf.roundedRect(x, y, width, height, 2, 2, 'F')
        // Barra de progreso
        const fillWidth = (percentage / 100) * width
        pdf.setFillColor(color[0], color[1], color[2])
        if (fillWidth > 0) {
            pdf.roundedRect(x, y, fillWidth, height, 2, 2, 'F')
        }
        // Texto del porcentaje
        pdf.setFontSize(8)
        pdf.setTextColor(60, 60, 60)
        pdf.text(`${percentage}%`, x + width + 3, y + 4.5)
    }

    // Dibujar tarjeta KPI
    const drawKPICard = (pdf: jsPDF, x: number, y: number, width: number, label: string, value: string, color: [number, number, number]) => {
        const height = 22
        // Card background
        pdf.setFillColor(250, 250, 250)
        pdf.setDrawColor(230, 230, 230)
        pdf.roundedRect(x, y, width, height, 3, 3, 'FD')
        // Color indicator strip
        pdf.setFillColor(color[0], color[1], color[2])
        pdf.rect(x, y, 4, height, 'F')
        // Value
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(color[0], color[1], color[2])
        pdf.text(value, x + 8, y + 11)
        // Label
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 100, 100)
        pdf.text(label, x + 8, y + 17)
    }

    const handleExport = async () => {
        try {
            setLoading(true)

            const response = await fetch(`/api/projects/${projectId}/export-pdf`)
            if (!response.ok) throw new Error('Error fetching project data')

            const data = await response.json()

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'letter'
            })

            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()

            // Márgenes estándar tamaño carta
            const MARGIN = {
                left: 25,    // 25mm = 1 pulgada
                right: 20,   // 20mm = 0.8 pulgadas
                top: 25,     // 25mm = 1 pulgada
                bottom: 25   // 25mm = 1 pulgada
            }
            const contentWidth = pageWidth - MARGIN.left - MARGIN.right

            // Cargar logo
            const logoBase64 = await loadLogo()

            // ========== PÁGINA 1: PORTADA Y DASHBOARD ==========
            // Header con logo (proporción ajustada - solo portada)
            if (logoBase64) {
                pdf.addImage(logoBase64, 'PNG', MARGIN.left, MARGIN.top, 25, 25)
            }

            // Título del reporte
            pdf.setFontSize(10)
            pdf.setTextColor(150, 150, 150)
            pdf.text('REPORTE DE PROYECTO', pageWidth - MARGIN.right, MARGIN.top + 5, { align: 'right' })
            pdf.setFontSize(8)
            pdf.text(`Generado: ${new Date().toLocaleDateString('es-VE')}`, pageWidth - MARGIN.right, MARGIN.top + 10, { align: 'right' })

            // Línea divisoria
            pdf.setDrawColor(28, 183, 190)
            pdf.setLineWidth(0.5)
            pdf.line(MARGIN.left, 50, pageWidth - MARGIN.right, 50)

            // Título del proyecto
            let currentY = 60
            pdf.setFontSize(22)
            pdf.setFont('helvetica', 'bold')
            pdf.setTextColor(30, 41, 59)
            const titleLines = pdf.splitTextToSize(data.project.name, contentWidth)
            pdf.text(titleLines, MARGIN.left, currentY)
            currentY += titleLines.length * 8 + 5

            // Estado del proyecto badge
            const statusLabelsProj: Record<string, string> = {
                ACTIVE: 'ACTIVO',
                COMPLETED: 'COMPLETADO',
                ARCHIVED: 'ARCHIVADO'
            }
            const statusColor = data.project.status === 'ACTIVE' ? COLORS.success :
                data.project.status === 'COMPLETED' ? COLORS.teal : COLORS.gray
            pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2])
            pdf.roundedRect(MARGIN.left, currentY - 4, 30, 8, 2, 2, 'F')
            pdf.setFontSize(8)
            pdf.setTextColor(255, 255, 255)
            pdf.text(statusLabelsProj[data.project.status] || data.project.status, MARGIN.left + 3, currentY + 1)
            currentY += 15

            // Descripción
            if (data.project.description) {
                pdf.setFontSize(10)
                pdf.setFont('helvetica', 'normal')
                pdf.setTextColor(80, 80, 80)
                const descLines = pdf.splitTextToSize(data.project.description, contentWidth)
                pdf.text(descLines, MARGIN.left, currentY)
                currentY += descLines.length * 4.5 + 10
            }

            // ========== DASHBOARD DE MÉTRICAS ==========
            pdf.setFontSize(14)
            pdf.setFont('helvetica', 'bold')
            pdf.setTextColor(28, 183, 190)
            pdf.text('Dashboard de Progreso', MARGIN.left, currentY)
            currentY += 8

            // Barra de progreso principal
            pdf.setFontSize(10)
            pdf.setTextColor(60, 60, 60)
            pdf.setFont('helvetica', 'normal')
            pdf.text(`Progreso General: ${data.stats.progressPercentage}%`, MARGIN.left, currentY + 4)
            drawProgressBar(pdf, MARGIN.left + 70, currentY, contentWidth - 100, data.stats.progressPercentage, COLORS.teal)
            currentY += 12

            // KPI Cards
            const cardWidth = (contentWidth - 15) / 4
            const cardSpacing = 5
            const startX = MARGIN.left

            drawKPICard(pdf, startX, currentY, cardWidth, 'Total Tareas', `${data.stats.totalTasks}`, COLORS.dark)
            drawKPICard(pdf, startX + cardWidth + cardSpacing, currentY, cardWidth, 'Completadas', `${data.stats.doneTasks}`, COLORS.success)
            drawKPICard(pdf, startX + (cardWidth + cardSpacing) * 2, currentY, cardWidth, 'En Progreso', `${data.stats.inProgressTasks}`, COLORS.info)
            drawKPICard(pdf, startX + (cardWidth + cardSpacing) * 3, currentY, cardWidth, 'Pendientes', `${data.stats.backlogTasks + data.stats.readyTasks}`, COLORS.warning)
            currentY += 32

            // ========== TABLA DE DISTRIBUCIÓN POR ESTADO ==========
            pdf.setFontSize(12)
            pdf.setFont('helvetica', 'bold')
            pdf.setTextColor(28, 183, 190)
            pdf.text('Distribución por Estado', MARGIN.left, currentY)
            currentY += 5

            const statusValues = [
                data.stats.doneTasks,
                data.stats.inProgressTasks,
                data.stats.readyTasks,
                data.stats.backlogTasks
            ]
            const statusColors = [COLORS.success, COLORS.info, COLORS.warning, COLORS.muted]

            autoTable(pdf, {
                startY: currentY,
                head: [['Estado', 'Cantidad', 'Porcentaje', 'Progreso']],
                body: [
                    ['Completadas', data.stats.doneTasks, `${data.stats.totalTasks > 0 ? Math.round((data.stats.doneTasks / data.stats.totalTasks) * 100) : 0}%`, ''],
                    ['En Progreso', data.stats.inProgressTasks, `${data.stats.totalTasks > 0 ? Math.round((data.stats.inProgressTasks / data.stats.totalTasks) * 100) : 0}%`, ''],
                    ['Listas', data.stats.readyTasks, `${data.stats.totalTasks > 0 ? Math.round((data.stats.readyTasks / data.stats.totalTasks) * 100) : 0}%`, ''],
                    ['Pendientes', data.stats.backlogTasks, `${data.stats.totalTasks > 0 ? Math.round((data.stats.backlogTasks / data.stats.totalTasks) * 100) : 0}%`, '']
                ],
                theme: 'striped',
                margin: { left: MARGIN.left, right: MARGIN.right },
                headStyles: {
                    fillColor: [28, 183, 190],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 9
                },
                bodyStyles: {
                    fontSize: 9,
                    textColor: 60
                },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 25, halign: 'center' },
                    2: { cellWidth: 25, halign: 'center' },
                    3: { cellWidth: 'auto' }
                },
                styles: {
                    cellPadding: 3,
                    lineColor: [230, 230, 230],
                    lineWidth: 0.1
                },
                didDrawCell: (hookData: any) => {
                    if (hookData.section === 'body' && hookData.column.index === 3) {
                        const rowIdx = hookData.row.index
                        const percentage = data.stats.totalTasks > 0
                            ? Math.round((statusValues[rowIdx] / data.stats.totalTasks) * 100)
                            : 0
                        const color = statusColors[rowIdx]
                        const cell = hookData.cell
                        const x = cell.x + 2
                        const y = cell.y + 3
                        const width = cell.width - 15
                        const height = 4

                        // Fondo gris
                        pdf.setFillColor(240, 240, 240)
                        pdf.roundedRect(x, y, width, height, 1, 1, 'F')

                        // Barra de progreso coloreada
                        const fillWidth = (percentage / 100) * width
                        if (fillWidth > 0) {
                            pdf.setFillColor(color[0], color[1], color[2])
                            pdf.roundedRect(x, y, fillWidth, height, 1, 1, 'F')
                        }

                        // Texto del porcentaje al lado
                        pdf.setFontSize(8)
                        pdf.setTextColor(80, 80, 80)
                        pdf.text(`${percentage}%`, x + width + 3, y + 3)
                    }
                }
            })

            currentY = (pdf as any).lastAutoTable.finalY + 10

            // ========== TABLA DE ÁREAS ==========
            if (data.areas.length > 0) {
                // Calcular altura estimada de la tabla (cabeza + filas)
                const estimatedTableHeight = 15 + (data.areas.length * 10)
                const spaceNeeded = estimatedTableHeight + 30 // + margen de seguridad
                
                // Si la tabla es muy larga o no cabe bien, saltar a nueva página
                if (currentY > pageHeight - MARGIN.bottom - spaceNeeded || data.areas.length > 6) {
                    pdf.addPage()
                    currentY = MARGIN.top + 5
                }

                pdf.setFontSize(12)
                pdf.setFont('helvetica', 'bold')
                pdf.setTextColor(28, 183, 190)
                pdf.text('Progreso por Áreas de Trabajo', MARGIN.left, currentY)
                currentY += 5

                const areaData = data.areas.map((area: any) => {
                    const percentage = area.taskCount > 0
                        ? Math.round((area.doneCount / area.taskCount) * 100)
                        : 0
                    return [
                        area.name,
                        `${area.doneCount}/${area.taskCount}`,
                        `${percentage}%`,
                        ''
                    ]
                })

                autoTable(pdf, {
                    startY: currentY,
                    head: [['Área', 'Tareas (Completas/Total)', 'Porcentaje', 'Progreso']],
                    body: areaData,
                    theme: 'striped',
                    margin: { left: MARGIN.left, right: MARGIN.right },
                    tableWidth: 'auto',
                    headStyles: {
                        fillColor: [28, 183, 190],
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 9
                    },
                    bodyStyles: {
                        fontSize: 9,
                        textColor: 60
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 45, halign: 'center' },
                        2: { cellWidth: 25, halign: 'center' },
                        3: { cellWidth: 'auto' }
                    },
                    styles: {
                        cellPadding: 3,
                        lineColor: [230, 230, 230],
                        lineWidth: 0.1,
                        overflow: 'linebreak'
                    },
                    didDrawCell: (cellData: any) => {
                        if (cellData.section === 'body' && cellData.column.index === 3) {
                            const areaIdx = cellData.row.index
                            const area = data.areas[areaIdx]
                            const percentage = area.taskCount > 0
                                ? Math.round((area.doneCount / area.taskCount) * 100)
                                : 0
                            const color: [number, number, number] = percentage >= 80 ? COLORS.success :
                                percentage >= 50 ? COLORS.info :
                                    percentage >= 25 ? COLORS.warning : COLORS.muted

                            const cell = cellData.cell
                            const x = cell.x + 2
                            const y = cell.y + 3
                            const width = cell.width - 15
                            const height = 4

                            // Fondo gris
                            pdf.setFillColor(240, 240, 240)
                            pdf.roundedRect(x, y, width, height, 1, 1, 'F')

                            // Barra de progreso coloreada
                            const fillWidth = (percentage / 100) * width
                            if (fillWidth > 0) {
                                pdf.setFillColor(color[0], color[1], color[2])
                                pdf.roundedRect(x, y, fillWidth, height, 1, 1, 'F')
                            }

                            // Texto del porcentaje al lado
                            pdf.setFontSize(8)
                            pdf.setTextColor(80, 80, 80)
                            pdf.text(`${percentage}%`, x + width + 3, y + 3)
                        }
                    }
                })

                currentY = (pdf as any).lastAutoTable.finalY + 15
            }

            // ========== PÁGINA 2+: TAREAS DETALLADAS ==========
            if (data.tasks.length > 0) {
                // Solo agregar página nueva si no hay espacio suficiente
                const spaceAvailable = pageHeight - MARGIN.bottom - currentY
                const minSpaceNeeded = 100 // mm mínimos para la tabla de listado
                const needsNewPage = spaceAvailable < minSpaceNeeded
                
                if (needsNewPage) {
                    pdf.addPage()
                    currentY = MARGIN.top + 5
                }

                // Header (solo si es nueva página, sino continuar desde currentY)
                if (needsNewPage) {
                    pdf.setFontSize(14)
                    pdf.setFont('helvetica', 'bold')
                    pdf.setTextColor(28, 183, 190)
                    pdf.text('TAREAS DETALLADAS', MARGIN.left, MARGIN.top + 5)
                    pdf.setFontSize(9)
                    pdf.setFont('helvetica', 'normal')
                    pdf.setTextColor(150, 150, 150)
                    pdf.text(`Proyecto: ${data.project.name}`, pageWidth - MARGIN.right, MARGIN.top + 5, { align: 'right' })
                    pdf.setDrawColor(28, 183, 190)
                    pdf.setLineWidth(0.5)
                    pdf.line(MARGIN.left, MARGIN.top + 12, pageWidth - MARGIN.right, MARGIN.top + 12)
                    currentY = MARGIN.top + 18
                } else {
                    // Si continúa en la misma página, agregar espacio y título simple
                    currentY += 10
                    pdf.setFontSize(12)
                    pdf.setFont('helvetica', 'bold')
                    pdf.setTextColor(28, 183, 190)
                    pdf.text('TAREAS DETALLADAS', MARGIN.left, currentY)
                    currentY += 10
                }

                // Preparar datos de tareas para tabla
                const taskTableData = data.tasks.map((task: any) => {
                    const status = STATUS_LABELS[task.status] || task.status
                    const responsible = task.responsible || 'Sin asignar'
                    const dueDate = task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('es-VE')
                        : 'Sin fecha'
                    return [task.title, status, responsible, dueDate]
                })

                pdf.setFontSize(11)
                pdf.setFont('helvetica', 'bold')
                pdf.setTextColor(28, 183, 190)
                pdf.text('Listado de Tareas', MARGIN.left, currentY)
                currentY += 5

                autoTable(pdf, {
                    startY: currentY,
                    head: [['Tarea', 'Estado', 'Responsable', 'Fecha Límite']],
                    body: taskTableData,
                    theme: 'striped',
                    margin: { left: MARGIN.left, right: MARGIN.right },
                    headStyles: {
                        fillColor: [28, 183, 190],
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 8
                    },
                    bodyStyles: {
                        fontSize: 8,
                        textColor: 60
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 30, halign: 'center' },
                        2: { cellWidth: 40 },
                        3: { cellWidth: 30, halign: 'center' }
                    },
                    styles: {
                        cellPadding: 2,
                        lineColor: [230, 230, 230],
                        lineWidth: 0.1,
                        overflow: 'linebreak'
                    },
                    didParseCell: (cellData: any) => {
                        if (cellData.section === 'body' && cellData.column.index === 1) {
                            const status = cellData.cell.text[0]
                            const color: [number, number, number] = status === 'COMPLETADO' ? COLORS.success :
                                status === 'EN PROGRESO' ? COLORS.info :
                                    status === 'LISTO' ? COLORS.warning : COLORS.muted
                            cellData.cell.styles.textColor = color
                        }
                    }
                })

                currentY = (pdf as any).lastAutoTable.finalY + 10

                // Detalle de cada tarea
                pdf.addPage()
                currentY = MARGIN.top + 5

                // Header (sin logo)
                pdf.setFontSize(14)
                pdf.setFont('helvetica', 'bold')
                pdf.setTextColor(28, 183, 190)
                pdf.text('DETALLE DE TAREAS', MARGIN.left, MARGIN.top + 5)
                pdf.setFontSize(9)
                pdf.setFont('helvetica', 'normal')
                pdf.setTextColor(150, 150, 150)
                pdf.text(`Proyecto: ${data.project.name}`, pageWidth - MARGIN.right, MARGIN.top + 5, { align: 'right' })
                pdf.setDrawColor(28, 183, 190)
                pdf.setLineWidth(0.5)
                pdf.line(MARGIN.left, MARGIN.top + 12, pageWidth - MARGIN.right, MARGIN.top + 12)
                currentY = MARGIN.top + 18

                data.tasks.forEach((task: any, index: number) => {
                    // Verificar espacio
                    if (currentY > pageHeight - MARGIN.bottom - 40) {
                        pdf.addPage()
                        currentY = MARGIN.top + 5
                        // Header simple en página adicional
                        pdf.setFontSize(11)
                        pdf.setFont('helvetica', 'bold')
                        pdf.setTextColor(28, 183, 190)
                        pdf.text('DETALLE DE TAREAS (continuación)', MARGIN.left, MARGIN.top)
                        pdf.setDrawColor(200, 200, 200)
                        pdf.setLineWidth(0.2)
                        pdf.line(MARGIN.left, MARGIN.top + 4, pageWidth - MARGIN.right, MARGIN.top + 4)
                        currentY = MARGIN.top + 12
                    }

                    // Card de tarea
                    const color = STATUS_COLORS[task.status] || COLORS.gray

                    // Título de tarea con indicador de color
                    pdf.setFillColor(color[0], color[1], color[2])
                    pdf.roundedRect(MARGIN.left, currentY - 4, 4, 8, 1, 1, 'F')
                    pdf.setFontSize(11)
                    pdf.setFont('helvetica', 'bold')
                    pdf.setTextColor(30, 41, 59)
                    pdf.text(`${index + 1}. ${task.title}`, MARGIN.left + 8, currentY + 1)
                    currentY += 10

                    // Metadata de la tarea
                    pdf.setFontSize(8)
                    pdf.setFont('helvetica', 'normal')

                    // Fila de metadata concatenada
                    const statusLabel = STATUS_LABELS[task.status] || task.status
                    const responsibleText = task.responsible ? `Responsable: ${task.responsible}` : ''
                    const dueDateText = task.dueDate ? `Vence: ${new Date(task.dueDate).toLocaleDateString('es-VE')}` : ''
                    const metaText = [`● ${statusLabel}`, responsibleText, dueDateText].filter(Boolean).join('  |  ')
                    const metaWidth = contentWidth - 8  // descontar indentado
                    const metaLines = pdf.splitTextToSize(metaText, metaWidth)
                    pdf.setTextColor(100, 100, 100)
                    pdf.text(metaLines, MARGIN.left + 8, currentY)
                    currentY += metaLines.length * 5 + 2

                    // Descripción
                    if (task.description) {
                        pdf.setTextColor(80, 80, 80)
                        pdf.setFontSize(8)
                        const descWidth = contentWidth - 8  // descontar indentado
                        const descLines = pdf.splitTextToSize(task.description, descWidth)
                        pdf.text(descLines, MARGIN.left + 8, currentY)
                        currentY += descLines.length * 3.5 + 3
                    }

                    // Detalles JSON
                    if (task.detailsJson) {
                        const details = task.detailsJson as any
                        const sections = [
                            { label: 'DIAGNÓSTICO', key: 'diagnostico', color: COLORS.info },
                            { label: 'PASOS', key: 'pasos', color: COLORS.warning },
                            { label: 'ENTREGABLES', key: 'entregables', color: COLORS.success }
                        ]

                        sections.forEach(section => {
                            const items = details[section.key]
                            if (items && Array.isArray(items) && items.length > 0) {
                                if (currentY > pageHeight - MARGIN.bottom - 40) {
                                    pdf.addPage()
                                    currentY = MARGIN.top + 5
                                }
                                pdf.setFontSize(7)
                                pdf.setFont('helvetica', 'bold')
                                pdf.setTextColor(section.color[0], section.color[1], section.color[2])
                                pdf.text(`${section.label}:`, MARGIN.left + 12, currentY)
                                currentY += 4

                                pdf.setFont('helvetica', 'normal')
                                pdf.setTextColor(100, 100, 100)
                                items.forEach((item: string) => {
                                    if (item.trim()) {
                                        const itemWidth = contentWidth - 20  // descontar indentado + margen extra
                                        const lines = pdf.splitTextToSize(`• ${item}`, itemWidth)
                                        if (currentY + (lines.length * 3) > pageHeight - MARGIN.bottom - 10) {
                                            pdf.addPage()
                                            currentY = MARGIN.top + 5
                                        }
                                        pdf.text(lines, MARGIN.left + 18, currentY)
                                        currentY += lines.length * 3
                                    }
                                })
                                currentY += 2
                            }
                        })
                    }

                    // Criterios de aceptación
                    if (task.acceptanceCriteria) {
                        if (currentY > pageHeight - MARGIN.bottom - 40) {
                            pdf.addPage()
                            currentY = MARGIN.top + 5
                        }
                        pdf.setFontSize(7)
                        pdf.setFont('helvetica', 'bold')
                        pdf.setTextColor(22, 163, 74)
                        pdf.text('CRITERIOS DE ACEPTACIÓN:', MARGIN.left + 12, currentY)
                        currentY += 4

                        pdf.setFont('helvetica', 'normal')
                        pdf.setTextColor(80, 80, 80)
                        const criteriaWidth = contentWidth - 20  // descontar indentado + margen extra
                        const lines = pdf.splitTextToSize(task.acceptanceCriteria, criteriaWidth)
                        pdf.text(lines, MARGIN.left + 18, currentY)
                        currentY += lines.length * 3.5 + 4
                    }

                    // Separador
                    currentY += 3
                    pdf.setDrawColor(230, 230, 230)
                    pdf.setLineWidth(0.2)
                    pdf.line(MARGIN.left + 5, currentY, pageWidth - MARGIN.right - 5, currentY)
                    currentY += 6
                })
            }

            // ========== FOOTER CON NUMERACIÓN ==========
            const totalPages = (pdf as any).internal.getNumberOfPages()
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i)
                // Línea del footer
                pdf.setDrawColor(230, 230, 230)
                pdf.setLineWidth(0.2)
                pdf.line(MARGIN.left, pageHeight - MARGIN.bottom + 5, pageWidth - MARGIN.right, pageHeight - MARGIN.bottom + 5)
                // Numeración
                pdf.setFontSize(8)
                pdf.setTextColor(150, 150, 150)
                pdf.text(`Página ${i} de ${totalPages}`, pageWidth - MARGIN.right, pageHeight - MARGIN.bottom + 12, { align: 'right' })
            }

            pdf.save(`${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
        } catch (error) {
            console.error('Error exportando PDF:', error)
            alert('Error al exportar PDF')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="btn-gradient-teal inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-all font-medium border-none shadow-md active:scale-95 disabled:bg-gray-400 disabled:transform-none"
        >
            {loading ? (
                <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generando...
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    Exportar PDF
                </>
            )}
        </button>
    )
}
