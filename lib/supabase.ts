import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://laoleqohnbanpwvfsydf.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
    console.warn('Advertencia: SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno.')
}

// Usar una clave temporal/ficticia si no está presente para evitar que falle la compilación estática de Next.js
export const supabase = createClient(supabaseUrl, supabaseServiceKey || 'temp-placeholder-key-for-build', {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
})
