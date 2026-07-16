<template>
  <header class="table-header">
    <div class="table-header__title">
      <h1>{{ $t('table.title') }}</h1>
      <p>{{ $t('table.java_edition') }}{{ minecraftVersion }} · {{ $t('table.author') }}</p>
    </div>
    <div class="table-toolbar" aria-label="Table controls">
      <label class="search-field"
        ><span class="sr-only">{{ $t('table.search_placeholder') }}</span
        ><i-material-symbols-search aria-hidden="true" /><input
          :value="searchQuery"
          type="search"
          :placeholder="$t('table.search_placeholder')"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      /></label>
      <LanguageSelector
        v-model="selectedLanguages"
        label="Displayed languages"
        :options="languageOptions"
      />
      <label class="toggle-control"
        ><input v-model="usePagination" type="checkbox" /><span>{{
          $t('table.use_pagination')
        }}</span></label
      >
      <details class="export-menu">
        <summary><i-material-symbols-download aria-hidden="true" /> Export</summary>
        <div class="export-menu__content">
          <label class="toggle-control"
            ><input v-model="downloadAllData" type="checkbox" /><span>{{
              downloadAllData ? 'All filtered rows' : 'Current page'
            }}</span></label
          >
          <div class="export-menu__formats">
            <button v-for="type in formats" :key="type" type="button" @click="emitDownload(type)">
              {{ type.toUpperCase() }}
            </button>
          </div>
        </div>
      </details>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { readBooleanPreference, writeStoredValue } from '@/utils/storage'
import LanguageSelector from '../Query/LanguageSelector.vue'

const props = defineProps<{
  searchQuery: string
  minecraftVersion: string
  languages: string[]
  isDarkMode: boolean
  useSansFont?: boolean
}>()
const emit = defineEmits<{
  'update:searchQuery': [string]
  'toggle-dark-mode': []
  'toggle-sans-font': []
  download: [{ type: 'tsv' | 'csv' | 'json' | 'xml' | 'xlsx'; all: boolean }]
}>()
const selectedLanguages = defineModel<string[]>('selectedLanguages', {
  default: () => ['en_us', 'zh_cn', 'zh_hk', 'zh_tw', 'lzh'],
})
const usePagination = defineModel('usePagination', { default: true })
const downloadAllData = defineModel('downloadAllData', {
  default: readBooleanPreference('table:downloadAllData', true),
})
const formats = ['tsv', 'csv', 'json', 'xml', 'xlsx'] as const
const languageOptions = computed(() =>
  props.languages.map((value) => ({
    value,
    label: value.replace('_', '-'),
    htmlLang: value.replace('_', '-'),
  })),
)
function emitDownload(type: (typeof formats)[number]) {
  emit('download', { type, all: downloadAllData.value })
}
watch(downloadAllData, (value) => writeStoredValue('table:downloadAllData', value))
</script>

<style scoped>
.table-header {
  width: min(100% - 2rem, var(--content-max));
  margin: var(--space-6) auto var(--space-4);
  border-bottom: 1px solid var(--border);
}
.table-header__title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
}
.table-header h1 {
  margin: 0;
  font: 700 clamp(1.5rem, 3vw, 2.25rem)/1.1 var(--serif-font);
  letter-spacing: -0.025em;
}
.table-header p {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}
.table-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1.4fr) minmax(220px, 1fr) auto auto;
  gap: var(--space-3);
  align-items: center;
  padding-bottom: var(--space-4);
}
.search-field {
  position: relative;
  display: flex;
  align-items: center;
  min-height: var(--control-height);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
}
.search-field svg {
  margin-left: 0.7rem;
  color: var(--muted);
}
.search-field input {
  width: 100%;
  min-width: 0;
  height: 42px;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 0 0.7rem;
}
.toggle-control {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: var(--control-height);
  color: var(--text-secondary);
  font-size: 0.9rem;
  white-space: nowrap;
}
.toggle-control input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--accent);
}
.export-menu {
  position: relative;
}
.export-menu summary {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-height: var(--control-height);
  padding: 0 0.75rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-weight: 700;
  list-style: none;
}
.export-menu summary::-webkit-details-marker {
  display: none;
}
.export-menu__content {
  position: absolute;
  z-index: 30;
  right: 0;
  min-width: 230px;
  margin-top: 0.35rem;
  padding: 0.75rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  box-shadow: var(--shadow-md);
}
.export-menu__formats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.35rem;
  margin-top: 0.5rem;
}
.export-menu__formats button {
  min-height: 36px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font: 0.75rem var(--monospace-font);
}
.export-menu__formats button:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
@media (max-width: 1023px) {
  .table-toolbar {
    grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr);
  }
}
@media (max-width: 640px) {
  .table-header {
    width: min(100% - 1rem, var(--content-max));
    margin-top: var(--space-4);
  }
  .table-header__title {
    display: block;
  }
  .table-header__title p {
    margin-top: 0.35rem;
  }
  .table-toolbar {
    grid-template-columns: 1fr;
  }
  .export-menu__content {
    left: 0;
    right: auto;
  }
}
</style>
