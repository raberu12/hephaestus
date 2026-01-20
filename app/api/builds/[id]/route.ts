import { withAuth } from '@/lib/api/with-auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { logger } from '@/lib/logger'

// DELETE: Delete a specific build (owner only)
export const DELETE = withAuth(async (request, { user, supabase, params }) => {
    const id = params?.id

    if (!id) {
        return errorResponse('Build ID is required', 400)
    }

    // RLS will ensure user can only delete their own builds
    const { error } = await supabase
        .from('builds')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        logger.error('Error deleting build', { userId: user.id, buildId: id, error: error.message })
        return errorResponse('Failed to delete build', 500)
    }

    logger.info('Build deleted', { userId: user.id, buildId: id })
    return successResponse({ success: true })
})

// GET: Fetch a specific build
export const GET = withAuth(async (request, { user, supabase, params }) => {
    const id = params?.id

    if (!id) {
        return errorResponse('Build ID is required', 400)
    }

    const { data: build, error } = await supabase
        .from('builds')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !build) {
        return errorResponse('Build not found', 404)
    }

    return successResponse({ build })
})
