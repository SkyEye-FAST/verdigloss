<template>
  <header class="header sans" :class="currentLang.toLowerCase()">
    <div class="title">
      <h1>{{ $t('table.title') }}</h1>
      <div class="update-info">
        {{ $t('table.java_edition') }}{{ minecraftVersion }} ·
        {{ $t('table.author') }}
      </div>
    </div>

    <div class="filter-section">
      <div class="search-controls">
        <div class="search-wrapper">
          <i-material-symbols-search class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('table.search_placeholder')"
            class="search-input"
            @input="$emit('update:searchQuery', searchQuery)"
          />
        </div>
        <label class="pagination-checkbox">
          <input
            type="checkbox"
            v-model="usePagination"
            @change="$emit('update:usePagination', usePagination)"
          />
          <span class="checkbox-text">{{ $t('table.use_pagination') }}</span>
        </label>
      </div>
      <div class="language-filter">
        <button class="collapse-button" @click="isLangFilterVisible = !isLangFilterVisible">
          {{ $t('table.selected_languages') }} ({{ selectedLanguages.length }})
          <i-material-symbols-expand-more
            :class="{ 'rotate-180': isLangFilterVisible }"
            class="collapse-icon"
          />
        </button>
        <div class="checkbox-group" :class="{ collapsed: !isLangFilterVisible }">
          <label v-for="lang in languages" :key="lang" class="lang-checkbox">
            <input
              type="checkbox"
              v-model="selectedLanguages"
              :value="lang"
              @change="$emit('update:selectedLanguages', selectedLanguages)"
            />
            <span class="checkbox-text">{{ lang }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="actions">
      <div class="buttons">
        <router-link to="/" class="button">
          <i-material-symbols-manage-search class="icon" />
          {{ $t('table.action.query_tool') }}
        </router-link>
        <router-link to="/quiz" class="button">
          <i-material-symbols-quiz class="icon" />
          {{ $t('table.action.quiz') }}
        </router-link>
        <a href="https://github.com/SkyEye-FAST/verdigloss" class="button" target="_blank">
          <i-fa6-brands-github class="icon" />
          GitHub
        </a>
        <a href="/table.tsv" class="button">
          <i-material-symbols-download class="icon" />
          {{ $t('table.action.download_tsv') }}
        </a>
        <button
          class="button"
          @click="$emit('toggle-dark-mode')"
          :title="$t('table.action.dark_mode')"
        >
          <i-material-symbols-dark-mode v-if="isDarkMode" class="icon" />
          <i-material-symbols-light-mode v-else class="icon" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { currentLocale } from '@/main'

const currentLang = computed(() => currentLocale.value)

defineProps<{
  minecraftVersion: string
  languages: string[]
  isDarkMode: boolean
}>()

defineEmits<{
  'toggle-dark-mode': []
}>()

const searchQuery = defineModel('searchQuery')
const selectedLanguages = defineModel<string[]>('selectedLanguages', {
  default: () => ['en_us', 'zh_cn', 'zh_hk', 'zh_tw', 'lzh'],
})
const usePagination = defineModel('usePagination', { default: true })

const isLangFilterVisible = ref(true)
</script>

<style scoped>
.header {
  margin: 0 auto 0.2rem;
  max-width: 1200px;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.title {
  font-family: var(--sans-font), sans-serif;
  text-align: center;
}

.title h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #2c3e50;
}

.update-info {
  color: #666;
  font-size: 1rem;
  margin-top: 0.3rem;
}

.filter-section {
  margin: 1rem 0;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.search-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

.search-wrapper {
  max-width: 500px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1.2rem;
  z-index: 1;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin: 0 auto;
  display: block;
}

.search-input:focus {
  border-color: #5b9bd5;
  box-shadow: 0 0 0 3px rgba(91, 155, 213, 0.2);
  outline: none;
}

.language-filter {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.collapse-button {
  display: none;
  width: 100%;
  padding: 0.6rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.collapse-button:hover {
  background: #f0f7ff;
  border-color: #5b9bd5;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  max-height: 160px;
  padding: 0.3rem;
}

.checkbox-group.collapsed {
  max-height: 0;
  padding: 0;
  opacity: 0;
}

.checkbox-text {
  font-family: var(--monospace-font), monospace;
  color: #2c3e50;
  font-size: 0.9rem;
}

.lang-checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: #5b9bd5;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
  font-weight: 600;
}

.button:hover {
  background: #4a8ac4;
}

.button .icon {
  color: inherit;
}

button.button {
  border: none;
}

.icon {
  font-size: 1.2rem;
  color: white;
  display: inline-block;
  vertical-align: middle;
}

.pagination-checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pagination-checkbox:hover {
  background: #f0f7ff;
  border-color: #5b9bd5;
}

.pagination-checkbox input[type='checkbox'] {
  width: 16px;
  height: 16px;
}

.collapse-icon {
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Dark mode */
body.dark-mode .header {
  background: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

body.dark-mode .title h1 {
  color: #e0e0e0;
}

body.dark-mode .update-info {
  color: #aaa;
}

body.dark-mode .filter-section {
  background: #2a2a2a;
}

body.dark-mode .search-input {
  background: #424242;
  border-color: #555;
  color: #e0e0e0;
}

body.dark-mode .search-input:focus {
  border-color: #7aa2ea;
  box-shadow: 0 0 0 3px rgba(91, 155, 213, 0.1);
}

body.dark-mode .lang-checkbox {
  background: #333;
  border-color: #555;
  color: #e0e0e0;
}

body.dark-mode .lang-checkbox:hover {
  background: #4a4a4a;
  border-color: #7aa2ea;
}

body.dark-mode .checkbox-text {
  color: #e0e0e0;
}

body.dark-mode .button {
  background: #4a4a4a;
}

body.dark-mode .button:hover {
  background: #5a5a5a;
}

body.dark-mode .pagination-checkbox {
  background: #333;
  border-color: #555;
  color: #e0e0e0;
}

body.dark-mode .pagination-checkbox:hover {
  background: #4a4a4a;
  border-color: #7aa2ea;
}

body.dark-mode .collapse-button {
  background: #333;
  border-color: #555;
  color: #e0e0e0;
}

body.dark-mode .collapse-button:hover {
  background: #4a4a4a;
  border-color: #7aa2ea;
}

body.dark-mode .checkbox-group {
  background: #2a2a2a;
}

/* Responsive styles */
@media (max-width: 768px) {
  .header {
    padding: 1rem;
    margin: 0.5rem;
    border-radius: 8px;
  }

  .title h1 {
    font-size: 1.4rem;
  }

  .buttons {
    gap: 0.5rem;
  }

  .button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }

  .filter-section {
    padding: 0.8rem;
    margin: 1rem 0;
    gap: 1rem;
  }

  .search-input {
    padding: 0.6rem 1rem 0.6rem 2.2rem;
    font-size: 0.9rem;
  }

  .lang-checkbox {
    padding: 0.2rem 0.3rem;
    font-size: 0.8rem;
  }

  .checkbox-group {
    gap: 0.2rem;
  }

  .filter-label {
    font-size: 0.9rem;
  }

  .button .icon {
    font-size: 1.1rem;
  }

  .collapse-button {
    display: flex;
  }

  .checkbox-group {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 0.3rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .checkbox-group::-webkit-scrollbar {
    width: 6px;
  }

  .checkbox-group::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .checkbox-group::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  body.dark-mode .checkbox-group::-webkit-scrollbar-track {
    background: #2a2a2a;
  }

  body.dark-mode .checkbox-group::-webkit-scrollbar-thumb {
    background: #555;
  }
}
</style>
