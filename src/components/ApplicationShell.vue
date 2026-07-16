<template>
  <div class="app-shell">
    <header class="app-bar">
      <router-link class="brand interactive-control" to="/" :aria-label="$t('app.home')"
        >Verdigloss</router-link
      >
      <nav class="primary-nav" :aria-label="$t('app.primary_navigation')">
        <router-link to="/" class="primary-nav__link interactive-control"
          ><i-material-symbols-manage-search aria-hidden="true" /><span>{{
            $t('app.nav.query')
          }}</span></router-link
        >
        <router-link
          to="/table"
          class="primary-nav__link interactive-control"
          :class="{ 'is-active': route.path.startsWith('/table') }"
          ><i-material-symbols-table-view-outline aria-hidden="true" /><span>{{
            $t('app.nav.table')
          }}</span></router-link
        >
        <router-link to="/quiz" class="primary-nav__link interactive-control"
          ><i-material-symbols-quiz aria-hidden="true" /><span>{{
            $t('app.nav.quiz')
          }}</span></router-link
        >
      </nav>
      <div class="app-utilities">
        <a
          class="icon-button interactive-control"
          href="https://github.com/SkyEye-FAST/verdigloss"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="$t('app.github')"
        >
          <i-fa6-brands-github aria-hidden="true" />
        </a>
        <button
          class="utility-button interactive-control"
          type="button"
          :aria-label="isDarkMode ? $t('app.theme.use_light') : $t('app.theme.use_dark')"
          @click="toggleDarkMode"
        >
          <i-material-symbols-dark-mode v-if="isDarkMode" aria-hidden="true" />
          <i-material-symbols-light-mode v-else aria-hidden="true" />
          <span class="utility-button__label">{{
            isDarkMode ? $t('app.theme.dark') : $t('app.theme.light')
          }}</span>
        </button>
        <button
          class="utility-button interactive-control"
          type="button"
          :aria-label="useSansFont ? $t('app.font.use_serif') : $t('app.font.use_sans')"
          @click="toggleTranslationFont"
        >
          <i-material-symbols-font-download-outline aria-hidden="true" />
          <span class="utility-button__label">{{
            useSansFont ? $t('app.font.sans') : $t('app.font.serif')
          }}</span>
        </button>
      </div>
    </header>
    <main id="main-content" class="app-main">
      <router-view v-slot="{ Component, route: activeRoute }">
        <Transition :name="hasRenderedRoute ? 'route' : ''" mode="out-in">
          <component :is="Component" :key="activeRoute.name" @vnode-mounted="markRouteRendered" />
        </Transition>
      </router-view>
    </main>
    <nav class="mobile-nav" :aria-label="$t('app.primary_navigation')">
      <router-link to="/" class="mobile-nav__link interactive-control"
        ><i-material-symbols-manage-search aria-hidden="true" /><span>{{
          $t('app.nav.query')
        }}</span></router-link
      >
      <router-link
        to="/table"
        class="mobile-nav__link interactive-control"
        :class="{ 'is-active': route.path.startsWith('/table') }"
        ><i-material-symbols-table-view-outline aria-hidden="true" /><span>{{
          $t('app.nav.table')
        }}</span></router-link
      >
      <router-link to="/quiz" class="mobile-nav__link interactive-control"
        ><i-material-symbols-quiz aria-hidden="true" /><span>{{
          $t('app.nav.quiz')
        }}</span></router-link
      >
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import { useDarkMode } from '@/composables/useDarkMode'
import { useTranslationFont } from '@/composables/useTranslationFont'

const route = useRoute()
const hasRenderedRoute = ref(false)
const markRouteRendered = () => {
  hasRenderedRoute.value = true
}
const { isDarkMode, toggleDarkMode } = useDarkMode()
const { useSansFont, toggleTranslationFont } = useTranslationFont()
</script>
