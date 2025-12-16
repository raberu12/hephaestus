import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Return null if credentials are not configured (e.g., during build)
    if (!supabaseUrl || !supabaseAnonKey) {
        return null
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}
