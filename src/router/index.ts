import { createRouter, createWebHistory } from 'vue-router'
import TranslationQuery from '../components/TranslationQuery.vue'
import TranslationTable from '../components/TranslationTable.vue'
import TranslationQuiz from '../components/TranslationQuiz.vue'
import TranslationQuizSub from '../components/TranslationQuizSub.vue'
import idList from '@/assets/data/id.json'

const validateQuizCode = (code: string): boolean => {
  if (!code || code.length !== 30) return false
  const codeSegments = code.match(/.{3}/g) || []
  return codeSegments.every((seg) => Object.keys(idList).includes(seg))
}

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

router.beforeEach((to, from, next) => {
  if (to.name === 'TranslationQuizSub') {
    const code = to.params.code as string
    if (validateQuizCode(code)) {
      next()
    } else {
      next('/quiz')
    }
  } else {
    next()
  }
})

export default router
