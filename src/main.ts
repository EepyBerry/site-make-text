import { createApp } from 'vue'
import App from './App.vue'
import { createHead } from '@unhead/vue/client'
import '@/assets/sass/index.scss'

createApp(App)
  .use(createHead())
  .mount('#app')
