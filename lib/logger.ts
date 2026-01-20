type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
    [key: string]: unknown
}

interface LogEntry {
    level: LogLevel
    message: string
    timestamp: string
    context?: LogContext
}

/**
 * Structured logger for consistent logging across the application
 * In production, this could be enhanced to send to a logging service
 */
class Logger {
    private formatEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            ...(context && { context }),
        }
    }

    private log(level: LogLevel, message: string, context?: LogContext): void {
        const entry = this.formatEntry(level, message, context)

        // In development, use colored console output
        if (process.env.NODE_ENV === 'development') {
            const colors = {
                info: '\x1b[36m',    // Cyan
                warn: '\x1b[33m',    // Yellow
                error: '\x1b[31m',   // Red
                debug: '\x1b[35m',   // Magenta
            }
            const reset = '\x1b[0m'

            console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
                `${colors[level]}[${level.toUpperCase()}]${reset} ${message}`,
                context ? JSON.stringify(context, null, 2) : ''
            )
        } else {
            // In production, output structured JSON for log aggregation
            console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
                JSON.stringify(entry)
            )
        }
    }

    info(message: string, context?: LogContext): void {
        this.log('info', message, context)
    }

    warn(message: string, context?: LogContext): void {
        this.log('warn', message, context)
    }

    error(message: string, context?: LogContext): void {
        this.log('error', message, context)
    }

    debug(message: string, context?: LogContext): void {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, context)
        }
    }

    /**
     * Create a child logger with preset context
     */
    child(defaultContext: LogContext): {
        info: (message: string, context?: LogContext) => void
        warn: (message: string, context?: LogContext) => void
        error: (message: string, context?: LogContext) => void
        debug: (message: string, context?: LogContext) => void
    } {
        return {
            info: (message, context) => this.info(message, { ...defaultContext, ...context }),
            warn: (message, context) => this.warn(message, { ...defaultContext, ...context }),
            error: (message, context) => this.error(message, { ...defaultContext, ...context }),
            debug: (message, context) => this.debug(message, { ...defaultContext, ...context }),
        }
    }
}

export const logger = new Logger()

/**
 * Utility to measure and log execution time
 */
export async function withTiming<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
): Promise<T> {
    const start = performance.now()
    try {
        const result = await fn()
        const duration = Math.round(performance.now() - start)
        logger.info(`${operation} completed`, { ...context, durationMs: duration })
        return result
    } catch (error) {
        const duration = Math.round(performance.now() - start)
        logger.error(`${operation} failed`, {
            ...context,
            durationMs: duration,
            error: error instanceof Error ? error.message : String(error)
        })
        throw error
    }
}
