<template>
  <div class="app-shell">
    <header class="app-bar">
      <router-link class="brand" to="/" aria-label="Verdigloss home">Verdigloss</router-link>
      <nav class="primary-nav" aria-label="Primary navigation">
        <router-link to="/" class="primary-nav__link"
          ><i-material-symbols-manage-search aria-hidden="true" /><span>Query</span></router-link
        >
        <router-link to="/table" class="primary-nav__link"
          ><i-material-symbols-table-view-outline aria-hidden="true" /><span
            >Table</span
          ></router-link
        >
        <router-link to="/quiz" class="primary-nav__link"
          ><i-material-symbols-quiz aria-hidden="true" /><span>Quiz</span></router-link
        >
        <router-link to="/table/color" class="primary-nav__link"
          ><i-material-symbols-colors aria-hidden="true" /><span>Colours</span></router-link
        >
      </nav>
      <div class="app-utilities">
        <a
          class="icon-button"
          href="https://github.com/SkyEye-FAST/verdigloss"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Verdigloss on GitHub"
        >
          <i-fa6-brands-github aria-hidden="true" />
        </a>
        <button
          class="utility-button"
          type="button"
          :aria-label="isDarkMode ? 'Use light theme' : 'Use dark theme'"
          @click="toggleDarkMode"
        >
          <i-material-symbols-dark-mode v-if="isDarkMode" aria-hidden="true" />
          <i-material-symbols-light-mode v-else aria-hidden="true" />
          <span class="utility-button__label">{{ isDarkMode ? 'Dark' : 'Light' }}</span>
        </button>
      </div>
    </header>
    <main id="main-content" class="app-main"><router-view /></main>
    <nav class="mobile-nav" aria-label="Primary navigation">
      <router-link to="/" class="mobile-nav__link"
        ><i-material-symbols-manage-search aria-hidden="true" /><span>Query</span></router-link
      >
      <router-link to="/table" class="mobile-nav__link"
        ><i-material-symbols-table-view-outline aria-hidden="true" /><span>Table</span></router-link
      >
      <router-link to="/quiz" class="mobile-nav__link"
        ><i-material-symbols-quiz aria-hidden="true" /><span>Quiz</span></router-link
      >
      <router-link to="/table/color" class="mobile-nav__link"
        ><i-material-symbols-colors aria-hidden="true" /><span>Colours</span></router-link
      >
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useDarkMode } from '@/composables/useDarkMode'

const { isDarkMode, toggleDarkMode } = useDarkMode()
</script>
