import { createApp } from 'vue'
// import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.less'
import hljs from 'vue3-hljs'
import "highlight.js/styles/dark.css"

import gySjmap from 'gy-sjmap'
import gyUi from 'gy-ui'

const app = createApp(App)

// app.use(createPinia())
app.use(router)
app.use(hljs)
app.use(gySjmap)
app.use(gyUi)

app.mount('#app')
