<template>
  <div class="translation-table">
    <Header
      v-model:search-query="searchQuery"
      v-model:selected-languages="selectedLanguages"
      v-model:use-pagination="usePagination"
      :minecraft-version="minecraftVersion"
      :languages="languages"
      :is-dark-mode="isDarkMode"
      :use-sans-font="useSansFont"
      v-model:download-all-data="downloadAllData"
      @toggle-dark-mode="toggleDarkMode"
      @toggle-sans-font="toggleSansFont"
      @download="handleDownload"
    />

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('table.loading') }}</p>
    </div>
    <template v-else>
      <Pagination
        v-if="usePagination"
        v-model:current-page="currentPage"
        :total-items="filteredTableData.length"
        :items-per-page="itemsPerPage"
        :show-info="true"
      />

      <div class="table-wrapper">
        <table>
          <thead>
            <tr v-memo="[displayLanguages, useSansFont]">
              <th class="key-column">keys</th>
              <th v-for="lang in displayLanguages" :key="lang">
                {{ lang }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in displayData"
              :key="row.key"
              v-memo="[row, displayLanguages, useSansFont]"
            >
              <td class="key-column">{{ row.key }}</td>
              <td
                :class="[lang.replace(/_/, '-'), { sans: useSansFont }]"
                v-for="lang in displayLanguages"
                :key="lang"
              >
                {{ row[lang] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        v-if="usePagination"
        v-model:current-page="currentPage"
        :total-items="filteredTableData.length"
        :items-per-page="itemsPerPage"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import mcVersion from '@/assets/mc_lang/version.txt?raw'
import { useDarkMode } from '@/composables/useDarkMode'
import { useDownload } from '@/composables/useDownload'
import { type LanguageCode, languageFiles, languageList } from '@/utils/languages'

import Header from './Table/TableHeader.vue'
import Pagination from './Table/TablePagination.vue'

const minecraftVersion = ref(mcVersion)
const languages = languageList
const translations = ref(languageFiles)

const searchQuery = ref('')

const selectedLanguages = ref<LanguageCode[]>(
  JSON.parse(
    localStorage.getItem('table:selectedLanguages') ||
      '["en_us", "zh_cn", "zh_hk", "zh_tw", "lzh"]',
  ),
)

interface TableRow extends Record<string, string> {
  key: string
}

const loading = ref(true)
const tableData = ref<TableRow[]>([])
const usePagination = ref(true)
const downloadAllData = ref(localStorage.getItem('table:downloadAllData') !== 'false')
const useSansFont = ref(localStorage.getItem('table:useSansFont') !== 'false')

const { isDarkMode, toggleDarkMode } = useDarkMode()

onMounted(() => {
  document.body.classList.toggle('dark-mode', isDarkMode.value)

  requestAnimationFrame(async () => {
    const keys = Object.keys(translations.value.en_us)
    const batchSize = 100
    const totalBatches = Math.ceil(keys.length / batchSize)

    const processBatch = (batchIndex: number) => {
      const start = batchIndex * batchSize
      const end = Math.min(start + batchSize, keys.length)
      const batchKeys = keys.slice(start, end)

      const batchData = batchKeys.map((key) => {
        const row: TableRow = { key }
        languages.forEach((lang) => {
          const langData = translations.value[lang as keyof typeof translations.value]
          row[lang] = (langData as Record<string, string>)[key] || '?'
        })
        return row
      })

      tableData.value = [...tableData.value, ...batchData]

      if (batchIndex + 1 < totalBatches) {
        requestAnimationFrame(() => processBatch(batchIndex + 1))
      } else {
        loading.value = false
      }
    }

    tableData.value = []
    processBatch(0)
  })

  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode')
    isDarkMode.value = true
  }
})

const displayLanguages = computed(() => {
  return languages.filter((lang) => selectedLanguages.value.includes(lang))
})

const filteredTableData = computed(() => {
  const searchLower = searchQuery.value.toLowerCase()
  if (!searchLower) return tableData.value

  return tableData.value.filter((row) => {
    return Object.entries(row).some(([key, value]) => {
      if (key === 'key') {
        return value.toLowerCase().includes(searchLower)
      }
      if (selectedLanguages.value.includes(key as LanguageCode)) {
        return value.toLowerCase().includes(searchLower)
      }
      return false
    })
  })
})

const currentPage = ref(1)
const itemsPerPage = 50

const displayData = computed(() => {
  if (!usePagination.value) {
    return filteredTableData.value
  }
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTableData.value.slice(start, end)
})

watch(filteredTableData, () => {
  if (usePagination.value) {
    currentPage.value = 1
  }
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
} = useDownload(displayLanguages, displayData, filteredTableData)

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
}

watch(
  selectedLanguages,
  (newValue) => {
    localStorage.setItem('table:selectedLanguages', JSON.stringify(newValue))
  },
  { deep: true },
)

const toggleSansFont = () => {
  useSansFont.value = !useSansFont.value
  localStorage.setItem('table:useSansFont', useSansFont.value.toString())
}
</script>

<style scoped>
.translation-table {
  min-height: 100vh;
  padding: 10px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

table {
  width: calc(100% - 20px);
  max-width: 1600px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  table-layout: fixed;
  border-collapse: collapse;
  border: 2px solid #5b9bd5;
  font-size: 14px;
  font-weight: 500;
}

table td,
table th {
  border: 2px solid #5b9bd5;
  padding: 6px 8px;
  text-align: left;
  max-width: 300px;
  min-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

table thead th {
  background-color: #5b9bd5;
  color: white;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 10px 8px;
  font-family: var(--monospace-font), monospace !important;
  border: 2px solid #4a8ac4;
  box-shadow:
    inset 1px 0 0 rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 2px 0 #a9bfd4;
}

table thead th:first-child {
  border-left: none;
}

table thead th:last-child {
  border-right: none;
}

table thead {
  border-bottom: 2px solid #4a8ac4;
}

.key-column {
  min-width: 200px;
  font-family: var(--monospace-font), monospace;
}

table thead th.key-column {
  position: sticky;
  left: 0;
  z-index: 3;
}

table tr td.key-column {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: #f8f9fa;
  font-size: smaller;
}

table tr:nth-child(even) {
  background-color: #5b9bd515;
}

table tr:hover {
  background-color: #5b9bd530;
}

table tr:nth-child(even) td.key-column {
  background-color: #f3f6f8;
}

table tr:hover td.key-column {
  background-color: #e9ecef;
}

table tr:hover td {
  white-space: normal;
  word-break: break-all;
  position: relative;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  margin: 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #5b9bd5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Dark mode */
body.dark-mode .translation-table {
  background-color: #424242;
}

body.dark-mode table {
  background: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border-color: #555;
}

body.dark-mode table td,
body.dark-mode table th {
  border-color: #555;
}

body.dark-mode table thead th {
  background-color: #4a4a4a;
  border-color: #555;
  box-shadow:
    inset 1px 0 0 rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 2px 0 #555;
}

body.dark-mode table tr td.key-column {
  background-color: #2a2a2a;
}

body.dark-mode table tr:nth-child(even) {
  background-color: #3a3a3a;
}

body.dark-mode table tr:nth-child(even) td.key-column {
  background-color: #333;
}

body.dark-mode table tr:hover {
  background-color: #4a4a4a;
}

body.dark-mode table tr:hover td.key-column {
  background-color: #444;
}

/* Responsive styles */
@media (max-width: 768px) {
  table {
    width: calc(100% - 20px);
    font-size: 13px;
    border: 1px solid #5b9bd5;
  }

  table td,
  table th {
    padding: 4px 6px;
    border: 1px solid #5b9bd5;
    min-width: 90px;
  }

  .key-column {
    min-width: 140px;
  }

  table td:first-child {
    min-width: 140px;
  }

  table td,
  table th {
    min-width: 100px;
    padding: 6px 8px;
  }
}
</style>
