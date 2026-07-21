<template>
  <div class="translation-query">
    <div class="sidebar-layout" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
      <div class="sidebar">
        <button
          class="toggle-button interactive-control"
          type="button"
          :class="{ 'is-collapsed': !isSidebarOpen }"
          :aria-expanded="isSidebarOpen"
          aria-controls="query-settings"
          :aria-label="isSidebarOpen ? $t('query.controls.collapse') : $t('query.controls.expand')"
          @click="toggleSidebar"
        >
          <i-material-symbols-chevron-left class="toggle-button__icon" aria-hidden="true" />
        </button>
        <Transition
          @before-enter="beforeSettingsEnter"
          @enter="enterSettings"
          @after-enter="afterSettingsEnter"
          @before-leave="beforeSettingsLeave"
          @leave="leaveSettings"
          @after-leave="afterSettingsLeave"
        >
          <div
            v-if="isSidebarOpen"
            id="query-settings"
            class="settings sans"
            :class="currentLang.toLowerCase()"
          >
            <div class="form-container">
              <div class="input-group">
                <label for="queryMode">
                  <i-material-symbols-settings-outline class="label-icon" />
                  {{ $t('query.query_mode') }}
                </label>
                <SelectMenu
                  id="queryMode"
                  v-model="queryMode"
                  :options="[
                    { value: 'source', label: $t('query.query_modes.source') },
                    { value: 'key', label: $t('query.query_modes.key') },
                    { value: 'translation', label: $t('query.query_modes.translation') },
                  ]"
                  @change="onQueryInput"
                />
              </div>

              <div class="input-group" v-show="queryMode === 'translation'">
                <label for="queryLang">
                  <i-material-symbols-language class="label-icon" />
                  {{ $t('query.query_lang') }}
                </label>
                <SelectMenu
                  id="queryLang"
                  class="font-mono"
                  v-model="queryLang"
                  :options="
                    filteredLanguages.map((lang) => ({
                      value: lang.code,
                      label: lang.gameName,
                      htmlLang: lang.htmlLang,
                      typographyClass: lang.typographyClass,
                    }))
                  "
                />
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
                <Transition name="motion-status">
                  <p v-if="resultAnnouncement" class="result-count" aria-live="polite">
                    {{ resultAnnouncement }}
                  </p>
                </Transition>
              </div>

              <div class="input-group" v-show="availableKeys.length">
                <label for="localeKey">
                  <i-material-symbols-key class="label-icon" />
                  {{ $t('query.locale_key') }}
                </label>
                <div ref="keyListRoot" class="query-combobox">
                  <input
                    id="localeKey"
                    ref="keyInput"
                    class="!font-mono"
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
                  <Transition name="motion-popover">
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
                  </Transition>
                </div>
              </div>

              <div class="input-group">
                <label for="selectedLanguages">
                  <i-material-symbols-language class="label-icon" />
                  {{ $t('query.select_languages') }}
                </label>
                <LanguageSelector
                  id="selectedLanguages"
                  class="font-mono"
                  v-model="selectedLanguages"
                  summary-mode="codes"
                  :options="
                    languages
                      .filter((lang) => lang.code !== 'en_us')
                      .map((lang) => ({
                        value: lang.code,
                        label: lang.gameName,
                        htmlLang: lang.htmlLang,
                      }))
                  "
                  @change="search"
                />
              </div>
            </div>
          </div>
        </Transition>
      </div>
      <div class="main-content" tabindex="0">
        <Transition name="motion-status">
          <div v-if="error" class="error" role="alert">{{ error }}</div>
        </Transition>
        <div v-if="selectedTranslation" class="result-section" tabindex="0">
          <div class="title">{{ selectedTranslation.source }}</div>
          <p class="subtitle">{{ selectedTranslation.key }}</p>
          <table :class="'table-' + (selectedTranslation?.category || 'block')">
            <caption class="sr-only">
              {{
                $t('query.results.caption', { source: selectedTranslation.source })
              }}
            </caption>
            <thead>
              <tr>
                <th scope="col" :class="currentLang.toLowerCase()" class="table-header">
                  {{ $t('query.table.langName') }}
                </th>
                <th scope="col" :class="currentLang.toLowerCase()" class="table-header">
                  {{ $t('query.table.translation') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="lang in displayLanguages"
                :key="lang.code"
                :lang="lang.htmlLang"
                :class="lang.code.replace(/_/, '-')"
              >
                <th scope="row" class="lang-name">{{ lang.gameName }}</th>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find((t) => t.code === lang.code)?.text || '—'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
          <footer class="minecraft-title font-app-serif">
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
import { useDismissiblePopover } from '@/composables/useDismissiblePopover'
import { useLocale } from '@/composables/useLocale'
import { type LanguageCode, languageList, languageRegistry } from '@/data/languages'
import { getSearchIndex, type QueryMode } from '@/features/query/search-index'
import { loadLanguages, type LanguageFile } from '@/services/translation-data'
import {
  readLanguageList,
  readStringPreference,
  writeStoredValue,
  writeStringPreference,
} from '@/utils/storage'

import LanguageSelector from './Query/LanguageSelector.vue'
import SelectMenu from './SelectMenu.vue'

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
let settingsTimer: number | undefined

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clearSettingsTimer = () => {
  if (settingsTimer !== undefined) window.clearTimeout(settingsTimer)
  settingsTimer = undefined
}

const beforeSettingsEnter = (element: Element) => {
  const panel = element as HTMLElement
  clearSettingsTimer()
  panel.style.height = '0'
  panel.style.opacity = '0'
  panel.style.transform = 'translateY(-4px)'
  panel.style.overflow = 'hidden'
}

const enterSettings = (element: Element, done: () => void) => {
  const panel = element as HTMLElement
  if (prefersReducedMotion()) {
    panel.style.height = 'auto'
    panel.style.opacity = '1'
    panel.style.transform = 'none'
    done()
    return
  }
  const height = panel.scrollHeight
  panel.style.transition =
    'height var(--motion-slow) var(--ease-enter), opacity var(--motion-base) var(--ease-enter), transform var(--motion-base) var(--ease-enter)'
  window.requestAnimationFrame(() => {
    panel.style.height = `${height}px`
    panel.style.opacity = '1'
    panel.style.transform = 'translateY(0)'
  })
  settingsTimer = window.setTimeout(done, 240)
}

const afterSettingsEnter = (element: Element) => {
  const panel = element as HTMLElement
  clearSettingsTimer()
  panel.style.height = 'auto'
  panel.style.overflow = ''
  panel.style.transition = ''
  panel.style.transform = ''
}

const beforeSettingsLeave = (element: Element) => {
  const panel = element as HTMLElement
  clearSettingsTimer()
  panel.style.height = `${panel.scrollHeight}px`
  panel.style.opacity = '1'
  panel.style.transform = 'translateY(0)'
  panel.style.overflow = 'hidden'
}

const leaveSettings = (element: Element, done: () => void) => {
  const panel = element as HTMLElement
  if (prefersReducedMotion()) {
    done()
    return
  }
  panel.style.transition =
    'height var(--motion-base) var(--ease-exit), opacity var(--motion-fast) var(--ease-exit), transform var(--motion-fast) var(--ease-exit)'
  window.requestAnimationFrame(() => {
    panel.style.height = '0'
    panel.style.opacity = '0'
    panel.style.transform = 'translateY(-2px)'
  })
  settingsTimer = window.setTimeout(done, 200)
}

const afterSettingsLeave = (element: Element) => {
  const panel = element as HTMLElement
  clearSettingsTimer()
  panel.style.height = ''
  panel.style.opacity = ''
  panel.style.transform = ''
  panel.style.overflow = ''
  panel.style.transition = ''
}
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
const keyListRoot = ref<HTMLElement | null>(null)
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
  if (error.value) return ''
  if (!queryContent.value.trim()) return ''
  return t(
    'query.results.matching',
    { count: availableKeys.value.length },
    availableKeys.value.length,
  )
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

function closeKeyList() {
  isKeyListOpen.value = false
  activeKeyIndex.value = -1
}

useDismissiblePopover(keyListRoot, isKeyListOpen, closeKeyList)

const displayLanguages = computed(() => {
  return languages.filter((lang) => selectedLanguages.value.includes(lang.code))
})

const filteredLanguages = computed(() => languages.filter((language) => language.code !== 'en_us'))

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
      name: lang.gameName,
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
</script>

<style scoped>
.translation-query {
  width: 100%;
  min-height: calc(100dvh - 64px);
  padding: var(--space-6);
}

.sidebar-layout {
  --sidebar-track: 24rem;
  display: grid;
  grid-template-columns: var(--sidebar-track) minmax(0, 1fr);
  gap: var(--space-8);
  width: min(100%, var(--content-max));
  margin: 0 auto;
  transition:
    grid-template-columns var(--motion-base) var(--ease-standard),
    gap var(--motion-base) var(--ease-standard);
}

.sidebar-layout.sidebar-collapsed {
  --sidebar-track: var(--control-height);
}

.sidebar {
  position: sticky;
  top: calc(64px + var(--space-4));
  align-self: start;
  min-width: 0;
}

.settings {
  padding: calc(var(--space-5) + var(--control-height)) var(--space-5) var(--space-5);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  overflow: visible;
}

.form-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-5);
}

