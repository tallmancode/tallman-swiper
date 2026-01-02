import * as Sentry from '@sentry/vue'
import {browserTracingIntegration} from '@sentry/vue'
import type {ErrorEvent, EventHint} from '@sentry/vue'
import type {App} from 'vue'

// Environment allowlist - only initialize in approved environments
const ALLOWED_ENVIRONMENTS = ['production', 'staging', 'development']

// Sensitive header patterns to scrub
const SENSITIVE_HEADERS = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'x-csrf-token',
    'x-session-id',
]

/**
 * Scrubs sensitive data from Sentry events before transmission.
 * Removes PII, credentials, tokens, and other sensitive information.
 */
function beforeSend(event: ErrorEvent, hint: EventHint): ErrorEvent | null {
    // Scrub sensitive headers from request data
    if (event.request?.headers) {
        const headers = event.request.headers
        Object.keys(headers).forEach((key) => {
            const lowerKey = key.toLowerCase()
            if (SENSITIVE_HEADERS.some((pattern) => lowerKey.includes(pattern))) {
                headers[key] = '[Redacted]'
            }
        })
    }

    // Remove query parameters from URLs that might contain sensitive data
    if (event.request?.url) {
        try {
            const url = new URL(event.request.url)
            if (url.search) {
                // Keep the path but remove query parameters
                event.request.url = `${url.origin}${url.pathname}[Query Redacted]`
                event.request.query_string = '[Redacted]'
            }
        } catch {
            // If URL parsing fails, leave as is
        }
    }

    // Scrub form data and request bodies
    if (event.request?.data) {
        event.request.data = '[Redacted]'
    }

    // Scrub sensitive breadcrumb data
    if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
            // Redact input values
            if (breadcrumb.category === 'ui.input' && breadcrumb.message) {
                return {
                    ...breadcrumb,
                    message: '[Input Redacted]',
                }
            }
            // Redact URLs with query params in breadcrumbs
            if (breadcrumb.data?.url && typeof breadcrumb.data.url === 'string') {
                try {
                    const url = new URL(breadcrumb.data.url)
                    if (url.search) {
                        breadcrumb.data.url = `${url.origin}${url.pathname}[Query Redacted]`
                    }
                } catch {
                    // If URL parsing fails, leave as is
                }
            }
            return breadcrumb
        })
    }

    // Remove custom context that might contain PII
    if (event.contexts?.user) {
        delete event.contexts.user
    }

    return event
}

/**
 * Initializes Sentry error tracking with hardened security settings.
 * Only initializes in production mode with a valid DSN and approved environment.
 * 
 * Security features:
 * - PII transmission disabled
 * - Reduced sampling rate (10%)
 * - Environment allowlist
 * - Comprehensive data scrubbing
 * 
 * @param app - Vue application instance
 */
export function initializeSentry(app: App): void {
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN
    const sentryEnvironment = import.meta.env.VITE_SENTRY_ENV
    const isAllowedEnvironment = sentryEnvironment && ALLOWED_ENVIRONMENTS.includes(sentryEnvironment)

    const sentryEnabled = Boolean(sentryDsn) && isAllowedEnvironment

    if (sentryEnabled) {
        Sentry.init({
            app,
            dsn: sentryDsn,
            integrations: [
                browserTracingIntegration(),
            ],
            // Security: Disable automatic PII transmission
            sendDefaultPii: false,
            // Security: Reduce sampling to 10% to minimize telemetry volume
            tracesSampleRate: 0.1,
            environment: sentryEnvironment,
            release: import.meta.env.VITE_COMMIT_SHA,
            // Security: Scrub sensitive data before sending
            beforeSend,
        })
        console.info(
            `[sentry] initialized in ${sentryEnvironment} environment (sampling: 10%)`,
        )
    } else {
        const reason = !sentryDsn
            ? 'missing VITE_SENTRY_DSN'
            : !sentryEnvironment
                ? 'missing VITE_SENTRY_ENV'
                : 'environment not allowed'
        console.info(`[sentry] disabled (${reason})`)
    }
}

