'use client'


export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="w-full py-8 mt-auto relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="glass-card rounded-2xl p-6 border border-white/20 shadow-lg flex items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <span>© {currentYear}</span>
                        <span className="w-1 h-1 bg-slate-400 rounded-full" />
                        <span>Departamento de Sistemas</span>
                        <span className="text-[#1CB7BE] font-bold">IEQ Los Mangos</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
