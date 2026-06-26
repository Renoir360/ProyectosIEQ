'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { loginAction, LoginActionState, getLoginStats, LoginStats } from '@/app/actions/auth-actions'

export default function LoginPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [showPassword, setShowPassword] = useState(false)
    const [clientError, setClientError] = useState<string | null>(null)
    const [rememberMe, setRememberMe] = useState(false)
    const [stats, setStats] = useState<LoginStats>({ activeProjects: 0, completedProjects: 0, progressPercentage: 0 })

    useEffect(() => {
        getLoginStats().then(setStats)
    }, [])

    const [state, formAction, isPending] = useActionState<LoginActionState, FormData>(loginAction, {})

    useEffect(() => {
        if (state?.success) {
            toast({ title: '¡Bienvenido!', description: 'Has iniciado sesión correctamente.' })
            router.push('/dashboard')
            router.refresh()
        } else if (state?.error) {
            setClientError(state.error)
        }
    }, [state, router, toast])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setClientError(null)
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        if (!email.includes('@')) { e.preventDefault(); setClientError('Ingrese un email corporativo válido.'); return }
        if (password.length < 1) { e.preventDefault(); setClientError('La contraseña es requerida.'); return }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#dce3ea]">
            <div className="w-full max-w-4xl z-10">
                <div className="w-full grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl">

                    {/* LEFT PANEL: Branding */}
                    <div className="relative hidden md:flex md:col-span-5 flex-col justify-between overflow-hidden min-h-[520px] p-8 lg:p-10 bg-[#1CB7BE]">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                </span>
                                <span className="text-[10px] text-white/90 font-bold tracking-wider uppercase">Sistema Activo</span>
                            </div>
                        </div>

                        <div className="relative z-10 my-auto">
                            <div className="bg-white text-[#1CB7BE] font-black text-sm px-3 py-1 rounded-lg tracking-wide w-fit mb-4">
                                IEQ
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3">
                                Gestión de<br />Proyectos IT
                            </h1>
                            <p className="text-sm text-white/80 leading-relaxed max-w-xs">
                                Seguimiento de proyectos, aprobaciones de compras y despliegue de infraestructura tecnológica.
                            </p>
                        </div>

                        <div className="relative z-10 flex gap-8 pt-4 border-t border-white/20">
                            <div>
                                <div className="text-xl font-black text-white">{stats.activeProjects}</div>
                                <div className="text-[10px] text-white/70 font-medium">Activos</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-white">{stats.completedProjects}</div>
                                <div className="text-[10px] text-white/70 font-medium">Completados</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-white">{stats.progressPercentage}%</div>
                                <div className="text-[10px] text-white/70 font-medium">Avance</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Form */}
                    <div className="relative flex md:col-span-7 p-8 sm:p-10 flex-col justify-center min-h-[480px]">
                        <div className="relative z-10 max-w-sm mx-auto w-full">
                            {/* Mobile logo */}
                            <div className="flex md:hidden items-center gap-2.5 mb-6">
                                <span className="bg-[#1CB7BE] text-white font-black text-xs px-2 py-0.5 rounded-md">IEQ</span>
                                <span className="text-sm font-bold text-slate-800">Clínica IEQ</span>
                            </div>

                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                                Iniciar Sesión
                            </h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Ingresa con tus credenciales institucionales.
                            </p>

                            <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            id="email" name="email" type="email" required disabled={isPending}
                                            placeholder="usuario@clinicaieq.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-[#1CB7BE] focus:ring-2 focus:ring-[#1CB7BE]/20 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Contraseña</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            id="password" name="password" type={showPassword ? 'text' : 'password'} required disabled={isPending}
                                            placeholder="••••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none focus:border-[#1CB7BE] focus:ring-2 focus:ring-[#1CB7BE]/20 transition-all placeholder:text-slate-400"
                                        />
                                        <button type="button" disabled={isPending} onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                            aria-label="Mostrar contraseña">
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500"
                                        onClick={() => setRememberMe(!rememberMe)}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'border-[#1CB7BE] bg-[#1CB7BE]/10' : 'border-slate-300 bg-white'}`}>
                                            {rememberMe && <svg width="8" height="6" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.2 6L8 1" stroke="#1CB7BE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                        </div>
                                        Mantener activa
                                    </label>
                                </div>

                                <AnimatePresence mode="wait">
                                    {clientError && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <p className="text-xs font-semibold text-red-600">{clientError}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button className="w-full bg-[#1CB7BE] hover:bg-[#177388] text-white font-bold h-11 text-sm shadow-sm transition-all rounded-lg cursor-pointer"
                                    type="submit" disabled={isPending}>
                                    {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verificando...</>)
                                        : (<><ArrowRight className="mr-1.5 h-4 w-4" />Iniciar Sesión</>)}
                                </Button>
                            </form>

                            <div className="text-center mt-6 text-[10px] text-slate-400 border-t border-slate-100 pt-4">
                                Sistemas &copy; 2026
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
