'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to console (in production, send to error tracking service)
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
            <div className="text-center space-y-6 max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Something went wrong</h2>
                    <p className="text-muted-foreground">
                        An unexpected error occurred. Please try again or return to the homepage.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={reset} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <Button variant="outline" asChild>
                        <a href="/">Go Home</a>
                    </Button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-6 text-left">
                        <summary className="text-sm text-muted-foreground cursor-pointer">
                            Error Details (dev only)
                        </summary>
                        <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
                            {error.message}
                            {error.stack && '\n\n' + error.stack}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    )
}
