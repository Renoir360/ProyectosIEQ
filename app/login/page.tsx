'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MotionWrapper } from '@/components/ui/motion-wrapper'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { loginAction, LoginActionState, getLoginStats, LoginStats } from '@/app/actions/auth-actions'

export default function LoginPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [showPassword, setShowPassword] = useState(false)
    const [clientError, setClientError] = useState<string | null>(null)
    const [rememberMe, setRememberMe] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [stats, setStats] = useState<LoginStats>({
        activeProjects: 0,
        completedProjects: 0,
        progressPercentage: 0
    })

    useEffect(() => {
        setMounted(true)
        getLoginStats().then(data => {
            setStats(data)
        })
    }, [])

    const [state, formAction, isPending] = useActionState<LoginActionState, FormData>(
        loginAction,
        {}
    )

    useEffect(() => {
        if (state?.success) {
            toast({
                title: '¡Bienvenido!',
                description: 'Has iniciado sesión correctamente.',
            })
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

        if (!email.includes('@')) {
            e.preventDefault()
            setClientError('Ingrese un email corporativo válido.')
            return
        }
        if (password.length < 1) {
            e.preventDefault()
            setClientError('La contraseña es requerida.')
            return
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden"
             style={{ background: 'var(--login-bg)' }}>

            {/* Ambient blobs — simplified, no spring physics */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-60"
                 style={{ background: 'var(--color-brand)', opacity: 0.08 }} />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
                 style={{ background: 'var(--color-brand-dark)', opacity: 0.1 }} />

            <MotionWrapper direction="up" className="w-full max-w-5xl z-10">
                <div className="w-full grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden border border-[--login-border] shadow-2xl relative"
                     style={{ background: 'var(--login-bg)' }}>

                    {/* PANEL IZQUIERDO: Branding + Stats reales */}
                    <div className="relative hidden md:flex md:col-span-7 flex-col justify-between overflow-hidden min-h-[520px] p-8 lg:p-10"
                         style={{ background: 'var(--login-card)' }}>
                        <div className="absolute inset-0 pointer-events-none z-0"
                             style={{
                                 backgroundImage: 'linear-gradient(rgba(28,183,190,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(28,183,190,0.03) 1px, transparent 1px)',
                                 backgroundSize: '20px 20px'
                             }} />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[--login-bg] pointer-events-none z-10" />

                        {/* Status badge */}
                        <div className="relative z-20 flex justify-between items-center w-full">
                            <div className="flex items-center gap-2 bg-black/40 border px-3 py-1.5 rounded-full backdrop-blur-md"
                                 style={{ borderColor: 'rgba(28,183,190,0.2)' }}>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--color-brand)' }} />
                                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--color-brand)' }} />
                                </span>
                                <span className="text-[10px] text-white/55 font-bold tracking-wider uppercase">Sistema Activo</span>
                            </div>
                        </div>

                        {/* Branding */}
                        <div className="relative z-20 w-full my-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-[--login-bg] font-black text-xs px-2.5 py-1 rounded-lg tracking-wide shrink-0 font-mono"
                                      style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))' }}>
                                    IEQ
                                </span>
                                <div className="text-xs font-bold text-white/90 leading-tight">
                                    Clínica IEQ
                                    <small className="block text-[9px] font-normal text-white/35 tracking-widest uppercase mt-0.5">WorkCenter · Valencia</small>
                                </div>
                            </div>
                            <div className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3">
                                Gestión de Proyectos<br />
                                <span style={{ color: 'var(--color-brand)' }}>IT Hospitalaria</span>
                            </div>
                            <p className="text-sm text-white/40 leading-relaxed max-w-md">
                                Seguimiento de proyectos, aprobaciones de compras y despliegue de infraestructura tecnológica para Clínica IEQ.
                            </p>
                        </div>

                        {/* Real stats from DB */}
                        <div className="relative z-20 flex gap-8 pt-4 border-t border-white/5">
                            <div>
                                <div className="text-xl font-black" style={{ color: 'var(--color-brand)' }}>{stats.activeProjects}</div>
                                <div className="text-[9px] text-white/30 font-medium tracking-wide">Proyectos Activos</div>
                            </div>
                            <div>
                                <div className="text-xl font-black" style={{ color: 'var(--color-brand)' }}>{stats.completedProjects}</div>
                                <div className="text-[9px] text-white/30 font-medium tracking-wide">Completados</div>
                            </div>
                            <div>
                                <div className="text-xl font-black" style={{ color: 'var(--color-brand)' }}>{stats.progressPercentage}%</div>
                                <div className="text-[9px] text-white/30 font-medium tracking-wide">Avance Global</div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block absolute left-[58.333333%] top-0 bottom-0 w-[1px] z-10"
                         style={{ background: 'linear-gradient(to bottom, transparent, rgba(28,183,190,0.2), transparent)' }} />

                    {/* PANEL DERECHO: Login Form */}
                    <div className="relative flex md:col-span-5 p-8 sm:p-10 flex-col justify-center overflow-hidden min-h-[480px]"
                         style={{ background: 'rgba(5, 14, 22, 0.95)' }}>
                        <div className="absolute -top-20 -right-20 w-[200px] h-[200px] rounded-full pointer-events-none"
                             style={{ background: 'radial-gradient(circle, rgba(28,183,190,0.05), transparent)' }} />

                        <div className="relative z-10">
                            {/* Mobile logo */}
                            <div className="flex md:hidden items-center gap-2.5 mb-6">
                                <span className="text-[--login-bg] font-black text-xs px-2 py-0.5 rounded-md tracking-wide shrink-0 font-mono"
                                      style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))' }}>
                                    IEQ
                                </span>
                                <div className="text-xs font-bold text-white/95 leading-tight text-left">
                                    Clínica IEQ
                                    <small className="block text-[8px] font-normal text-white/35 tracking-widest uppercase mt-0.5">WorkCenter</small>
                                </div>
                            </div>

                            <div className="text-[10px] font-bold tracking-[2px] uppercase mb-2.5 flex items-center gap-2"
                                 style={{ color: 'rgba(28,183,190,0.7)' }}>
                                <span className="w-4 h-[1.5px] rounded" style={{ background: 'var(--color-brand)' }} />
                                Acceso Corporativo
                            </div>
                            <div className="text-2xl font-extrabold text-white tracking-tight leading-tight mb-1">
                                Bienvenido<br />de vuelta
                            </div>
                            <p className="text-xs text-white/35 mb-6 leading-relaxed">
                                Ingresa con tus credenciales institucionales.
                            </p>

                            {/* Form */}
                            <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-[10px] font-semibold text-white/35 tracking-wider uppercase">Email Corporativo</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-[--color-brand] transition-colors" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            disabled={isPending}
                                            placeholder="usuario@clinicaieq.com"
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-[--color-brand]/35 focus:ring-1 focus:ring-[--color-brand]/20 transition-all placeholder:text-white/10"
                                            style={{ ['--color-brand' as string]: 'var(--color-brand)' }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-[10px] font-semibold text-white/35 tracking-wider uppercase">Contraseña</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-[--color-brand] transition-colors" />
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            disabled={isPending}
                                            placeholder="••••••••••"
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-10 pr-10 text-xs text-white outline-none focus:border-[--color-brand]/35 focus:ring-1 focus:ring-[--color-brand]/20 transition-all placeholder:text-white/10"
                                        />
                                        <button
                                            type="button"
                                            disabled={isPending}
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
                                            aria-label="Mostrar contraseña"
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Meta row */}
                                <div className="flex justify-between items-center pt-1 select-none">
                                    <label
                                        className="flex items-center gap-2 cursor-pointer text-xs text-white/35"
                                        onClick={() => setRememberMe(!rememberMe)}
                                    >
                                        <div className={`w-[15px] h-[15px] rounded border flex items-center justify-center transition-all ${
                                            rememberMe
                                                ? 'border-[--color-brand]/40 bg-[--color-brand]/10'
                                                : 'border-white/10 bg-white/[0.04]'
                                        }`}>
                                            {rememberMe && (
                                                <svg width="8" height="6" viewBox="0 0 9 7" fill="none">
                                                    <path d="M1 3.5L3.2 6L8 1" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        Mantener activa
                                    </label>
                                </div>

                                {/* Error */}
                                <AnimatePresence mode="wait">
                                    {clientError && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, y: -5 }}
                                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                                            exit={{ opacity: 0, height: 0, y: -5 }}
                                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"
                                        >
                                            <p className="text-xs font-bold text-red-400 leading-tight">
                                                {clientError}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit */}
                                <Button
                                    className="w-full text-white font-bold h-12 text-xs shadow-lg transition-all rounded-xl active:scale-[0.98] relative overflow-hidden cursor-pointer"
                                    style={{ background: `linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))` }}
                                    type="submit"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verificando...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRight className="mr-1.5 h-4 w-4" />
                                            Iniciar Sesión
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-6 text-[10px] font-semibold text-white/15 flex justify-center items-center gap-1 border-t border-white/5 pt-4 z-10">
                            Sistemas &copy; 2026
                        </div>
                    </div>
                </div>
            </MotionWrapper>
        </div>
    )
}
