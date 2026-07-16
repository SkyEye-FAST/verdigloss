<template>
  <div class="translation-query">
    <div class="sidebar-layout" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
      <div class="sidebar">
        <button
          class="toggle-button"
          type="button"
          :aria-label="isSidebarOpen ? 'Collapse query controls' : 'Expand query controls'"
          @click="toggleSidebar"
        >
          <i-material-symbols-chevron-left
            v-if="isSidebarOpen"
            style="font-size: 1.5em; color: #fff"
          />
          <i-material-symbols-chevron-right v-else style="font-size: 1.5em; color: #fff" />
        </button>
        <div class="settings sans" :class="currentLang.toLowerCase()" v-show="isSidebarOpen">
          <div class="form-container">
            <div class="input-group">
              <label for="queryMode">
                <i-material-symbols-settings-outline class="label-icon" />
                {{ $t('query.query_mode') }}
              </label>
              <select id="queryMode" v-model="queryMode" @change="onQueryInput">
                <option value="source">
                  {{ $t('query.query_modes.source') }}
                </option>
                <option value="key">
                  {{ $t('query.query_modes.key') }}
                </option>
                <option value="translation">
                  {{ $t('query.query_modes.translation') }}
                </option>
              </select>
            </div>

            <div class="input-group" v-show="queryMode === 'translation'">
              <label for="queryLang">
                <i-material-symbols-language class="label-icon" />
                {{ $t('query.query_lang') }}
              </label>
              <select id="queryLang" v-model="queryLang">
                <option v-for="lang in filteredLanguages" :key="lang.code" :value="lang.code">
                  {{ lang.displayName }}
                </option>
              </select>
            </div>

            <div class="input-group">
              <label for="queryContent">
                <i-material-symbols-search class="label-icon" />
                {{ $t('query.query_content') }}
              </label>
              <input
                id="queryContent"
                v-model="queryContent"
                autocomplete="off"
                @input="onQueryInput"
              />
            </div>

            <div class="input-group" v-show="availableKeys.length">
              <label for="localeKey">
                <i-material-symbols-key class="label-icon" />
                {{ $t('query.locale_key') }}
              </label>
              <div class="query-combobox">
                <input
                  id="localeKey"
                  ref="keyInput"
                  v-model="localeKey"
                  role="combobox"
                  aria-autocomplete="list"
                  :aria-expanded="isKeyListOpen"
                  aria-controls="query-key-results"
                  :aria-activedescendant="
                    activeKeyIndex >= 0 ? `query-key-${activeKeyIndex}` : undefined
                  "
                  @focus="isKeyListOpen = true"
                  @keydown="handleKeyListKeydown"
                />
                <ul
                  v-if="isKeyListOpen"
                  id="query-key-results"
                  class="query-key-results"
                  role="listbox"
                >
                  <li
                    v-for="(key, index) in availableKeys"
                    :id="`query-key-${index}`"
                    :key="key"
                    role="option"
                    :aria-selected="index === activeKeyIndex"
                    :class="{ active: index === activeKeyIndex }"
                    @mousedown.prevent="selectKey(key)"
                  >
                    {{ key }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="input-group">
              <label for="selectedLanguages">
                <i-material-symbols-language class="label-icon" />
                {{ $t('query.select_languages') }}
              </label>
              <LanguageSelector
                v-model="selectedLanguages"
                :options="
                  languages.map((lang) => ({
                    value: lang.code,
                    label: lang.displayName,
                    htmlLang: lang.htmlLang,
                  }))
                "
                @change="search"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="main-content" tabindex="0">
        <p class="result-count" aria-live="polite">{{ resultAnnouncement }}</p>
        <div v-if="error" class="error" role="alert">{{ error }}</div>
        <div v-if="selectedTranslation" class="result-section" tabindex="0">
          <div class="title" :class="{ sans: useSansFont }">{{ selectedTranslation.source }}</div>
          <p class="subtitle">{{ selectedTranslation.key }}</p>
          <table :class="'table-' + (selectedTranslation?.category || 'block')">
            <caption class="sr-only">
              Translations for
              {{
                selectedTranslation.source
              }}
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  :class="[currentLang.toLowerCase(), { sans: useSansFont }]"
                  class="table-header"
                >
                  {{ $t('query.table.langName') }}
                </th>
                <th
                  scope="col"
                  :class="[currentLang.toLowerCase(), { sans: useSansFont }]"
                  class="table-header"
                >
                  {{ $t('query.table.translation') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="lang in displayLanguages"
                :key="lang.code"
                :lang="lang.htmlLang"
                :class="[lang.code.replace(/_/, '-'), { sans: useSansFont }]"
              >
                <th scope="row" class="lang-name">{{ lang.displayName }}</th>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find((t) => t.code === lang.code)?.text || '—'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
          <footer
            class="minecraft-title"
            :class="[currentLang.toLowerCase(), { sans: useSansFont }]"
          >
            {{ $t('query.title') }}<br />
            {{ $t('query.java_edition') }}{{ minecraftVersion }}
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import mcVersion from '@/assets/mc_lang/version.txt?raw'
import { useDarkMode } from '@/composables/useDarkMode'
import { useLocale } from '@/composables/useLocale'
import { type LanguageCode, languageList, languageRegistry } from '@/data/languages'
import { getSearchIndex, type QueryMode } from '@/features/query/search-index'
import { loadLanguages, type LanguageFile } from '@/services/translation-data'
import {
  readLanguageList,
  readStringPreference,
  writeStoredValue,
  writeStringPreference,
  readBooleanPreference,
} from '@/utils/storage'

import LanguageSelector from './Query/LanguageSelector.vue'

const { t } = useI18n()
const minecraftVersion = ref(mcVersion)

interface Translation {
  language: string
  name: string
  key?: string
}

interface SelectedTranslation {
  source: string
  key: string
  category: string
  translations: {
    code: string
    name: string
    text: string
  }[]
}

const languages = languageRegistry.filter((language) => language.availableInQuery)

const isSidebarOpen = ref(true)
const queryMode = ref<QueryMode>(readStringPreference('queryMode', 'source') as QueryMode)
const queryLang = ref(readStringPreference('queryLang', 'zh_cn'))
const queryContent = ref(readStringPreference('queryContent', 'The End'))
const localeKey = ref(readStringPreference('localeKey', 'advancements.end.respawn_dragon.title'))
const selectedLanguages = ref<LanguageCode[]>(
  readLanguageList(
    'verdigloss:query:selectedLanguages:v1',
    languageList,
    ['zh_cn', 'zh_hk', 'zh_tw', 'lzh'],
    ['query:selectedLanguages'],
  ),
)
const translations = ref<Translation[]>([])
const error = ref('')
const selectedTranslation = ref<SelectedTranslation | null>(null)
const { isDarkMode } = useDarkMode()

onMounted(() => {
  document.body.classList.toggle('dark-mode', isDarkMode.value)
})

const langFiles = shallowRef<Partial<Record<LanguageCode, LanguageFile>>>({})
const { locale: currentLang } = useLocale()
let searchRevision = 0

async function ensureLanguages(codes: readonly LanguageCode[]) {
  const missing = codes.filter((code) => !langFiles.value[code])
  if (!missing.length) return
  langFiles.value = { ...langFiles.value, ...(await loadLanguages(missing)) }
}

const keyInput = ref<HTMLInputElement | null>(null)
const isKeyListOpen = ref(false)
const activeKeyIndex = ref(-1)
const availableKeys = computed(() => {
  if (!queryContent.value) return []
  const language = queryMode.value === 'translation' ? getLanguageCode(queryLang.value) : 'en_us'
  const data = language ? langFiles.value[language] : undefined
  if (!language || !data) return []
  const mode = queryMode.value === 'source' ? 'source' : queryMode.value
  return getSearchIndex(language, data)
    .search(mode, queryContent.value, 100)
    .map((result) => result.key)
})
const resultAnnouncement = computed(() => {
  if (error.value) return error.value
  if (!queryContent.value.trim()) return 'Enter a query to search translation keys.'
  return `${availableKeys.value.length} matching translation ${availableKeys.value.length === 1 ? 'key' : 'keys'} available.`
})

function selectKey(key: string) {
  localeKey.value = key
  isKeyListOpen.value = false
  activeKeyIndex.value = -1
  void search()
  keyInput.value?.focus()
}

function handleKeyListKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    isKeyListOpen.value = false
    activeKeyIndex.value = -1
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    isKeyListOpen.value = true
    activeKeyIndex.value = Math.min(activeKeyIndex.value + 1, availableKeys.value.length - 1)
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeKeyIndex.value = Math.max(activeKeyIndex.value - 1, 0)
    return
  }
  if (event.key === 'Enter' && activeKeyIndex.value >= 0) {
    event.preventDefault()
    const key = availableKeys.value[activeKeyIndex.value]
    if (key) selectKey(key)
  }
}

const displayLanguages = computed(() => {
  return languages.filter((lang) => selectedLanguages.value.includes(lang.code))
})

const filteredLanguages = computed(() => languages)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  document.documentElement.style.setProperty(
    '--table-font-size',
    isSidebarOpen.value ? '1.8vw' : '2.4vw',
  )
}

