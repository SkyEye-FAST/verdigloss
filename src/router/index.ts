import { createRouter, createWebHistory } from 'vue-router'
import TranslationQuery from '../components/TranslationQuery.vue'
import TranslationTable from '../components/TranslationTable.vue'

const routes = [
  {
    path: '/',
    name: 'TranslationQuery',
    component: TranslationQuery,
  },
  {
    path: '/table',
    name: 'TranslationTable',
    component: TranslationTable,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
