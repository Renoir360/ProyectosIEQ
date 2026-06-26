'use client'

export function BackgroundGrid() {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-0"
            style={{
                backgroundImage: `radial-gradient(circle, rgba(43, 185, 191, 0.22) 1.5px, transparent 1.5px)`,
                backgroundSize: '24px 24px',
                maskImage: 'radial-gradient(ellipse at top, black 50%, transparent 95%)',
                WebkitMaskImage: 'radial-gradient(ellipse at top, black 50%, transparent 95%)'
            }}
        />
    )
}