const getCategoryFromKey = (key: string): string => {
  if (key.includes('advancement')) return 'advancements'
  if (key.includes('biome')) return 'biome'
  if (key.includes('block')) return 'block'
  if (key.includes('effect')) return 'effect'
  if (key.includes('enchantment')) return 'enchantment'
  if (key.includes('entity')) return 'entity'
  if (key.includes('item')) return 'item'
  return 'block'
}

const search = async () => {
  const revision = ++searchRevision
  const target = queryMode.value === 'translation' ? getLanguageCode(queryLang.value) : undefined
  await ensureLanguages(['en_us', ...selectedLanguages.value, ...(target ? [target] : [])])
  if (revision !== searchRevision) return
  error.value = ''
  translations.value = []

  if (!queryContent.value.trim() && !localeKey.value) {
    error.value = t('query.error.missing_query_content')
    return
  }

  switch (queryMode.value) {
    case 'key':
      searchByKey(queryContent.value || localeKey.value)
      break
    case 'source':
      searchBySourceText(queryContent.value)
      break
    case 'translation':
      searchByTranslation(queryContent.value)
      break
  }

  if (translations.value.length === 0) {
    error.value = t('query.error.no-matching-translations')
    selectedTranslation.value = null
    return
  }

  if (translations.value.length === 1 || localeKey.value) {
    const keyToUse = localeKey.value || translations.value[0]?.key
    if (keyToUse) {
      updateSelectedTranslation(keyToUse)
    }
  } else {
    const tx = translations.value
    const firstKey = tx[0]?.key
    if (firstKey) {
      localeKey.value = firstKey
      updateSelectedTranslation(firstKey)
    }
  }
}

