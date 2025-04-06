import { createRouter, createWebHistory } from 'vue-router'
import TranslationQuery from '../components/TranslationQuery.vue'
import TranslationTable from '../components/TranslationTable.vue'
import TranslationQuiz from '../components/TranslationQuiz.vue'
import TranslationQuizSub from '../components/TranslationQuizSub.vue'

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
  {
    path: '/quiz',
    name: 'TranslationQuiz',
    component: TranslationQuiz,
    meta: {
      titleKey: 'quiz.title',
    },
  },
  {
    path: '/quiz/:code',
    name: 'TranslationQuizSub',
    component: TranslationQuizSub,
    meta: {
      titleKey: 'quiz.title',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
