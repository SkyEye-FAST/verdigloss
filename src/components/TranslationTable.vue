<template>
  <div class="translation-table">
    <Header
      v-model:search-query="searchQuery"
      v-model:selected-languages="selectedLanguages"
      :minecraft-version="minecraftVersion"
      :languages="languages"
      :is-dark-mode="isDarkMode"
      @toggle-dark-mode="toggleDarkMode"
    />

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('table.loading') }}</p>
    </div>
    <template v-else>
      <Pagination
        v-model:current-page="currentPage"
        :total-items="filteredTableData.length"
        :items-per-page="itemsPerPage"
        :show-info="true"
      />

      <table>
        <thead>
          <tr>
            <th class="key-column">keys</th>
            <th v-for="lang in displayLanguages" :key="lang" :class="lang">
              {{ lang }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedData" :key="row.key">
            <td class="key-column">{{ row.key }}</td>
            <td v-for="lang in displayLanguages" :key="lang" :class="lang">
              {{ row[lang] }}
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination
        v-model:current-page="currentPage"
        :total-items="filteredTableData.length"
        :items-per-page="itemsPerPage"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import Header from './Table/TableHeader.vue'
import Pagination from './Table/TablePagination.vue'
import enUS from '@#/en_us.json'
import zhCN from '@#/zh_cn.json'
import zhHK from '@#/zh_hk.json'
import zhTW from '@#/zh_tw.json'
import lzh from '@#/lzh.json'
import ja from '@#/ja_jp.json'
import ko from '@#/ko_kr.json'
import vi from '@#/vi_vn.json'
import mcVersion from '@/assets/mc_lang/version.txt?raw'

const minecraftVersion = ref(mcVersion)

const languages = ['en_us', 'zh_cn', 'zh_hk', 'zh_tw', 'lzh', 'ja_jp', 'ko_kr', 'vi_vn']

const translations = ref({
  en_us: enUS,
  zh_cn: zhCN,
  zh_hk: zhHK,
  zh_tw: zhTW,
  lzh: lzh,
  ja_jp: ja,
  ko_kr: ko,
  vi_vn: vi,
})

interface TableRow extends Record<string, string> {
  key: string
}

const loading = ref(true)
const tableData = ref<TableRow[]>([])

const { isDarkMode, toggleDarkMode } = useDarkMode()

onMounted(() => {
  document.body.classList.toggle('dark-mode', isDarkMode.value)
  setTimeout(async () => {
    const keys = Object.keys(translations.value.en_us)
    tableData.value = keys.map((key) => {
      const row: TableRow = { key }
      languages.forEach((lang) => {
        const langData = translations.value[lang as keyof typeof translations.value]
        row[lang] = (langData as Record<string, string>)[key] || '?'
      })
      return row
    })
    loading.value = false
  }, 0)

  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode')
    isDarkMode.value = true
  }
})

const searchQuery = ref('')
const selectedLanguages = ref(languages)

const displayLanguages = computed(() => {
  return languages.filter((lang) => selectedLanguages.value.includes(lang))
})

const filteredTableData = computed(() => {
  return tableData.value.filter((row) => {
    const searchLower = searchQuery.value.toLowerCase()
    if (!searchLower) return true

    return Object.entries(row).some(([key, value]) => {
      if (key === 'key') {
        return value.toLowerCase().includes(searchLower)
      }
      if (selectedLanguages.value.includes(key)) {
        return value.toLowerCase().includes(searchLower)
      }
      return false
    })
  })
})

const currentPage = ref(1)
const itemsPerPage = 50

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTableData.value.slice(start, end)
})

watch(filteredTableData, () => {
  currentPage.value = 1
})
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
  font-family: 'Fira Code', 'Source Code Pro', Consolas, Monaco, monospace !important;
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
  font-family: 'Fira Code', 'Source Code Pro', Consolas, Monaco, monospace;
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

.en_us,
.vi_vn {
  font-family: 'Noto Serif', 'Times New Roman', Simsun, Times, serif;
}

.zh_cn {
  font-family:
    'Noto Serif SC', 'Source Han Serif SC', 'Source Han Serif CN', '思源宋体', 'Times New Roman',
    SimSun, Times, serif;
}

.zh_hk {
  font-family:
    'Noto Serif HK', 'Source Han Serif HC', 'Source Han Serif HK', '思源宋體 香港',
    'Times New Roman', SimSun, Times, serif;
}

.zh_tw {
  font-family:
    'Noto Serif TC', 'Source Han Serif TC', 'Source Han Serif TW', '思源宋体', 'Times New Roman',
    SimSun, Times, serif;
}

.lzh {
  font-family:
    'Shanggu Serif VF', 'I.Ming', 'Noto Serif TC Light', 'Source Han Serif TC Light',
    'Source Han Serif TW Light', '思源宋体 Light', 'Times New Roman', SimSun, Times, serif;
}

.ja_jp {
  font-family:
    'Noto Serif JP', 'Source Han Serif', 'Source Han Serif JP', 'Times New Roman', SimSun, serif;
}

.ko_kr {
  font-family:
    'Noto Serif KR', 'Source Han Serif K', 'Source Han Serif KR', 'Times New Roman', SimSun, Times,
    serif;
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