const searchByKey = (key: string) => {
  const searchText = key.trim().toLowerCase()
  if (!searchText) return
  const english = langFiles.value.en_us
  if (!english) return
  getSearchIndex('en_us', english)
    .search('key', searchText)
    .forEach((result) => collectTranslationsForKey(result.key))
}

const searchBySourceText = (text: string) => {
  const searchText = text.trim().toLowerCase()
  if (!searchText) return
  const english = langFiles.value.en_us
  if (!english) return
  getSearchIndex('en_us', english)
    .search('source', searchText)
    .forEach((result) => collectTranslationsForKey(result.key))
}

const searchByTranslation = (text: string) => {
  const searchText = text.trim().toLowerCase()
  if (!searchText) return

  const langCode = getLanguageCode(queryLang.value)
  const data = langCode ? langFiles.value[langCode] : undefined
  if (!langCode || !data) return
  getSearchIndex(langCode, data)
    .search('translation', searchText)
    .forEach((result) => collectTranslationsForKey(result.key))
}

const collectTranslationsForKey = (key: string) => {
  const en = langFiles.value.en_us || {}
  translations.value.push({
    language: 'en_us',
    name: en[key] || key,
    key: key,
  })
}

const getLanguageCode = (lang: string): LanguageCode | undefined => {
  return languageList.includes(lang as LanguageCode) ? (lang as LanguageCode) : undefined
}

