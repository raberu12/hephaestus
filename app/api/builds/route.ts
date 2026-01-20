import { withAuth } from '@/lib/api/with-auth'
import { successResponse, errorResponse, handleValidationError } from '@/lib/api/response'
import { SaveBuildRequestSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { ZodError } from 'zod'

// GET: Fetch all builds for authenticated user
export const GET = withAuth(async (request, { user, supabase }) => {
    const { data: builds, error } = await supabase
        .from('builds')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        logger.error('Error fetching builds', { userId: user.id, error: error.message })
        return errorResponse('Failed to fetch builds', 500)
    }

    return successResponse({ builds })
})

// POST: Save a new build for authenticated user
export const POST = withAuth(async (request, { user, supabase }) => {
    try {
        const body = await request.json()
        const validatedData = SaveBuildRequestSchema.parse(body)

        const { data, error } = await supabase
            .from('builds')
            .insert({
                user_id: user.id,
                name: validatedData.name,
                build: validatedData.build,
                reused_parts: validatedData.reusedParts,
                reasoning: validatedData.reasoning,
                total_price: validatedData.totalPrice,
            })
            .select()
            .single()

        if (error) {
            logger.error('Error saving build', { userId: user.id, error: error.message })
            return errorResponse('Failed to save build', 500)
        }

        logger.info('Build saved successfully', { userId: user.id, buildId: data.id })
        return successResponse({ build: data }, 201)
    } catch (error) {
        if (error instanceof ZodError) {
            return handleValidationError(error)
        }

        logger.error('Error processing save build request', {
            userId: user.id,
            error: error instanceof Error ? error.message : String(error)
        })
        return errorResponse('Invalid request body', 400)
    }
})
