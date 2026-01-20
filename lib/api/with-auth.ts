import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorResponse } from './response'
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Authenticated request context
 */
export interface AuthContext {
    user: User
    supabase: SupabaseClient
}

/**
 * Handler function type for authenticated routes
 * Returns NextResponse with any body type
 */
type AuthenticatedHandler = (
    request: Request,
    context: AuthContext & { params?: Record<string, string> }
) => Promise<NextResponse>

/**
 * Middleware wrapper that handles authentication for API routes
 * Eliminates duplicated auth checks across routes
 * 
 * @example
 * export const GET = withAuth(async (request, { user, supabase }) => {
 *   const { data } = await supabase.from('builds').select('*').eq('user_id', user.id)
 *   return successResponse({ builds: data })
 * })
 */
export function withAuth(handler: AuthenticatedHandler) {
    return async (
        request: Request,
        routeContext?: { params?: Promise<Record<string, string>> }
    ): Promise<NextResponse> => {
        const supabase = await createClient()

        if (!supabase) {
            return errorResponse('Service unavailable', 503, 'SUPABASE_NOT_CONFIGURED')
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return errorResponse('Unauthorized', 401)
        }

        // Resolve params if they exist (Next.js 15+ async params)
        const params = routeContext?.params ? await routeContext.params : undefined

        return handler(request, { user, supabase, params })
    }
}