const updateSelectedTranslation = (key: string) => {
  const source = (langFiles.value.en_us || {})[key] || ''
  const category = getCategoryFromKey(key)

  const filteredTranslations = languages
    .filter((lang) => lang.code !== 'en_us')
    .map((lang) => ({
      code: lang.code,
      name: lang.displayName,
      text: (langFiles.value[lang.code] || {})[key] || '',
    }))

  selectedTranslation.value = {
    source,
    key,
    category,
    translations: filteredTranslations,
  }
}

type DebouncedFunction<T extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<T>): void
  cancel: () => void
}

function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): DebouncedFunction<T> {
  const timers = new Map<string, number>()
  const key = 'timer'

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timers.has(key)) {
      window.clearTimeout(timers.get(key))
    }

    const timer = window.setTimeout(() => {
      fn.apply(this, args)
      timers.delete(key)
    }, delay)

    timers.set(key, timer)
  } as DebouncedFunction<T>

  debounced.cancel = () => {
    if (timers.has(key)) {
      window.clearTimeout(timers.get(key))
      timers.delete(key)
    }
  }

  return debounced
}

const onQueryInput = debounce(() => {
  selectedTranslation.value = null
  error.value = ''
  translations.value = []
  localeKey.value = ''

  if (!queryContent.value.trim()) {
    return
  }

  void search()
}, 300)

watch(
  [queryMode, queryLang, queryContent, localeKey, selectedLanguages],
  ([mode, lang, content, key, langs]) => {
    writeStringPreference('queryMode', mode)
    writeStringPreference('queryLang', lang)
    writeStringPreference('queryContent', content)
    writeStringPreference('localeKey', key)
    writeStoredValue('verdigloss:query:selectedLanguages:v1', langs)
  },
)

onMounted(async () => {
  document.documentElement.style.setProperty(
    '--table-font-size',
    isSidebarOpen.value ? '1.8vw' : '2.4vw',
  )

  await ensureLanguages(['en_us', ...selectedLanguages.value, queryLang.value as LanguageCode])
  if (localeKey.value) {
    void search()
  } else if (queryContent.value) {
    onQueryInput()
  }
})

const useSansFont = ref(readBooleanPreference('table:useSansFont', true))
</script>

