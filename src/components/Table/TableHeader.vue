<template>
  <header class="header">
    <div class="title">
      <h1>{{ $t('table.title') }}</h1>
      <div class="update-info">
        {{ $t('table.java_edition') }}{{ minecraftVersion }} ·
        {{ $t('table.author') }}
      </div>
    </div>

    <div class="filter-section">
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
      <div class="language-filter">
        <div class="checkbox-group">
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
        <RouterLink to="/" class="button">
          <i-material-symbols-manage-search class="icon" />
          {{ $t('table.query_page') }}
        </RouterLink>
        <a
          href="https://github.com/SkyEye-FAST/verdigloss"
          class="button"
          target="_blank"
        >
          <i-fa6-brands-github class="icon" />
          GitHub
        </a>
        <a href="/table.tsv" class="button">
          <i-material-symbols-download class="icon" />
          {{ $t('table.download_tsv') }}
        </a>
        <button
          class="button"
          @click="$emit('toggle-dark-mode')"
          :title="$t('query.nav.dark_mode')"
        >
          <i-material-symbols-dark-mode v-if="isDarkMode" class="icon" />
          <i-material-symbols-light-mode v-else class="icon" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  minecraftVersion: string
  languages: string[]
  isDarkMode: boolean
}>()

defineEmits<{
  'toggle-dark-mode': []
}>()

const searchQuery = defineModel('searchQuery')
const selectedLanguages = defineModel('selectedLanguages')
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
  font-family:
    'Noto Sans',
    'Source Han Sans',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
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

.search-wrapper {
  max-width: 500px;
  margin: 0 auto;
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

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
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

.lang-checkbox:hover {
  background: #f0f7ff;
  border-color: #5b9bd5;
}

.lang-checkbox input[type='checkbox'] {
  width: 16px;
  height: 16px;
}

.checkbox-text {
  font-family: 'Fira Code', 'Source Code Pro', Consolas, Monaco, monospace;
  color: #2c3e50;
  font-size: 0.9rem;
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
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }

  .checkbox-group {
    gap: 0.5rem;
  }

  .filter-label {
    font-size: 0.9rem;
  }

  .button .icon {
    font-size: 1.1rem;
  }
}
</style>