.input-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-2);
  min-width: 0;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-weight: 700;
}

.label-icon {
  flex: none;
  color: var(--muted);
  font-size: 1.25rem;
}

.input-group input,
.input-group select {
  width: 100%;
  min-width: 0;
  min-height: var(--control-height);
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
}

.toggle-button {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  display: grid;
  place-items: center;
  width: var(--control-height);
  height: var(--control-height);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--on-accent);
}

.toggle-button:not(.is-collapsed) {
  top: var(--space-2);
  right: var(--space-2);
  left: auto;
}

.toggle-button__icon {
  font-size: 1.5em;
  transition: transform var(--motion-base) var(--ease-standard);
}

.sidebar-collapsed .toggle-button__icon {
  transform: rotate(180deg);
}

.query-combobox {
  position: relative;
}

.query-key-results {
  position: absolute;
  z-index: 30;
  top: calc(100% + var(--space-1));
  left: 0;
  width: min(42rem, calc(100vw - 2rem));
  max-height: min(44dvh, 24rem);
  margin: 0;
  padding: var(--space-1);
  overflow: auto;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  box-shadow: var(--shadow-md);
  list-style: none;
}

.query-key-results li {
  padding: 0.55rem 0.65rem;
  border-radius: 4px;
  overflow-wrap: anywhere;
  font-family: var(--monospace-font);
  font-size: 0.84rem;
}

