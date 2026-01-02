import {createApp} from 'vue'
import './style.css'
import App from './App.vue'

import * as Sentry from '@sentry/vue'
import {browserTracingIntegration} from '@sentry/vue'

const app = createApp(App)

const sentryDsn = import.meta.env.VITE_SENTRY_DSN
const sentryEnabled = import.meta.env.PROD && Boolean(sentryDsn)

if (sentryEnabled) {
    Sentry.init({
        app,
        dsn: sentryDsn,
        integrations: [
            browserTracingIntegration(),
        ],
        sendDefaultPii: true,
        tracesSampleRate: 1.0,
        environment: import.meta.env.VITE_SENTRY_ENV ?? 'production',
        release: import.meta.env.VITE_COMMIT_SHA,
    })
} else {
    console.info(
        '[sentry] disabled (non-production or missing VITE_SENTRY_DSN)',
    )
}

app.mount('#app')
