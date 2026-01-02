import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {initializeSentry} from './utils/sentry'

const app = createApp(App)

// Initialize Sentry with hardened security settings
initializeSentry(app)

app.mount('#app')
