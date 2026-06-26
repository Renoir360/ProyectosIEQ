import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE() {
    const cookieStore = await cookies()
    cookieStore.delete('auth')
    return NextResponse.json({ success: true, redirect: '/login' })
}
