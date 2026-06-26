import prisma from '@/lib/db'
import { PurchaseForm } from '@/components/purchases/purchase-form'
import { MotionWrapper } from '@/components/ui/motion-wrapper'


export const dynamic = 'force-dynamic'

export default async function NuevaSolicitudPage() {
    const projects = await prisma.project.findMany({
        select: { 
            id: true, 
            name: true,
            tasks: {
                select: { id: true, title: true },
                orderBy: { title: 'asc' }
            }
        },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 min-h-screen">
            <MotionWrapper direction="down">
                <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8 mb-2">

                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#1CB7BE]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10">
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                            Nueva <span className="text-[#1CB7BE]">Solicitud de Compra</span>
                        </h1>
                        <p className="text-slate-600 font-semibold max-w-2xl leading-relaxed text-base sm:text-lg mt-2">
                            Completa el formulario para crear una nueva solicitud de compra.
                        </p>
                    </div>
                </div>
            </MotionWrapper>

            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#1CB7BE]/5 rounded-full blur-[80px] pointer-events-none" />
                <MotionWrapper direction="up" delay={0.2}>
                    <PurchaseForm projects={projects} />
                </MotionWrapper>
            </div>
        </div>
    )
}
