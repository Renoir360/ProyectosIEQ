const isDev = process.env.NODE_ENV !== 'production'

export function logError(tag: string, error: unknown) {
    if (isDev) {
        console.error(`[${tag}]`, error)
    }
}
