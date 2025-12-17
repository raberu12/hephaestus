import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getComponentsByType } from '@/lib/data/components'
import { successResponse, errorResponse } from '@/lib/api/response'
import { ComponentTypeSchema } from '@/lib/validation/schemas'

// Query params validation
const QuerySchema = z.object({
    type: ComponentTypeSchema,
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(2000).optional().default(500),
})

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)

        const query = QuerySchema.parse({
            type: searchParams.get('type'),
            search: searchParams.get('search') || undefined,
            limit: searchParams.get('limit') || undefined,
        })

        const components = getComponentsByType(query.type, {
            search: query.search,
            limit: query.limit,
        })

        return successResponse({
            type: query.type,
            count: components.length,
            components,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse('Invalid query parameters', 400, 'VALIDATION_ERROR', error.errors)
        }

        console.error('Components API error:', error)
        return errorResponse('Failed to fetch components', 500)
    }
}
