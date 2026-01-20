import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Standardized API error response
 */
export interface ApiError {
    error: {
        code: string
        message: string
        details?: unknown
    }
}

/**
 * Create a standardized error response
 */
export function errorResponse(
    message: string,
    status: number,
    code?: string,
    details?: unknown
): NextResponse<ApiError> {
    const errorBody: ApiError = {
        error: {
            code: code ?? getErrorCode(status),
            message,
        },
    }

    if (details !== undefined) {
        errorBody.error.details = details
    }

    return NextResponse.json(errorBody, { status })
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<T> {
    return NextResponse.json(data, { status })
}

/**
 * Handle Zod validation errors
 */
export function handleValidationError(error: ZodError): NextResponse<ApiError> {
    const issues = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
    }))

    return errorResponse(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        issues
    )
}

/**
 * Get error code from HTTP status
 */
function getErrorCode(status: number): string {
    switch (status) {
        case 400:
            return 'BAD_REQUEST'
        case 401:
            return 'UNAUTHORIZED'
        case 403:
            return 'FORBIDDEN'
        case 404:
            return 'NOT_FOUND'
        case 429:
            return 'RATE_LIMITED'
        case 500:
            return 'INTERNAL_ERROR'
        case 503:
            return 'SERVICE_UNAVAILABLE'
        default:
            return 'ERROR'
    }
}
