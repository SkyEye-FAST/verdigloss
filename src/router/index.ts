import { createRouter, createWebHistory } from 'vue-router'
import TranslationQuery from '../components/TranslationQuery.vue'

const routes = [
  {
    path: '/',
    name: 'TranslationQuery',
    component: TranslationQuery,
  },
  // ...existing code...
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
