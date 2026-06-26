// Fallback types if Prisma generate fails to export them correctly in IDE
export type TaskStatus = 'BACKLOG' | 'READY' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type ProjectStatus = 'PLANIFICADO' | 'EN_PROGRESO' | 'PAUSADO' | 'COMPLETADO'

/**
 * Mapping de estados de proyectos a español
 */
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
    PLANIFICADO: "Planificado",
    EN_PROGRESO: "En ejecución",
    PAUSADO: "Pausado",
    COMPLETADO: "Finalizado",
}

export const PROJECT_STATUS_COLOR: Record<ProjectStatus, string> = {
    PLANIFICADO: "bg-slate-200 text-slate-700",
    EN_PROGRESO: "bg-blue-100 text-blue-700 border-blue-200",
    PAUSADO: "bg-amber-100 text-amber-700 border-amber-200",
    COMPLETADO: "bg-green-100 text-green-700 border-green-200",
}


/**
 * Mapping de estados de tareas a español
 * Mantiene los enums en inglés en DB pero muestra español en UI
 */
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
    BACKLOG: "Pendiente",
    READY: "Listo",
    IN_PROGRESS: "En progreso",
    DONE: "Completado",
}

/**
 * Colores de badges para estados de tareas
 */
export const TASK_STATUS_COLOR: Record<TaskStatus, string> = {
    BACKLOG: "bg-slate-100 text-slate-700 border-slate-200",
    READY: "bg-amber-100 text-amber-700 border-amber-200",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
    DONE: "bg-green-100 text-green-700 border-green-200",
}

/**
 * Colores en HEX para charts (Recharts)
 */
export const TASK_STATUS_COLOR_HEX: Record<TaskStatus, string> = {
    BACKLOG: "#94a3b8", // slate-400
    READY: "#f59e0b",   // amber-500
    IN_PROGRESS: "#3b82f6", // blue-500
    DONE: "#16a34a",    // green-600
}

/**
 * Clases de Tailwind para badges de estado
 */
export const TASK_STATUS_BADGE_CLASS: Record<TaskStatus, string> = {
    BACKLOG: "bg-slate-200 text-slate-800",
    READY: "bg-amber-200 text-amber-900",
    IN_PROGRESS: "bg-blue-200 text-blue-900",
    DONE: "bg-green-200 text-green-900",
}

/**
 * Mapping de prioridades a español
 */
export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
    LOW: "Baja",
    MEDIUM: "Media",
    HIGH: "Alta",
}

/**
 * Colores para badges de prioridad
 */
export const TASK_PRIORITY_COLOR: Record<TaskPriority, string> = {
    LOW: "border-slate-500 text-slate-700 bg-slate-50",
    MEDIUM: "border-amber-500 text-amber-700 bg-amber-50",
    HIGH: "border-red-500 text-red-700 bg-red-50",
}
