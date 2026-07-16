import { createApp } from 'vue'
import App from './App.vue'
import '@/assets/styles/main.css'
import { installApplicationServices } from '@/app/bootstrap'

const app = createApp(App)
installApplicationServices(app)
app.mount('#app')
