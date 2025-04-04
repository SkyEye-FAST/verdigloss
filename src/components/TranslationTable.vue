<template>
  <div class="translation-table">
    <header class="header">
      <div class="title">
        <h1>Minecraft Standard Translation Table</h1>
        <div class="update-info">Java Edition {{ minecraftVersion }}</div>
        <div class="author">Made by SkyEye_FAST</div>
      </div>

      <div class="filter-section">
        <div class="search-wrapper">
          <i-material-symbols-search class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索内容..."
            class="search-input"
          />
        </div>
        <div class="language-filter">
          <div class="checkbox-group">
            <label v-for="lang in languages" :key="lang" class="lang-checkbox">
              <input
                type="checkbox"
                v-model="selectedLanguages"
                :value="lang"
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
            Query Page
          </RouterLink>
          <a
            href="https://github.com/SkyEye-FAST/verdigloss"
            class="button"
            target="_blank"
          >
            <img
              class="github-icon"
              src="@/assets/images/github-icon.svg"
              alt="GitHub"
            />
            GitHub
          </a>
          <a href="/table.tsv" class="button">
            <i-material-symbols-download class="icon" />
            Download TSV
          </a>
        </div>
      </div>
    </header>

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
        <tr v-for="row in filteredTableData" :key="row.key">
          <td class="key-column">{{ row.key }}</td>
          <td v-for="lang in displayLanguages" :key="lang" :class="lang">
            {{ row[lang] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import enUS from '@#/en_us.json'
import zhCN from '@#/zh_cn.json'
import zhHK from '@#/zh_hk.json'
import zhTW from '@#/zh_tw.json'
import lzh from '@#/lzh.json'
import ja from '@#/ja_jp.json'
import ko from '@#/ko_kr.json'
import vi from '@#/vi_vn.json'

const minecraftVersion = ref('')

const languages = [
  'en_us',
  'zh_cn',
  'zh_hk',
  'zh_tw',
  'lzh',
  'ja_jp',
  'ko_kr',
  'vi_vn',
]

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

const tableData = ref<TableRow[]>([])

onMounted(async () => {
  // 加载版本信息
  try {
    const response = await fetch('/src/assets/mc_lang/version.txt')
    if (response.ok) {
      minecraftVersion.value = await response.text()
    } else {
      console.error('Failed to load version.txt')
      minecraftVersion.value = 'Unknown version'
    }
  } catch (error) {
    console.error('Error loading version.txt:', error)
    minecraftVersion.value = 'Error loading version'
  }

  // 原有的表格数据加载逻辑
  const keys = Object.keys(translations.value.en_us)
  tableData.value = keys.map((key) => {
    const row: TableRow = { key }
    languages.forEach((lang) => {
      const langData =
        translations.value[lang as keyof typeof translations.value]
      row[lang] = (langData as Record<string, string>)[key] || '？'
    })
    return row
  })
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
</script>

<style scoped>
.translation-table {
  background-color: #f9f2e0;
  min-height: 100vh;
  padding: 10px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  margin: 0 auto 1.5rem;
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

.author {
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
  font-style: italic;
  color: #666;
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

.github-icon {
  width: 1.2rem;
  height: 1.2rem;
  display: inline-block;
  vertical-align: middle;
}

.icon {
  font-size: 1.2rem;
  color: white;
  display: inline-block;
  vertical-align: middle;
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
  font-family:
    'Fira Code', 'Source Code Pro', Consolas, Monaco, monospace !important;
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
    'Noto Serif SC', 'Source Han Serif SC', 'Source Han Serif CN', '思源宋体',
    'Times New Roman', SimSun, Times, serif;
}

.zh_hk {
  font-family:
    'Noto Serif HK', 'Source Han Serif HC', 'Source Han Serif HK',
    '思源宋體 香港', 'Times New Roman', SimSun, Times, serif;
}

.zh_tw {
  font-family:
    'Noto Serif TC', 'Source Han Serif TC', 'Source Han Serif TW', '思源宋体',
    'Times New Roman', SimSun, Times, serif;
}

.lzh {
  font-family:
    'Shanggu Serif VF', 'I.Ming', 'Noto Serif TC Light',
    'Source Han Serif TC Light', 'Source Han Serif TW Light', '思源宋体 Light',
    'Times New Roman', SimSun, Times, serif;
}

.ja_jp {
  font-family:
    'Noto Serif JP', 'Source Han Serif', 'Source Han Serif JP',
    'Times New Roman', SimSun, serif;
}

.ko_kr {
  font-family:
    'Noto Serif KR', 'Source Han Serif K', 'Source Han Serif KR',
    'Times New Roman', SimSun, Times, serif;
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

  .translation-table {
    padding: 10px 0;
  }

  table td:first-child {
    min-width: 140px;
  }

  table td,
  table th {
    min-width: 100px;
    padding: 6px 8px;
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
}
</style>
