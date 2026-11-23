import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { i18n, ready } from './i18n'
import { vRoving } from './directives/roving'

// The starting language loads first; if that fails the app still starts, in English.
ready.catch(() => undefined).finally(() => createApp(App).use(createPinia()).use(router).use(i18n).directive('roving', vRoving).mount('#app'))
