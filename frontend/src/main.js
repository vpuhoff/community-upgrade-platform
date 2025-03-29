import { createApp } from 'vue'
import App from './App.vue'
// import router from './router' // Раскомментируй, когда добавишь роутер
// import { createPinia } from 'pinia' // Раскомментируй, когда добавишь Pinia (или Vuex)

const app = createApp(App)

// app.use(createPinia()) // Раскомментируй, когда добавишь Pinia
// app.use(router) // Раскомментируй, когда добавишь роутер

app.mount('#app')
