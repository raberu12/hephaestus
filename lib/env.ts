import { z } from 'zod'

/**
 * Environment variable schema for runtime validation
 */
const envSchema = z.object({
    // Supabase (optional - app works without auth)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),

    // OpenRouter (required for AI recommendations)
    OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validated environment variables
 * Throws on startup if required variables are missing
 */
function validateEnv(): Env {
    const result = envSchema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    })

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        const missing = Object.entries(errors)
            .map(([key, messages]) => `  ${key}: ${messages?.join(', ')}`)
            .join('\n')

        console.error('❌ Environment validation failed:\n' + missing)

        // Only throw in production - allow dev to continue with warnings
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Missing required environment variables')
        }
    }

    return result.data ?? ({} as Env)
}

export const env = validateEnv()

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
    return !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

/**
 * Check if OpenRouter is configured
 */
export function isOpenRouterConfigured(): boolean {
    return !!env.OPENROUTER_API_KEY
}