.query-key-results li:hover,
.query-key-results li.active {
  background: var(--accent-soft);
}

.main-content {
  min-width: 0;
  outline: none;
}

.result-count {
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
  line-height: 1.35;
}

.error {
  padding: var(--space-4);
  border-left: 4px solid var(--error);
  background: color-mix(in srgb, var(--error) 8%, var(--surface));
  color: var(--error);
}

.result-section {
  width: min(100%, 58rem);
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2.5rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.title {
  color: var(--text);
  font: 700 clamp(2rem, 5vw, 3.75rem)/1.08 var(--serif-font);
  text-align: center;
  overflow-wrap: anywhere;
}

.subtitle {
  margin: var(--space-3) 0 var(--space-6);
  color: var(--muted);
  font: 500 clamp(1.05rem, 1.8vw, 1.35rem) / 1.45 var(--monospace-font);
  text-align: center;
  overflow-wrap: anywhere;
}

.result-section table {
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  table-layout: fixed;
}

.result-section caption {
  padding-bottom: var(--space-2);
}

.result-section th,
.result-section td {
  padding: clamp(0.7rem, 1.5vw, 1rem);
  border: 1px solid var(--result-accent, var(--accent));
  text-align: center;
  overflow-wrap: anywhere;
}

.result-section thead th {
  background: color-mix(in srgb, var(--result-accent, var(--accent)) 11%, var(--surface));
  font-size: clamp(1.05rem, 2vw, 1.5rem);
}

.lang-name {
  width: 46%;
  font-size: clamp(1.2rem, 2vw, 1.45rem);
  font-weight: 750;
}

.string {
  font-size: clamp(1.35rem, 2.25vw, 1.7rem);
}

.table-advancements {
  --result-accent: #9b3f91;
}

.table-block,
.table-biome {
  --result-accent: #3978aa;
}

.table-effect {
  --result-accent: #a36b00;
}

.table-enchantment {
  --result-accent: #59667a;
}

.table-entity {
  --result-accent: #b65f28;
}

.table-item {
  --result-accent: #4e8035;
}

.result-section tbody tr:nth-child(even) {
  background: color-mix(in srgb, var(--result-accent, var(--accent)) 13%, var(--surface));
}

.minecraft-title {
  margin-top: var(--space-6);
  color: var(--text);
  font-size: clamp(1.45rem, 2.6vw, 2.25rem);
  font-weight: 900;
  line-height: 1.18;
  text-align: center;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .sidebar-layout {
    --sidebar-track: 21rem;
    gap: var(--space-4);
  }
}

@media (max-width: 800px) {
  .translation-query {
    min-height: calc(100dvh - 56px);
    padding: var(--space-3);
  }

  .sidebar-layout,
  .sidebar-layout.sidebar-collapsed {
    display: block;
  }

  .sidebar {
    position: static;
    margin-bottom: var(--space-4);
  }

  .settings {
    padding: var(--space-4);
  }

  .toggle-button {
    position: static;
    width: 100%;
    height: 40px;
    margin-bottom: var(--space-2);
  }

  .toggle-button__icon {
    transform: rotate(90deg);
  }

  .sidebar-collapsed .toggle-button__icon {
    transform: rotate(-90deg);
  }

  .result-section {
    padding: var(--space-4);
  }

  .title {
    font-size: clamp(1.75rem, 10vw, 2.5rem);
  }

  .result-section th,
  .result-section td {
    padding: 0.65rem 0.5rem;
  }

  .lang-name {
    width: 52%;
    font-size: 1rem;
  }

  .string {
    font-size: clamp(1.1rem, 5vw, 1.35rem);
  }

  .subtitle {
    font-size: clamp(0.98rem, 4vw, 1.08rem);
  }
}

@media (max-width: 390px) {
  .result-section {
    padding: var(--space-3);
  }

  .result-section th,
  .result-section td {
    padding-inline: 0.4rem;
  }
}
</style>
