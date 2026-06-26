'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function FloatingBlobs() {
    const [paused, setPaused] = useState(false)

    useEffect(() => {
        const handleVisibility = () => setPaused(document.hidden)
        document.addEventListener('visibilitychange', handleVisibility)
        return () => document.removeEventListener('visibilitychange', handleVisibility)
    }, [])

    if (paused) {
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--color-brand,#1CB7BE)]/25 rounded-full blur-[80px]" />
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />
            </div>
        )
    }

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div
                animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--color-brand,#1CB7BE)]/25 rounded-full blur-[80px]"
            />
            <motion.div
                animate={{ x: [0, -40, 0], y: [0, -60, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-[70px]"
            />
        </div>
    )
}
