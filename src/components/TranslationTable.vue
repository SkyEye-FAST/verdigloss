<template>
  <div class="translation-table" :aria-busy="loading">
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

    <div v-if="loading" class="loading-container" role="status" aria-live="polite">
      <div class="loading-spinner" aria-hidden="true"></div>
      <p>{{ $t('table.loading') }}</p>
    </div>
    <template v-if="!loading">
      <Pagination
        v-if="usePagination"
        v-model:current-page="currentPage"
        :total-items="filteredTableData.length"
        :items-per-page="itemsPerPage"
        :show-info="true"
        position="top"
      />

      <p class="sr-only" aria-live="polite">{{ tableStatus }}</p>

      <div
        v-if="!isCompactLayout"
        class="table-wrapper"
        role="region"
        tabindex="0"
        :aria-label="$t('table.caption')"
      >
        <table :style="{ width: `${16 + displayLanguageMetadata.length * 14}rem` }">
          <caption class="sr-only">
            {{
              $t('table.caption')
            }}
          </caption>
          <colgroup>
            <col class="key-column-track" />
            <col
              v-for="language in displayLanguageMetadata"
              :key="language.code"
              class="language-column-track"
            />
          </colgroup>
          <thead>
            <tr v-memo="[displayLanguageMetadata]">
              <th scope="col" class="key-column">{{ $t('table.keys') }}</th>
              <th
                v-for="language in displayLanguageMetadata"
                :key="language.code"
                scope="col"
                :class="{ selected: selectedLanguages.includes(language.code) }"
              >
                <code aria-hidden="true">{{ language.code }}</code>
                <span class="sr-only" :lang="language.htmlLang">{{ language.gameName }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in displayData"
              :key="row.key"
              v-memo="[row, displayLanguages]"
              data-testid="translation-row"
            >
              <th scope="row" class="key-column">{{ row.key }}</th>
              <td
                v-for="language in displayLanguageMetadata"
                :key="language.code"
                :class="language.typographyClass"
                :lang="language.htmlLang"
              >
                {{ row[language.code] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ol
        v-else
        class="mobile-table-list"
        :aria-label="$t('table.caption')"
        data-testid="translation-card-list"
      >
        <li
          v-for="(row, rowIndex) in displayData"
          :key="row.key"
          class="mobile-table-card"
          data-testid="translation-row"
        >
          <article :aria-labelledby="`translation-key-${currentPage}-${rowIndex}`">
            <h2 :id="`translation-key-${currentPage}-${rowIndex}`">
              {{ row.key }}
            </h2>
            <dl>
              <div
                v-for="language in displayLanguageMetadata"
                :key="language.code"
                class="mobile-translation"
              >
                <dt>
                  <span :class="language.typographyClass" :lang="language.htmlLang">{{
                    language.gameName
                  }}</span>
                  <code>{{ language.code }}</code>
                </dt>
                <dd :class="language.typographyClass" :lang="language.htmlLang">
                  {{ row[language.code] }}
                </dd>
              </div>
            </dl>
          </article>
        </li>
      </ol>

      <Transition name="motion-status">
        <p v-if="filteredTableData.length === 0" class="empty-results" role="status">
          {{ $t('table.empty') }}
        </p>
      </Transition>
      <Transition name="motion-status">
        <p v-if="exportFeedback" class="export-feedback" role="status" aria-live="polite">
          {{ exportFeedback }}
        </p>
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
import { useMediaQuery } from '@vueuse/core'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
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
const isCompactLayout = useMediaQuery('(max-width: 800px)')
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

async function ensureLanguages(codes: readonly LanguageCode[]) {
  const missing = codes.filter((code) => !translations.value[code])
  if (!missing.length) return
  translations.value = {
    ...translations.value,
    ...(await loadLanguages(missing)),
  }
  if (translations.value.en_us) orderedKeys.value = Object.keys(translations.value.en_us)
}

onMounted(async () => {
  await ensureLanguages(['en_us', ...selectedLanguages.value])
  loading.value = false
})

const displayLanguages = computed(() => {
  return languages.filter((lang) => selectedLanguages.value.includes(lang))
})
const displayLanguageMetadata = computed(() =>
  tableLanguages.filter((language) => selectedLanguages.value.includes(language.code)),
)

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
const itemsPerPage = computed(() => (isCompactLayout.value ? 10 : TABLE_PAGE_SIZE))

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
  return pageKeys(filteredKeys.value, currentPage.value, itemsPerPage.value).map(createRow)
})

const tableStatus = computed(() => {
  const total = filteredTableData.value.length
  if (!total) return ''
  if (!usePagination.value) return t('table.results_status_all', { total })
  const start = (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(currentPage.value * itemsPerPage.value, total)
  return t('table.results_status_page', {
    start,
    end,
    total,
    page: currentPage.value,
    pages: Math.ceil(total / itemsPerPage.value),
  })
})

watch([filteredKeys, usePagination], () => {
  currentPage.value = usePagination.value
    ? clampPage(currentPage.value, filteredKeys.value.length, itemsPerPage.value)
    : 1
})
watch(itemsPerPage, () => {
  currentPage.value = 1
})

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

.table-wrapper table {
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 0.88rem;
}

.table-wrapper .key-column-track {
  width: 16rem;
}

.table-wrapper .language-column-track {
  width: 14rem;
}

.table-wrapper th,
.table-wrapper td {
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
  border-right: 1px solid var(--border-strong);
  background: var(--surface);
  box-shadow: 5px 0 8px color-mix(in srgb, var(--text) 9%, transparent);
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

.table-wrapper thead code {
  color: inherit;
  font: inherit;
}

.mobile-table-list {
  display: grid;
  gap: var(--space-3);
  width: min(calc(100% - 1rem), var(--content-max));
  margin: 0 auto;
  padding: 0;
  list-style: none;
}

.mobile-table-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.mobile-table-card h2 {
  margin: 0;
  padding: var(--space-3);
  border-bottom: 2px solid var(--accent);
  background: var(--surface-subtle);
  color: var(--text);
  font: 700 0.78rem/1.45 var(--monospace-font);
  overflow-wrap: anywhere;
}

.mobile-table-card dl {
  margin: 0;
}

.mobile-translation + .mobile-translation {
  border-top: 1px solid var(--border);
}

.mobile-translation dt {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3) 0;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
}

.mobile-translation dt span {
  min-width: 0;
  color: var(--text);
  overflow-wrap: anywhere;
}

.mobile-translation dt code {
  flex: none;
  color: var(--muted);
  font: 0.72rem var(--monospace-font);
}

.mobile-translation dd {
  margin: 0;
  padding: var(--space-1) var(--space-3) var(--space-3);
  color: var(--text);
  font-size: 1.05rem;
  overflow-wrap: anywhere;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 800px) {
  .translation-table {
    --app-bar-offset: 56px;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .table-wrapper {
    max-height: calc(100dvh - var(--app-bar-offset) - var(--space-3));
  }
}
</style>
