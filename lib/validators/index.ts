import { z } from 'zod'
// import { TaskStatus, TaskPriority, EvidenceType } from '@prisma/client'

// Schema for updating a project
export const updateProjectSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['PLANIFICADO', 'EN_PROGRESO', 'PAUSADO', 'COMPLETADO']).optional(),
})

// Schema for creating a task
export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    projectId: z.string().min(1),
    areaId: z.string().optional(),
    description: z.string().min(1, 'Description/Checklist is required'),
    summary: z.string().max(120).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    responsible: z.string().optional(),
    dueDate: z.string().nullable().optional(),
    acceptanceCriteria: z.string().optional(),
    dependencies: z.string().optional(),
})

// Schema for updating a task
export const updateTaskSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['BACKLOG', 'READY', 'IN_PROGRESS', 'DONE']).optional(),
    responsible: z.string().optional(),
    dueDate: z.string().nullable().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    areaId: z.string().nullable().optional(),
    dependencyNotes: z.string().nullable().optional(),
    dependencies: z.string().optional(),
    summary: z.string().max(120).optional(),
    acceptanceCriteria: z.string().optional(),
    detailsJson: z.object({
        diagnostico: z.array(z.string()).optional(),
        pasos: z.array(z.string()).optional(),
        entregables: z.array(z.string()).optional(),
        notes: z.string().optional().nullable(),
    }).optional(),
})

export type TaskDetails = {
    diagnostico?: string[];
    pasos?: string[];
    entregables?: string[];
    notes?: string | null;
}

// Schema for adding evidence
export const createEvidenceSchema = z.object({
    type: z.enum(['LINK', 'NOTE', 'PHOTO']),
    url: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

// Schema for creating a purchase request
export const createPurchaseRequestSchema = z.object({
    projectId: z.string().optional().nullable(),
    taskId: z.string().optional().nullable(),
    type: z.enum(['HARDWARE', 'SOFTWARE', 'SERVICIO', 'LICENCIA']),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    justification: z.string().min(1, 'Justification is required'),
    vendor: z.string().optional().nullable(),
    vendorLink: z.string().optional().nullable(),
    estimatedAmount: z.number().positive('Amount must be positive'),
    priority: z.enum(['NORMAL', 'ALTA', 'CRITICA']).default('NORMAL'),
})

// Schema for updating a purchase request
export const updatePurchaseRequestSchema = z.object({
    projectId: z.string().optional().nullable(),
    taskId: z.string().optional().nullable(),
    type: z.enum(['HARDWARE', 'SOFTWARE', 'SERVICIO', 'LICENCIA']).optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    justification: z.string().optional(),
    vendor: z.string().optional().nullable(),
    vendorLink: z.string().optional().nullable(),
    estimatedAmount: z.number().positive().optional(),
    priority: z.enum(['NORMAL', 'ALTA', 'CRITICA']).optional(),
    status: z.enum(['BORRADOR', 'EN_REVISION', 'APROBADO', 'RECHAZADO', 'COMPRADO', 'RECIBIDO']).optional(),
    rejectionComments: z.string().optional().nullable(),
})