<style scoped>
.translation-query {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
  margin-left: 350px;
  padding: 2rem;
  transition: margin-left 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

/* Sidebar */
.sidebar-layout {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 350px;
  transition: width 0.3s ease;
  background: #fff;
  z-index: 100;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  padding-top: 2rem;
}

.sidebar-collapsed .sidebar {
  width: 40px;
}

.toggle-button {
  position: absolute;
  top: 1rem;
  right: -30px;
  width: 30px;
  height: 40px;
  background: #7aa2ea;
  color: white;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  z-index: 100;
}

.sidebar-collapsed .main-content {
  margin-left: 40px;
}

.settings {
  height: auto;
  padding: 1.5rem;
  box-sizing: border-box;
  width: 100%;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 500;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-icon {
  font-size: 1.2em;
}

.input-group input,
.input-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
  font-family: inherit;
}

.input-group input:focus,
.input-group select:focus {
  border-color: #7aa2ea;
  outline: none;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.result-card {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.result-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
}

.result-key {
  font-family: var(--monospace-font), monospace;
  color: #666;
  text-align: center;
  margin-bottom: 1.5rem;
}

.translation-item {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.translation-item:last-child {
  border-bottom: none;
}

.lang-name {
  font-weight: 500;
}

.translation-text {
  font-size: 1.1rem;
}

/* Table */
/* Table base styles */
table {
  border-collapse: collapse;
  margin: 1em auto;
}

table td,
table th {
  text-align: center;
  padding: 0.4em 1em;
  border-width: 2px;
  border-style: solid;
  font-size: 1.5em;
}

/* Table themes */
.table-advancements td,
.table-advancements th {
  border-color: #a02b93;
}
.table-advancements tr:nth-child(even) {
  background-color: #a02b9333;
}

.table-block td,
.table-block th {
  border-color: #5b9bd5;
}
.table-block tr:nth-child(even) {
  background-color: #5b9bd533;
}

.table-effect td,
.table-effect th {
  border-color: #ffc000;
}
.table-effect tr:nth-child(even) {
  background-color: #ffc00033;
}

.table-enchantment td,
.table-enchantment th {
  border-color: #44546a;
}
.table-enchantment tr:nth-child(even) {
  background-color: #44546a33;
}

.table-entity td,
.table-entity th {
  border-color: #ed7d31;
}
.table-entity tr:nth-child(even) {
  background-color: #ed7d3133;
}

.table-item td,
.table-item th {
  border-color: #70ad47;
}
.table-item tr:nth-child(even) {
  background-color: #70ad4733;
}

/* Table contents */
.title {
  font-size: 2.5em;
  font-weight: 600;
  text-align: center;
}

.subtitle {
  font-family: var(--monospace-font), monospace;
  font-size: 1.25em;
  text-align: center;
}

.table-header {
  font-size: 2.25em;
  white-space: nowrap;
}

.string {
  font-size: 1.75em;
  min-width: 20vw;
  max-width: 40vw;
}

.lang-name {
  white-space: nowrap;
}

.title {
  font-family: var(--serif-font), serif;
}

.title.sans {
  font-family: var(--sans-font), sans-serif;
}

/* Footer */
.minecraft-title {
  text-align: center;
  font-size: 2.25em;
  font-weight: 900;
  color: #bfbfbf;
}

/* Dark mode */
body.dark-mode .settings,
body.dark-mode .result-card {
  background: #333;
}

body.dark-mode .input-group input,
body.dark-mode .input-group select {
  background: #424242;
  border-color: #555;
  color: #e0e0e0;
}

body.dark-mode .translation-item {
  border-bottom-color: #444;
}

body.dark-mode table td,
body.dark-mode table th {
  border-color: #666;
}

body.dark-mode .sidebar {
  background: #1a1a1a;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3);
}

body.dark-mode .settings {
  background: #1a1a1a;
}

body.dark-mode .input-group label {
  color: #aaa;
}

body.dark-mode .input-group input,
body.dark-mode .input-group select {
  background: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}

body.dark-mode .input-group input:focus,
body.dark-mode .input-group select:focus {
  border-color: #7aa2ea;
}

body.dark-mode .checkbox-group label {
  color: #aaa;
}

body.dark-mode .toggle-button {
  background: #4a4a4a;
}

body.dark-mode .toggle-button:hover {
  background: #5a5a5a;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }

  .left-column {
    position: static;
  }

  .right-column {
    padding: 0;
  }
}

@media (max-width: 768px) {
  .toggle-button {
    display: none;
  }

  .translation-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .lang-name {
    font-size: 0.9rem;
  }

  .translation-text {
    font-size: 1rem;
  }

  .sidebar-layout {
    flex-direction: column;
  }

  .sidebar {
    position: relative;
    width: 100% !important;
    height: auto;
    min-height: auto;
    padding-top: 1rem;
  }

  .settings {
    padding: 1rem;
  }

  .main-content {
    margin-left: 0 !important;
    padding: 1rem;
    min-height: auto;
  }

  .form-container {
    gap: 0.75rem;
  }

  .input-group input,
  .input-group select {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  table {
    width: 100%;
    margin: 0.5em auto;
  }

  table td,
  table th {
    padding: 0.25em 0.5em;
    font-size: 1em;
  }

  .title {
    font-size: 1.75em;
    padding: 0 10px;
  }

  .subtitle {
    font-size: 0.9em;
    word-break: break-all;
    padding: 0 10px;
  }

  .table-header {
    font-size: 1em;
  }

  .string {
    font-size: 0.9em;
    min-width: auto;
    max-width: none;
    word-break: break-word;
  }

  .lang-name {
    font-size: 0.8em;
    padding: 0.4em 0.8em;
  }

  .minecraft-title {
    font-size: 1em;
    margin-top: 1em;
  }

  .result-section {
    max-width: 100%;
    overflow-x: auto;
    padding: 0 10px;
  }

  .input-group {
    margin-bottom: 0.5rem;
  }

  .checkbox-group {
    margin-top: 0.25rem;
  }

  td.string {
    max-width: 60vw;
    overflow-wrap: break-word;
    hyphens: auto;
  }
}

@media (max-width: 480px) {
  table td,
  table th {
    padding: 0.4em 1em;
    font-size: 0.8em;
  }

  .title {
    font-size: 1.5em;
  }

  .subtitle {
    font-size: 0.7em;
  }

  .minecraft-title {
    font-size: 1.2em;
  }

  .form-container {
    gap: 0.5rem;
  }
}

@media (max-height: 480px) and (orientation: landscape) {
  .sidebar {
    position: fixed;
    width: 280px !important;
    height: 100vh;
    padding-top: 0.5rem;
    z-index: 99;
  }

  .settings {
    padding: 0.5rem;
  }

  .main-content {
    margin-left: 280px;
    height: 100vh;
    overflow-y: auto;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  .result-section {
    transform: scale(0.75);
    transform-origin: top center;
    margin: 0;
    width: 100%;
    min-height: min-content;
  }

  .title {
    margin-top: 0;
  }

  table {
    margin: 1rem auto;
    max-width: 100%;
    overflow-x: visible;
  }

  table td,
  table th {
    padding: 0.25em 0.75em;
    font-size: 1.1em;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .sidebar-collapsed .main-content {
    margin-left: 40px !important;
  }

  .result-section {
    margin-top: 1rem;
    width: 100%;
    overflow-x: auto;
  }

  table {
    min-width: 100%;
  }

  table {
    width: auto;
    min-width: 90%;
  }

  table td,
  table th {
    padding: 0.4em 1.5em;
    font-size: clamp(1em, 3vw, 3em);
  }

  .title {
    font-size: clamp(2em, 3.5vw, 4em);
  }

  .subtitle {
    font-size: clamp(1.1em, 2vw, 3em);
  }

  .lang-name {
    font-size: clamp(1em, 2.5vw, 3em);
  }

  .string {
    font-size: clamp(1em, 3vw, 3em);
    min-width: 15vw;
    max-width: 35vw;
  }

  .table-header {
    font-size: 1.5em;
  }

  .minecraft-title {
    font-size: 1.5em;
  }

  .form-container {
    gap: 0.8rem;
  }

  .input-group input,
  .input-group select {
    padding: 0.6rem;
    font-size: 1rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .main-content {
    margin-left: 350px !important;
    padding: 1rem;
    transition: margin-left 0.3s ease;
  }

  table td,
  table th {
    padding: 0.4em 1.5em;
    font-size: clamp(0.8em, var(--table-font-size), 2.5em);
  }

  .lang-name {
    font-size: clamp(0.8em, var(--table-font-size), 2.5em);
  }

  .string {
    font-size: clamp(0.8em, calc(var(--table-font-size) + 0.6vw), 2.5em);
    min-width: 15vw;
    max-width: 35vw;
  }
}

@media (480px <= width <= 1024px) and (max-height: 480px) and (orientation: landscape) {
  .sidebar-collapsed .sidebar {
    width: 40px !important;
  }

  .sidebar-layout {
    height: 100vh;
  }

  .main-content {
    overflow-y: auto;
    height: 100vh;
  }

  .main-content {
    margin-left: 280px !important;
    padding: 1rem;
    transition: margin-left 0.3s ease;
  }
}

/* Phase three task layout overrides the former fixed-width sidebar. */
.translation-query {
  min-height: calc(100dvh - 64px);
}
.sidebar-layout {
  display: grid;
  grid-template-columns: minmax(250px, 320px) minmax(0, 1fr);
  min-height: auto;
  align-items: start;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: var(--space-6);
  gap: var(--space-8);
}
.sidebar,
.sidebar-collapsed .sidebar {
  position: sticky;
  top: calc(64px + var(--space-4));
  width: auto;
  height: auto;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}
.sidebar-collapsed .sidebar {
  width: auto;
}
.toggle-button {
  position: static;
  width: 100%;
  min-height: var(--control-height);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: var(--accent);
}
.settings {
  padding: var(--space-5);
}
.main-content,
.sidebar-collapsed .main-content {
  min-height: 0;
  margin: 0;
  padding: 0;
  align-items: start;
  justify-content: stretch;
}
.result-count {
  min-height: 1.5rem;
  margin: 0 0 var(--space-3);
  color: var(--muted);
  font-size: 0.9rem;
}
.result-section {
  width: min(100%, 960px);
  margin: 0;
  padding: clamp(1rem, 3vw, 2.5rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}
.title {
  color: var(--text);
  font-size: clamp(1.6rem, 4vw, 3rem);
  line-height: 1.15;
}
.subtitle {
  overflow-wrap: anywhere;
  color: var(--muted);
  font-family: var(--monospace-font);
}
.result-section table {
  width: 100%;
  border-color: var(--border-strong);
  background: var(--surface);
  color: var(--text);
}
.result-section th,
.result-section td {
  border-color: var(--border);
}
.result-section .table-header {
  background: var(--surface-subtle);
  color: var(--text);
}
.result-section .lang-name {
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 700;
}
.result-section .string {
  overflow-wrap: anywhere;
}
.minecraft-title {
  margin-top: var(--space-5);
  color: var(--muted);
  font-size: 0.82rem;
  text-align: left;
}
.query-combobox {
  position: relative;
}
.query-key-results {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.25rem);
  right: 0;
  left: 0;
  max-height: 14rem;
  margin: 0;
  padding: 0;
  overflow: auto;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  box-shadow: var(--shadow-md);
  list-style: none;
}
.query-key-results li {
  padding: 0.5rem 0.7rem;
  overflow: hidden;
  font: 0.8rem var(--monospace-font);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.query-key-results li.active,
.query-key-results li:hover {
  background: var(--accent-soft);
  color: var(--accent-strong);
}
@media (max-width: 1023px) {
  .sidebar-layout {
    grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
    padding: var(--space-4);
    gap: var(--space-4);
  }
  .sidebar {
    top: calc(64px + var(--space-2));
  }
}
@media (max-width: 767px) {
  .sidebar-layout {
    display: block;
    padding: var(--space-3);
  }
  .sidebar,
  .sidebar-collapsed .sidebar {
    position: static;
    margin-bottom: var(--space-4);
  }
  .sidebar-collapsed .settings {
    display: none;
  }
  .result-section {
    padding: var(--space-4);
  }
  .result-section table,
  .result-section tbody,
  .result-section tr,
  .result-section th,
  .result-section td {
    display: block;
  }
  .result-section thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  .result-section tr {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border);
  }
  .result-section th,
  .result-section td {
    padding: 0;
    border: 0;
    text-align: start;
  }
  .result-section .string {
    margin-top: 0.25rem;
    font-size: 1.05rem;
  }
}
@media (max-height: 500px) and (orientation: landscape) {
  .sidebar-layout {
    grid-template-columns: 220px minmax(0, 1fr);
  }
  .sidebar {
    position: static;
  }
}
</style>
