import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { TaskList, TaskWithEvidence } from '@/components/projects/task-list'
import { TaskKanban } from '@/components/projects/task-kanban'
import { CreateTaskDialog } from '@/components/projects/create-task-dialog'
import { ExportPDFButton } from '@/components/projects/export-pdf-button'
import { ProjectStatusSelect } from '@/components/projects/project-status-select'
import { ArrowLeft, Calendar, ShoppingBag } from 'lucide-react'
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_COLOR, ProjectStatus, TaskStatus, TaskPriority } from '@/lib/status'
import { MotionWrapper } from '@/components/ui/motion-wrapper'

import { TaskDetails } from '@/lib/validators'
import { WifiFloorplan } from '@/components/projects/wifi-floorplan'
import { PurchaseTable } from '@/components/purchases/purchase-table'
import { getCurrentUser } from '@/lib/auth'

interface AreaSimple {
    id: string;
    name: string;
}

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getCurrentUser()
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            areas: {
                include: {
                    tasks: {
                        include: { evidences: true },
                        orderBy: { orderIndex: 'asc' }
                    }
                }
            },
            tasks: {
                where: { areaId: null },
                include: { evidences: true },
                orderBy: { createdAt: 'desc' }
            },
            purchaseRequests: {
                orderBy: { createdAt: 'desc' },
                include: {
                    project: {
                        select: { id: true, name: true }
                    }
                }
            },
            auditLogs: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!project) notFound()

    // Prepare tasks with proper typing for TaskList
    const mapTask = (t: Record<string, unknown>): TaskWithEvidence => {
        const base = t as unknown as TaskWithEvidence
        return {
            ...base,
            status: t.status as TaskStatus,
            priority: t.priority as TaskPriority,
            detailsJson: (t.detailsJson || { diagnostico: [], pasos: [], entregables: [], notes: '' }) as TaskDetails,
            evidences: (t.evidences as { id: string; type: 'LINK' | 'NOTE' | 'PHOTO'; url: string | null; notes: string | null }[]) || []
        }
    }

    const projectTasks = (project.tasks as Record<string, unknown>[]).map(mapTask)
    const areaTasks = project.areas.flatMap((a: { tasks: Record<string, unknown>[] }) => a.tasks.map(mapTask))

    // Typing for the list renderers
    const typedProjectTasks = projectTasks

    // Collect all tasks for "All" tab
    const allTasks = [
        ...projectTasks,
        ...areaTasks
    ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    // Tasks due in next 7 days
    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(now.getDate() + 7)

    const upcomingTasksCount = allTasks.filter(t =>
        t.status !== 'DONE' &&
        t.dueDate &&
        new Date(t.dueDate) >= now &&
        new Date(t.dueDate) <= sevenDaysFromNow
    ).length

    const purchaseRequests = (project.purchaseRequests || []).map((p: any) => ({
        ...p,
        project: { id: project.id, name: project.name }
    }))

    const areasList: AreaSimple[] = project.areas.map(a => ({ id: a.id, name: a.name }))

    return (
        <div className="min-h-screen">
            <div className="p-6 space-y-6">
                {/* Header Premium */}
                <MotionWrapper direction="down">
                    <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl text-slate-900 rounded-2xl p-8 mb-2">
                        {/* Internal decorative blobs for depth */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1CB7BE]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />



                        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                            <Link href="/projects">
                                <Button variant="ghost" size="icon" className="glass-card hover:bg-white/20 text-slate-700 dark:text-slate-200">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>

                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-4">
                                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{project.name}</h1>
                                    <ProjectStatusSelect projectId={project.id} initialStatus={project.status as ProjectStatus} userRole={user?.role} />
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-lg max-w-3xl leading-relaxed">{project.description}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <ExportPDFButton projectId={project.id} projectName={project.name} />
                                {user?.role === 'SISTEMAS' && (
                                    <CreateTaskDialog projectId={project.id} areas={project.areas.map((a: { id: string, name: string }) => ({ id: a.id, name: a.name }))} />
                                )}
                            </div>
                        </div>
                    </div>
                </MotionWrapper>

                {/* Stats */}
                <div className="relative">
                    {/* Decorative element for depth */}
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#1CB7BE]/5 rounded-full blur-[80px]" />

                    <div className="grid gap-4 md:grid-cols-4 relative z-10">
                        <div className="glass-card p-4 rounded-lg border hover:glass-card-hover transition-all">
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Progreso</div>
                            <div className="text-2xl font-bold text-[#1CB7BE]">{project.progress}%</div>
                        </div>
                        <div className="glass-card p-4 rounded-lg border hover:glass-card-hover transition-all">
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Tareas Totales</div>
                            <div className="text-2xl font-bold text-slate-800">{allTasks.length}</div>
                        </div>
                        <div className="glass-card p-4 rounded-lg border hover:glass-card-hover transition-all">
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Completadas</div>
                            <div className="text-2xl font-bold text-green-600">
                                {allTasks.filter(t => t.status === 'DONE').length}
                            </div>
                        </div>
                        <div className="glass-card p-4 rounded-lg border hover:glass-card-hover transition-all">
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Fecha Inicio</div>
                            <div className="flex items-center gap-2 font-bold text-slate-700">
                                <Calendar className="h-4 w-4 text-[#1CB7BE]" />
                                {new Date(project.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6 relative z-10">
                    <div className="absolute top-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                    {/* Tabs */}
                    <Tabs defaultValue="areas" className="w-full">
                        <div className="flex items-center justify-between mb-4 gap-4">
                            <TabsList className="overflow-x-auto max-w-full flex-nowrap">
                                <TabsTrigger value="areas">Por Áreas</TabsTrigger>
                                <TabsTrigger value="kanban">📋 Tablero Kanban</TabsTrigger>
                                <TabsTrigger value="all">Todas las Tareas</TabsTrigger>
                                <TabsTrigger value="purchases" className="gap-2">
                                    <ShoppingBag className="h-4 w-4" /> Compras
                                </TabsTrigger>
                                {(user?.department === 'SISTEMAS' || user?.role === 'PRESIDENCIA') && (
                                    <>
                                        <TabsTrigger value="wifi">📡 Plano WiFi 6</TabsTrigger>
                                        <TabsTrigger value="audit">📜 Auditoría</TabsTrigger>
                                    </>
                                )}
                            </TabsList>
                            {upcomingTasksCount > 0 && (
                                <div className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {upcomingTasksCount} pendientes esta semana
                                </div>
                            )}
                        </div>

                        <TabsContent value="areas" className="space-y-4">
                            {project.areas.length === 0 && (
                                <div className="text-center p-8 text-slate-500 bg-white border rounded">
                                    No hay áreas definidas para este proyecto.
                                </div>
                            )}

                            <Accordion type="multiple" className="w-full space-y-4">
                                {project.areas.map((area: { id: string; name: string; tasks: Record<string, unknown>[] }) => (
                                    <AccordionItem key={area.id} value={area.id} className="border-none rounded-xl glass-card px-4 shadow-sm hover:glass-card-hover transition-all overflow-hidden">
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center justify-between w-full pr-4">
                                                <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">{area.name}</span>
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-slate-300">
                                                    {area.tasks.length} tareas
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-4">
                                            <TaskList tasks={area.tasks.map(mapTask) as TaskWithEvidence[]} areas={areasList} userRole={user?.role} />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>

                            {project.tasks.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-2 ml-1">Sin Área Asignada</h3>
                                    <TaskList tasks={typedProjectTasks} areas={areasList} userRole={user?.role} />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="all">
                            <TaskList tasks={allTasks} areas={areasList} userRole={user?.role} />
                        </TabsContent>

                        <TabsContent value="kanban">
                            <TaskKanban tasks={allTasks} areas={areasList} userRole={user?.role} />
                        </TabsContent>

                        <TabsContent value="purchases">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-800">Solicitudes de Compra</h3>
                                    {purchaseRequests.length > 0 && (
                                        <Badge variant="outline" className="bg-slate-50">
                                            Total: ${purchaseRequests.reduce((acc: number, p: any) => acc + p.estimatedAmount, 0).toFixed(2)}
                                        </Badge>
                                    )}
                                </div>
                                <PurchaseTable purchases={purchaseRequests} userRole={user?.role} />
                            </div>
                        </TabsContent>

                        {(user?.department === 'SISTEMAS' || user?.role === 'PRESIDENCIA') && (
                            <>
                                <TabsContent value="wifi">
                                    <WifiFloorplan projectId={project.id} userRole={user?.role} />
                                </TabsContent>
                                <TabsContent value="audit">
                                    <div className="glass-card p-6 rounded-xl border bg-white/50 backdrop-blur-sm space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                                <span>Historial de Auditoría</span>
                                            </h3>
                                        </div>
                                        {project.auditLogs.length === 0 ? (
                                            <p className="text-slate-500 text-sm italic">No hay logs de auditoría registrados para este proyecto.</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse text-sm">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                                                            <th className="py-2.5">Fecha</th>
                                                            <th className="py-2.5">Usuario</th>
                                                            <th className="py-2.5">Acción</th>
                                                            <th className="py-2.5">Detalles</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                                        {project.auditLogs.map((log: any) => (
                                                            <tr key={log.id} className="hover:bg-slate-50/50">
                                                                <td className="py-2.5 font-mono text-[11px] text-slate-500">
                                                                    {new Date(log.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                                </td>
                                                                <td className="py-2.5 font-medium">
                                                                    {log.userName || log.userEmail || 'Sistema'}
                                                                </td>
                                                                <td className="py-2.5">
                                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-teal-600 bg-teal-50 border-teal-200">
                                                                        {log.action.replace(/_/g, ' ')}
                                                                    </Badge>
                                                                </td>
                                                                <td className="py-2.5 text-slate-600 max-w-md truncate" title={log.details}>
                                                                    {log.details}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </>
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
