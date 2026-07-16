<template>
  <div class="translation-table">
    <Header
      v-model:search-query="searchQuery"
      v-model:selected-languages="selectedLanguages"
      v-model:use-pagination="usePagination"
      :minecraft-version="minecraftVersion"
      :languages="tableLanguages"
      v-model:download-all-data="downloadAllData"
      @download="handleDownload"
    />
    <TableSectionNav />

    <Transition name="motion-fade">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>{{ $t('table.loading') }}</p>
      </div>
    </Transition>
    <template v-if="!loading">
      <Pagination
        v-if="usePagination"
        v-model:current-page="currentPage"
        :total-items="filteredTableData.length"
        :items-per-page="itemsPerPage"
        :show-info="true"
        position="top"
      />

      <p id="table-description" class="table-description">
        {{ $t('table.caption') }}
      </p>
      <div
        v-show="hasHorizontalOverflow"
        ref="topScrollbar"
        class="table-horizontal-scrollbar"
        aria-hidden="true"
        @scroll="syncFromTop"
      >
        <div ref="topScrollbarSpacer" class="table-horizontal-scrollbar__spacer"></div>
      </div>
      <div
        ref="tableWrapper"
        class="table-wrapper"
        role="region"
        tabindex="0"
        :aria-labelledby="'table-description'"
        @scroll="syncFromTable"
      >
        <table ref="tableElement">
          <caption class="sr-only">
            {{
              $t('table.caption')
            }}
          </caption>
          <thead>
            <tr v-memo="[displayLanguages]">
              <th scope="col" class="key-column">{{ $t('table.keys') }}</th>
              <th
                v-for="lang in displayLanguages"
                :key="lang"
                scope="col"
                :class="{ selected: selectedLanguages.includes(lang) }"
              >
                {{ lang }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in displayData" :key="row.key" v-memo="[row, displayLanguages]">
              <th scope="row" class="key-column">{{ row.key }}</th>
              <td :class="lang.replace(/_/, '-')" v-for="lang in displayLanguages" :key="lang">
                {{ row[lang] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Transition name="motion-status">
        <p v-if="filteredTableData.length === 0" class="empty-results" role="status">
          {{ $t('table.empty') }}
        </p>
      </Transition>
      <Transition name="motion-status">
        <p v-if="exportFeedback" class="export-feedback" aria-live="polite">{{ exportFeedback }}</p>
      </Transition>

      <Pagination
        v-if="usePagination"
        v-model:current-page="currentPage"
        :total-items="filteredTableData.length"
        :items-per-page="itemsPerPage"
        position="bottom"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import mcVersion from '@/assets/mc_lang/version.txt?raw'
import { useDownload } from '@/composables/useDownload'
import { type LanguageCode, languageList, languageRegistry } from '@/data/languages'
import {
  clampPage,
  filterTranslationKeys,
  pageKeys,
  TABLE_PAGE_SIZE,
} from '@/features/table/table-data'
import { loadLanguages, type LanguageFile } from '@/services/translation-data'
import { readBooleanPreference, readLanguageList, writeStoredValue } from '@/utils/storage'

import Header from './Table/TableHeader.vue'
import Pagination from './Table/TablePagination.vue'
import TableSectionNav from './Table/TableSectionNav.vue'

const minecraftVersion = ref(mcVersion)
const { t } = useI18n()
const languages = languageList
const tableLanguages = languageRegistry.filter((language) => language.availableInTable)
const translations = shallowRef<Partial<Record<LanguageCode, LanguageFile>>>({})
const orderedKeys = shallowRef<string[]>([])

const searchQuery = ref('')

const selectedLanguages = ref<LanguageCode[]>(
  readLanguageList(
    'verdigloss:table:selectedLanguages:v1',
    languageList,
    ['en_us', 'zh_cn', 'zh_hk', 'zh_tw', 'lzh'],
    ['table:selectedLanguages'],
  ),
)

interface TableRow extends Record<string, string> {
  key: string
}

const loading = ref(true)
const usePagination = ref(true)
const downloadAllData = ref(readBooleanPreference('table:downloadAllData', true))
const exportFeedback = ref('')
const tableWrapper = ref<HTMLElement | null>(null)
const tableElement = ref<HTMLTableElement | null>(null)
const topScrollbar = ref<HTMLElement | null>(null)
const topScrollbarSpacer = ref<HTMLElement | null>(null)
const hasHorizontalOverflow = ref(false)
let resizeObserver: ResizeObserver | undefined
let syncingScrollbar = false

function updateHorizontalScrollbar() {
  const wrapper = tableWrapper.value
  const table = tableElement.value
  const spacer = topScrollbarSpacer.value
  if (!wrapper || !table || !spacer) return
  spacer.style.width = `${table.scrollWidth}px`
  hasHorizontalOverflow.value = wrapper.scrollWidth > wrapper.clientWidth + 1
  if (topScrollbar.value) topScrollbar.value.scrollLeft = wrapper.scrollLeft
}

function syncScroll(target: HTMLElement | null, scrollLeft: number) {
  if (!target || syncingScrollbar) return
  syncingScrollbar = true
  target.scrollLeft = scrollLeft
  requestAnimationFrame(() => {
    syncingScrollbar = false
  })
}

function syncFromTop() {
  syncScroll(tableWrapper.value, topScrollbar.value?.scrollLeft ?? 0)
}

function syncFromTable() {
  syncScroll(topScrollbar.value, tableWrapper.value?.scrollLeft ?? 0)
}

async function ensureLanguages(codes: readonly LanguageCode[]) {
  const missing = codes.filter((code) => !translations.value[code])
  if (!missing.length) return
  translations.value = { ...translations.value, ...(await loadLanguages(missing)) }
  if (translations.value.en_us) orderedKeys.value = Object.keys(translations.value.en_us)
}

onMounted(async () => {
  await ensureLanguages(['en_us', ...selectedLanguages.value])
  loading.value = false
  await nextTick()
  updateHorizontalScrollbar()
  resizeObserver = new ResizeObserver(updateHorizontalScrollbar)
  if (tableWrapper.value) resizeObserver.observe(tableWrapper.value)
  if (tableElement.value) resizeObserver.observe(tableElement.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())

const displayLanguages = computed(() => {
  return languages.filter((lang) => selectedLanguages.value.includes(lang))
})

const filteredKeys = computed(() =>
  filterTranslationKeys(
    orderedKeys.value,
    translations.value,
    displayLanguages.value,
    searchQuery.value,
  ),
)
const filteredTableData = computed(() => filteredKeys.value.map(createRow))

const currentPage = ref(1)
const itemsPerPage = TABLE_PAGE_SIZE

function createRow(key: string): TableRow {
  return {
    key,
    ...Object.fromEntries(
      displayLanguages.value.map((language) => [
        language,
        translations.value[language]?.[key] ?? '?',
      ]),
    ),
  }
}

const displayData = computed(() => {
  if (!usePagination.value) {
    return filteredKeys.value.map(createRow)
  }
  return pageKeys(filteredKeys.value, currentPage.value, itemsPerPage).map(createRow)
})

watch([filteredKeys, usePagination], () => {
  currentPage.value = usePagination.value
    ? clampPage(currentPage.value, filteredKeys.value.length, itemsPerPage)
    : 1
})

watch([displayData, displayLanguages], () => void nextTick(updateHorizontalScrollbar))

const {
  downloadTsv,
  downloadCsv,
  downloadJson,
  downloadXml,
  downloadXlsx,
  downloadAllTsv,
  downloadAllCsv,
  downloadAllJson,
  downloadAllXml,
  downloadAllXlsx,
} = useDownload(displayLanguages, displayData, filteredTableData, minecraftVersion.value)

function handleDownload({ type, all }: { type: string; all: boolean }) {
  if (all) {
    if (type === 'tsv') downloadAllTsv()
    else if (type === 'csv') downloadAllCsv()
    else if (type === 'json') downloadAllJson()
    else if (type === 'xml') downloadAllXml()
    else if (type === 'xlsx') downloadAllXlsx()
  } else {
    if (type === 'tsv') downloadTsv()
    else if (type === 'csv') downloadCsv()
    else if (type === 'json') downloadJson()
    else if (type === 'xml') downloadXml()
    else if (type === 'xlsx') downloadXlsx()
  }
  exportFeedback.value = t(all ? 'table.export.started_all' : 'table.export.started_page', {
    format: type.toUpperCase(),
  })
}

watch(
  selectedLanguages,
  (newValue) => {
    writeStoredValue('verdigloss:table:selectedLanguages:v1', newValue)
    void ensureLanguages(['en_us', ...newValue])
  },
  { deep: true },
)
</script>

<style scoped>
.translation-table {
  --app-bar-offset: 64px;
  min-width: 0;
  padding-bottom: var(--space-6);
}

.loading-container {
  display: grid;
  min-height: 18rem;
  place-content: center;
  justify-items: center;
  gap: var(--space-3);
  color: var(--muted);
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin var(--motion-spinner) linear infinite;
}

.table-wrapper {
  width: min(calc(100% - 2rem), var(--content-max));
  max-width: 100%;
  max-height: calc(100dvh - var(--app-bar-offset) - var(--space-4));
  margin: 0 auto;
  overflow: auto;
  overscroll-behavior: contain;
  border-block: 1px solid var(--border);
  background: var(--surface);
  scrollbar-gutter: stable;
  scroll-margin-top: var(--app-bar-offset);
}

.table-description,
.table-horizontal-scrollbar {
  width: min(calc(100% - 2rem), var(--content-max));
  margin-inline: auto;
}

.table-description {
  margin-top: 0;
  margin-bottom: var(--space-2);
  color: var(--muted);
  font-size: 0.9rem;
}

.table-horizontal-scrollbar {
  height: 1.1rem;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-gutter: stable;
}

.table-horizontal-scrollbar__spacer {
  height: 1px;
}

.table-wrapper table {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;
  font-size: 0.88rem;
}

.table-wrapper th,
.table-wrapper td {
  min-width: clamp(12rem, 14vw, 14rem);
  padding: 0.6rem 0.75rem;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  text-align: left;
  vertical-align: top;
  white-space: normal;
  overflow-wrap: anywhere;
}

.table-wrapper thead th {
  position: sticky;
  z-index: 4;
  top: 0;
  border-bottom: 2px solid var(--accent);
  background: var(--surface-subtle);
  color: var(--text-secondary);
  font: 700 0.78rem var(--monospace-font);
}

.table-wrapper tbody tr:nth-child(even) > * {
  background: color-mix(in srgb, var(--surface-subtle) 72%, var(--surface));
}

.table-wrapper tbody tr:hover > * {
  background: var(--accent-soft);
}

.table-wrapper .key-column {
  position: sticky;
  z-index: 2;
  left: 0;
  inline-size: clamp(12rem, 17vw, 17rem);
  min-inline-size: 12rem;
  max-inline-size: 17rem;
  border-right: 1px solid var(--border-strong);
  box-shadow: 5px 0 8px color-mix(in srgb, var(--text) 9%, transparent);
  background: var(--surface);
  font: 0.76rem/1.45 var(--monospace-font);
  overflow-wrap: anywhere;
}

.table-wrapper thead .key-column {
  z-index: 6;
  background: var(--surface-subtle);
}

.table-wrapper tbody tr:nth-child(even) > .key-column {
  background: color-mix(in srgb, var(--surface-subtle) 72%, var(--surface));
}

.table-wrapper tbody tr:hover > .key-column {
  background: var(--accent-soft);
}

.table-wrapper thead th.selected {
  color: var(--accent-strong);
}

.empty-results {
  width: min(calc(100% - 2rem), var(--content-max));
  margin: var(--space-4) auto 0;
  padding: var(--space-4);
  border: 1px dashed var(--border-strong);
  color: var(--muted);
  text-align: center;
}

.export-feedback {
  min-height: 1.5rem;
  width: min(calc(100% - 2rem), var(--content-max));
  margin: var(--space-3) auto 0;
  color: var(--success);
  font-size: 0.9rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 800px) {
  .translation-table {
    --app-bar-offset: 56px;
  }

  .table-wrapper {
    width: 100%;
    max-height: calc(100dvh - var(--app-bar-offset) - 78px);
  }

  .table-description,
  .table-horizontal-scrollbar {
    width: 100%;
  }

  .table-horizontal-scrollbar {
    display: none !important;
  }

  .table-wrapper th,
  .table-wrapper td {
    min-width: 12rem;
    padding: 0.55rem 0.65rem;
  }

  .table-wrapper .key-column {
    inline-size: clamp(9rem, 31vw, 12rem);
    min-inline-size: 9rem;
    max-inline-size: 12rem;
    font-size: 0.7rem;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .table-wrapper {
    max-height: calc(100dvh - var(--app-bar-offset) - var(--space-3));
  }
}
</style>
