import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string
    fallbackTitle: string
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'query', component: () => import('@/components/TranslationQuery.vue'), meta: { titleKey: 'query.title', fallbackTitle: 'Translation query' } },
  { path: '/table', name: 'table', component: () => import('@/components/TranslationTable.vue'), meta: { titleKey: 'table.title', fallbackTitle: 'Translation table' } },
  { path: '/table/color', name: 'colors', component: () => import('@/components/Extra/ColorTable.vue'), meta: { titleKey: 'table.colors.title', fallbackTitle: 'Color table' } },
  { path: '/quiz', name: 'quiz', component: () => import('@/components/TranslationQuiz.vue'), meta: { titleKey: 'quiz.title', fallbackTitle: 'Translation quiz' } },
  { path: '/quiz/:code', name: 'quiz-code', component: () => import('@/components/TranslationQuizSub.vue'), meta: { titleKey: 'quiz.title', fallbackTitle: 'Translation quiz' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/components/NotFoundPage.vue'), meta: { fallbackTitle: 'Page not found' } },
]

export const router = createRouter({ history: createWebHistory(), routes })
