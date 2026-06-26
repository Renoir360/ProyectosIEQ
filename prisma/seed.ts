import { PrismaClient, TaskPriority, ProjectStatus, TaskStatus, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Users
    // Users
    // 1) SISTEMAS
    const sistemasPassword = await bcrypt.hash('Sistemas123', 12)
    await prisma.user.upsert({
        where: { email: 'sistemas@clinicaieq.com' },
        update: {
            department: 'SISTEMAS'
        } as any,
        create: {
            name: 'Sistemas IEQ',
            email: 'sistemas@clinicaieq.com',
            passwordHash: sistemasPassword,
            role: 'SISTEMAS',
            department: 'SISTEMAS'
        } as any
    })

    // 2) PRESIDENCIA
    const presidenciaPassword = await bcrypt.hash('IEQ*2026*', 12)
    await prisma.user.upsert({
        where: { email: 'presidencia@clinicaieq.com' },
        update: {
            department: 'GLOBAL'
        } as any,
        create: {
            name: 'Presidencia IEQ',
            email: 'presidencia@clinicaieq.com',
            passwordHash: presidenciaPassword,
            role: 'PRESIDENCIA',
            department: 'GLOBAL'
        } as any
    })


    // Helper for dates
    const addDays = (days: number) => {
        const date = new Date()
        date.setDate(date.getDate() + days)
        return date
    }

    const apChecklist = `**Precheck:**
- [ ] Punto de red activo y funcional
- [ ] PoE habilitado en switch
- [ ] VLAN/segmento configurado
- [ ] Etiquetado de puerto completado
- [ ] Puerto switch identificado y documentado

**Instalación Física:**
- [ ] Montaje en ubicación óptima
- [ ] Orientación correcta de antenas
- [ ] Registro de MAC address
- [ ] Registro de serial number
- [ ] Documentación de ubicación exacta

**Provisioning:**
- [ ] Adopción en controlador/cloud
- [ ] Configuración de SSID
- [ ] Verificación de SSIDs publicados
- [ ] Asignación de políticas de red

**Pruebas:**
- [ ] Conexión exitosa de dispositivo cliente
- [ ] Asignación correcta de IP
- [ ] Navegación web funcional
- [ ] Prueba de estabilidad (15 min)
- [ ] Medición de cobertura RF

**Cierre:**
- [ ] Documentación as-built actualizada
- [ ] Aceptación formal del área
- [ ] Registro fotográfico de instalación`

    const apAcceptance = `- AP visible en controlador
- SSIDs publicados correctamente
- Cobertura RF > -70 dBm en área
- Documentación as-built completada
- Aceptación firmada por jefe de área`

    // Project 1: WiFi 6 (UPSERT)
    const p1 = await prisma.project.upsert({
        where: { name: 'WiFi 6' },
        update: {},
        create: {
            name: 'WiFi 6',
            description: 'Implementación de WiFi 6 en áreas críticas del hospital',
            status: ProjectStatus.EN_PROGRESO,
            progress: 35,
            department: 'SISTEMAS',
        } as any
    })


    // Areas for WiFi 6
    const quirofano = await prisma.area.upsert({
        where: { projectId_name: { projectId: p1.id, name: 'Quirófano' } },
        update: {},
        create: { projectId: p1.id, name: 'Quirófano' }
    })

    const lobbyMat = await prisma.area.upsert({
        where: { projectId_name: { projectId: p1.id, name: 'Lobby Maternidad' } },
        update: {},
        create: { projectId: p1.id, name: 'Lobby Maternidad' }
    })

    const starMed = await prisma.area.upsert({
        where: { projectId_name: { projectId: p1.id, name: 'Star Médicos Quirófano' } },
        update: {},
        create: { projectId: p1.id, name: 'Star Médicos Quirófano' }
    })

    const emergAdultos = await prisma.area.upsert({
        where: { projectId_name: { projectId: p1.id, name: 'Emergencia Adultos' } },
        update: {},
        create: { projectId: p1.id, name: 'Emergencia Adultos' }
    })

    // WiFi 6 Tasks (UPSERT by unique title+projectId)
    await prisma.task.upsert({
        where: { projectId_title: { projectId: p1.id, title: 'Instalación AP Quirófano #1' } },
        update: {},
        create: {
            projectId: p1.id,
            areaId: quirofano.id,
            title: 'Instalación AP Quirófano #1',
            description: apChecklist,
            acceptanceCriteria: apAcceptance,
            dependencies: 'PoE en switch, patch cord Cat6, ventana de mantenimiento quirófano',
            priority: TaskPriority.HIGH,
            status: TaskStatus.DONE,
            responsible: 'Carlos Méndez',
            dueDate: addDays(-5),
            orderIndex: 1
        }
    })

    await prisma.task.upsert({
        where: { projectId_title: { projectId: p1.id, title: 'Instalación AP Quirófano #2' } },
        update: {},
        create: {
            projectId: p1.id,
            areaId: quirofano.id,
            title: 'Instalación AP Quirófano #2',
            description: apChecklist,
            acceptanceCriteria: apAcceptance,
            dependencies: 'PoE en switch, patch cord Cat6, ventana de mantenimiento quirófano',
            priority: TaskPriority.HIGH,
            status: TaskStatus.IN_PROGRESS,
            responsible: 'Carlos Méndez',
            dueDate: addDays(2),
            orderIndex: 2
        }
    })

    await prisma.task.upsert({
        where: { projectId_title: { projectId: p1.id, title: 'Instalación AP Lobby Maternidad' } },
        update: {},
        create: {
            projectId: p1.id,
            areaId: lobbyMat.id,
            title: 'Instalación AP Lobby Maternidad',
            description: apChecklist,
            acceptanceCriteria: apAcceptance,
            dependencies: 'PoE en switch piso 2, patch cord Cat6',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.READY,
            dependencyNotes: 'Falta PoE en switch de piso 2. Pendiente upgrade de switch.',
            responsible: 'Ana Torres',
            dueDate: addDays(5),
            orderIndex: 3
        }
    })

    await prisma.task.upsert({
        where: { projectId_title: { projectId: p1.id, title: 'Instalación AP Star Médicos' } },
        update: {},
        create: {
            projectId: p1.id,
            areaId: starMed.id,
            title: 'Instalación AP Star Médicos',
            description: apChecklist,
            acceptanceCriteria: apAcceptance,
            dependencies: 'PoE en switch, patch cord Cat6',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.BACKLOG,
            responsible: 'Luis Ramírez',
            dueDate: addDays(7),
            orderIndex: 4
        }
    })

    await prisma.task.upsert({
        where: { projectId_title: { projectId: p1.id, title: 'Instalación AP Emergencia Adultos' } },
        update: {},
        create: {
            projectId: p1.id,
            areaId: emergAdultos.id,
            title: 'Instalación AP Emergencia Adultos',
            description: apChecklist,
            acceptanceCriteria: apAcceptance,
            dependencies: 'PoE en switch, patch cord Cat6',
            priority: TaskPriority.HIGH,
            status: TaskStatus.BACKLOG,
            responsible: 'Carlos Méndez',
            dueDate: addDays(10),
            orderIndex: 5
        }
    })

    // Project 1 Floorplans (WiFi 6)
    const p1FloorplanSurgical = await prisma.floorplan.create({
        data: {
            projectId: p1.id,
            name: 'Piso 1 - Quirófanos',
            imageUrl: '/floorplans/wifi6-surgical.png',
            notes: 'Distribución de APs en área Quirúrgica'
        }
    })

    const p1FloorplanMaternity = await prisma.floorplan.create({
        data: {
            projectId: p1.id,
            name: 'Piso 2 - Maternidad',
            imageUrl: '/floorplans/wifi6-maternity-lobby.png',
            notes: 'Cobertura en lobby y pasillos de maternidad'
        }
    })

    const p1FloorplanAdultER = await prisma.floorplan.create({
        data: {
            projectId: p1.id,
            name: 'Piso 1 - Emergencia Adultos',
            imageUrl: '/floorplans/wifi6-adult-er.png',
            notes: 'Cobertura en recepción y cubículos ER'
        }
    })

    await prisma.accessPointPlacement.createMany({
        data: [
            { floorplanId: p1FloorplanSurgical.id, name: 'AP - Quirofano 01 - Quirofano 02', model: 'RG-RAP2260G', x: 0.43, y: 0.425, radius: 0.12, status: 'Active', band: '5GHz', channel: '36' },
            { floorplanId: p1FloorplanSurgical.id, name: 'AP - Quirofano 04 - Quirofano 03', model: 'RG-RAP2260G', x: 0.57, y: 0.425, radius: 0.12, status: 'Active', band: '5GHz', channel: '44' },
            { floorplanId: p1FloorplanSurgical.id, name: 'AP - Estar Para Medicos', model: 'RG-RAP2260G', x: 0.28, y: 0.88, radius: 0.12, status: 'Active', band: '5GHz', channel: '11' },
            { floorplanId: p1FloorplanMaternity.id, name: 'AP-MAT-01', model: 'RG-RAP2260G', x: 0.5, y: 0.5, radius: 0.14, status: 'Planned', band: '2.4GHz', channel: '6' },
            { floorplanId: p1FloorplanAdultER.id, name: 'AP-ER-01', model: 'RG-RAP2260G', x: 0.37, y: 0.25, radius: 0.14, status: 'Planned', band: '5GHz', channel: '149', notes: 'Ubicado exactamente en la etiqueta Emergencia Adultos' }
        ]
    })

    // Project 2: UCI Pediátrica (UPSERT)
    const p2 = await prisma.project.upsert({
        where: { name: 'UCI Pediátrica' },
        update: {},
        create: {
            name: 'UCI Pediátrica',
            description: 'Equipamiento tecnológico para UCI Pediátrica',
            status: ProjectStatus.EN_PROGRESO,
            progress: 0,
        }
    })

    const uciArea = await prisma.area.upsert({
        where: { projectId_name: { projectId: p2.id, name: 'UCI Pediátrica' } },
        update: {},
        create: { projectId: p2.id, name: 'UCI Pediátrica' }
    })

    await prisma.task.upsert({
        where: { projectId_title: { projectId: p2.id, title: 'Instalación Estación de Trabajo RX' } },
        update: {},
        create: {
            projectId: p2.id,
            areaId: uciArea.id,
            title: 'Instalación Estación de Trabajo RX',
            description: `**Inventario Actual:**
- MFF + mouse/teclado inalámbrico (disponible)
- SFF + teclado/mouse (disponible)
- Monitor 27" (FALTANTE)

**Pendiente:**
- [ ] Cotizar monitor 27" 4K
- [ ] Aprobación de compra
- [ ] Instalación física
- [ ] Configuración de software RX
- [ ] Pruebas de conectividad PACS`,
            acceptanceCriteria: `- Monitor 27" instalado y funcional
- Software RX configurado
- Conectividad PACS validada
- Aceptación de médico radiólogo`,
            dependencies: 'Monitor 27", licencia software RX, acceso PACS',
            priority: TaskPriority.HIGH,
            status: TaskStatus.READY,
            dependencyNotes: 'Falta Monitor 27". Cotización enviada, pendiente aprobación presupuestal.',
            responsible: 'María González',
            dueDate: addDays(3),
            orderIndex: 1
        }
    })

    await prisma.task.upsert({
        where: { projectId_title: { projectId: p2.id, title: 'Cotización y compra cámaras de vigilancia (2)' } },
        update: {},
        create: {
            projectId: p2.id,
            areaId: uciArea.id,
            title: 'Cotización y compra cámaras de vigilancia (2)',
            description: `**Especificaciones:**
- 2 cámaras IP PoE
- Resolución mínima 4MP
- Visión nocturna
- Almacenamiento en NVR existente

**Pasos:**
- [ ] Solicitar 3 cotizaciones
- [ ] Evaluación técnica
- [ ] Aprobación presupuestal
- [ ] Orden de compra
- [ ] Recepción e instalación`,
            acceptanceCriteria: `- Cámaras instaladas y operativas
- Grabación continua funcional
- Acceso remoto configurado`,
            dependencies: 'Proveedor CCTV, PoE en switch, aprobación presupuestal',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.READY,
            responsible: 'Pedro Sánchez',
            dueDate: addDays(14),
            orderIndex: 2
        }
    })

    await prisma.task.upsert({
        where: { projectId_title: { projectId: p2.id, title: 'Instalación Access Point UCI Pediátrica' } },
        update: {},
        create: {
            projectId: p2.id,
            areaId: uciArea.id,
            title: 'Instalación Access Point UCI Pediátrica',
            description: apChecklist,
            acceptanceCriteria: apAcceptance,
            dependencies: 'PoE en switch, patch cord Cat6',
            priority: TaskPriority.HIGH,
            status: TaskStatus.IN_PROGRESS,
            responsible: 'Luis Ramírez',
            dueDate: addDays(1),
            orderIndex: 3
        }
    })

    // Project 2 Floorplans (UCI Pediátrica)
    const p2Floorplan = await prisma.floorplan.create({
        data: {
            projectId: p2.id,
            name: 'Piso 3 - UCI Pediátrica',
            imageUrl: '/floorplans/uci-pediatrica-hall-b.png',
            notes: 'Distribución de APs en UCI Pediatría Hall B'
        }
    })

    await prisma.accessPointPlacement.createMany({
        data: [
            { floorplanId: p2Floorplan.id, name: 'AP-UCI-01', model: 'RG-RAP2260G', x: 0.52, y: 0.48, radius: 0.14, status: 'Active', band: '5GHz', channel: '100', notes: 'Entre Hab. B5 y B9' }
        ]
    })

    // Project 3: Cámaras de Seguridad (UPSERT)
    const p3 = await prisma.project.upsert({
        where: { name: 'Cámaras de Seguridad' },
        update: {},
        create: {
            name: 'Cámaras de Seguridad',
            description: 'Mantenimiento y actualización del sistema de videovigilancia',
            status: ProjectStatus.PLANIFICADO,
            progress: 0
        }
    })

    const cctvArea = await prisma.area.upsert({
        where: { projectId_name: { projectId: p3.id, name: 'Infra CCTV' } },
        update: {},
        create: { projectId: p3.id, name: 'Infra CCTV' }
    })

    await prisma.task.upsert({
        where: { projectId_title: { projectId: p3.id, title: 'Revisión de conexión de red de los DVR' } },
        update: {},
        create: {
            projectId: p3.id,
            areaId: cctvArea.id,
            title: 'Revisión de conexión de red de los DVR',
            description: `**Diagnóstico:**
- [ ] Verificar conectividad de cada DVR
- [ ] Revisar configuración de red
- [ ] Validar acceso remoto
- [ ] Documentar IPs y ubicaciones
- [ ] Pruebas de streaming

**Entregable:**
Reporte de estado de conectividad de todos los DVR`,
            acceptanceCriteria: `- Reporte de conectividad completo
- Todos los DVR accesibles remotamente
- Documentación de IPs actualizada`,
            dependencies: 'Acceso físico a DVRs, credenciales admin',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.BACKLOG,
            responsible: 'Pedro Sánchez',
            dueDate: addDays(21),
            orderIndex: 1
        }
    })

    await prisma.task.upsert({
        where: { projectId_title: { projectId: p3.id, title: 'Cotizar proveedor/técnico para revisión física general' } },
        update: {},
        create: {
            projectId: p3.id,
            areaId: cctvArea.id,
            title: 'Cotizar proveedor/técnico para revisión física general',
            description: `**Alcance de Revisión:**
- Transformadores de alimentación
- Videobalun (estado y conexiones)
- Cableado deteriorado
- Cámaras con fallas
- Limpieza de lentes

**Pasos:**
- [ ] Solicitar cotizaciones (mínimo 2 proveedores)
- [ ] Evaluación de propuestas
- [ ] Aprobación
- [ ] Programación de visita técnica`,
            acceptanceCriteria: `- Proveedor seleccionado
- Cotización aprobada
- Visita técnica programada`,
            dependencies: 'Proveedor CCTV certificado, aprobación presupuestal',
            priority: TaskPriority.LOW,
            status: TaskStatus.BACKLOG,
            dueDate: addDays(30),
            orderIndex: 2
        }
    })


    console.log('Seed completed successfully.')
}

main()
    .catch(e => {
        console.error('Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
