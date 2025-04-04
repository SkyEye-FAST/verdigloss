import { createRouter, createWebHistory } from 'vue-router'
import TranslationQuery from '../components/TranslationQuery.vue'
import TranslationTable from '../components/TranslationTable.vue'

const routes = [
  {
    path: '/',
    name: 'TranslationQuery',
    component: TranslationQuery,
    meta: {
      titleKey: 'query.title',
    },
  },
  {
    path: '/table',
    name: 'TranslationTable',
    component: TranslationTable,
    meta: {
      titleKey: 'table.title',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
