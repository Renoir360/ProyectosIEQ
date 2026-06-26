'use client'

import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionWrapperProps extends HTMLMotionProps<'div'> {
    children: ReactNode
    delay?: number
    duration?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export const MotionWrapper = ({
    children,
    delay = 0,
    duration = 0.5,
    direction = 'up',
    className,
    ...props
}: MotionWrapperProps) => {
    const directions = {
        up: { y: 20, x: 0 },
        down: { y: -20, x: 0 },
        left: { x: 20, y: 0 },
        right: { x: -20, y: 0 },
        none: { x: 0, y: 0 }
    }

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directions[direction]
            }}
            animate={{
                opacity: 1,
                x: 0,
                y: 0
            }}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export const StaggerContainer = ({ children, delayChildren = 0, staggerChildren = 0.1, className }: { children: ReactNode, delayChildren?: number, staggerChildren?: number, className?: string }) => {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        delayChildren,
                        staggerChildren
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export const StaggerItem = ({ children, direction = 'up', className }: { children: ReactNode, direction?: 'up' | 'down' | 'left' | 'right' | 'none', className?: string }) => {
    const directions = {
        up: { y: 20, x: 0 },
        down: { y: -20, x: 0 },
        left: { x: 20, y: 0 },
        right: { x: -20, y: 0 },
        none: { x: 0, y: 0 }
    }

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, ...directions[direction] },
                show: { opacity: 1, x: 0, y: 0 }
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
