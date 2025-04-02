<template>
  <div class="translation-query">
    <div
      class="sidebar-layout"
      :class="{ 'sidebar-collapsed': !isSidebarOpen }"
    >
      <div class="sidebar">
        <button class="toggle-button" @click="toggleSidebar">
          <i-material-symbols-chevron-left
            v-if="isSidebarOpen"
            style="font-size: 1.5em; color: #fff"
          />
          <i-material-symbols-chevron-right
            v-else
            style="font-size: 1.5em; color: #fff"
          />
        </button>
        <div class="settings" v-show="isSidebarOpen">
          <div class="form-container">
            <div class="input-group">
              <label for="queryMode">查询模式：</label>
              <select id="queryMode" v-model="queryMode" @change="onQueryInput">
                <option value="source">按源字符串查询</option>
                <option value="key">按本地化键名查询</option>
                <option value="translation">按翻译后字符串查询</option>
              </select>
            </div>

            <div class="input-group" v-show="queryMode === 'translation'">
              <label for="queryLang">查询语言：</label>
              <select id="queryLang" v-model="queryLang">
                <option
                  v-for="lang in filteredLanguages"
                  :key="lang.code"
                  :value="lang.name"
                >
                  {{ lang.displayName }}
                </option>
              </select>
            </div>

            <div class="input-group">
              <label for="queryContent">查询内容：</label>
              <input
                id="queryContent"
                v-model="queryContent"
                autocomplete="off"
                @input="onQueryInput"
              />
            </div>

            <div class="input-group" v-show="availableKeys.length">
              <label for="localeKey">选择本地化键名：</label>
              <select id="localeKey" v-model="localeKey" @change="search">
                <option v-for="key in availableKeys" :key="key" :value="key">
                  {{ key }}
                </option>
              </select>
            </div>

            <div class="checkbox-group">
              <input
                type="checkbox"
                id="enableOtherLang"
                v-model="enableOtherLang"
                @change="search"
              />
              <label for="enableOtherLang">启用非中文语言</label>
            </div>
          </div>
        </div>
      </div>
      <div class="main-content">
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="selectedTranslation" class="result-section">
          <div class="title">{{ selectedTranslation.source }}</div>
          <p class="subtitle">{{ selectedTranslation.key }}</p>
          <table :class="'table-' + (selectedTranslation?.category || 'block')">
            <thead>
              <tr>
                <th class="table-header">语言名称</th>
                <th class="table-header">译名</th>
              </tr>
            </thead>
            <tbody>
              <tr lang="zh-Hans-CN" class="zh-cn">
                <td class="lang-name">简体中文&#10;(中国大陆)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'zh-cn',
                    )?.text
                  }}
                </td>
              </tr>
              <tr lang="zh-Hant-HK" class="zh-hk">
                <td class="lang-name">繁體中文&#10;(香港特別行政區)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'zh-hk',
                    )?.text
                  }}
                </td>
              </tr>
              <tr lang="zh-Hant-TW" class="zh-tw">
                <td class="lang-name">繁體中文&#10;(台灣)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'zh-tw',
                    )?.text
                  }}
                </td>
              </tr>
              <tr lang="lzh" class="lzh">
                <td class="lang-name">文言&#10;(華夏)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'lzh',
                    )?.text
                  }}
                </td>
              </tr>
              <tr v-if="enableOtherLang" lang="ja" class="ja">
                <td class="lang-name">日本語&#10;(日本)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'ja',
                    )?.text
                  }}
                </td>
              </tr>
              <tr v-if="enableOtherLang" lang="ko" class="ko">
                <td class="lang-name">한국어&#10;(대한민국)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'ko',
                    )?.text
                  }}
                </td>
              </tr>
              <tr v-if="enableOtherLang" lang="vi" class="vi">
                <td class="lang-name">Tiếng Việt&#10;(Việt Nam)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'vi',
                    )?.text
                  }}
                </td>
              </tr>
            </tbody>
          </table>
          <footer class="minecraft-title">
            Minecraft Standard Translations<br />
            {{ currentDateTime }}
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type ComponentPublicInstance } from 'vue'
import enUS from '../assets/mc_lang/valid/en_us.json'
import zhCN from '../assets/mc_lang/valid/zh_cn.json'
import zhHK from '../assets/mc_lang/valid/zh_hk.json'
import zhTW from '../assets/mc_lang/valid/zh_tw.json'
import lzh from '../assets/mc_lang/valid/lzh.json'
import ja from '../assets/mc_lang/valid/ja_jp.json'
import ko from '../assets/mc_lang/valid/ko_kr.json'
import vi from '../assets/mc_lang/valid/vi_vn.json'

interface Translation {
  language: string
  name: string
  key?: string
}

interface LangMap {
  [key: string]: string
}

interface LangFiles {
  [key: string]: LangMap
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

interface LanguageInfo {
  code: string
  name: string
  displayName: string
}

export default defineComponent({
  data() {
    const languages: LanguageInfo[] = [
      {
        code: 'en-us',
        name: 'en_us',
        displayName: 'English (US)',
      },
      {
        code: 'zh-cn',
        name: 'zh_cn',
        displayName: '简体中文 (中国大陆)',
      },
      {
        code: 'zh-hk',
        name: 'zh_hk',
        displayName: '繁體中文 (香港特別行政區)',
      },
      {
        code: 'zh-tw',
        name: 'zh_tw',
        displayName: '繁體中文 (台灣)',
      },
      {
        code: 'lzh',
        name: 'lzh',
        displayName: '文言 (華夏)',
      },
      {
        code: 'ja',
        name: 'ja_jp',
        displayName: '日本語 (日本)',
      },
      {
        code: 'ko',
        name: 'ko_kr',
        displayName: '한국어 (대한민국)',
      },
      {
        code: 'vi',
        name: 'vi_vn',
        displayName: 'Tiếng Việt (Việt Nam)',
      },
    ]

    return {
      isSidebarOpen: true,
      queryMode: localStorage.getItem('queryMode') || 'source',
      queryLang: localStorage.getItem('queryLang') || 'zh_cn',
      queryContent: localStorage.getItem('queryContent') || 'The End',
      localeKey:
        localStorage.getItem('localeKey') ||
        'advancements.end.respawn_dragon.title',
      enableOtherLang: false,
      translations: [] as Translation[],
      error: '',
      source: '',
      langFiles: {
        'en-us': enUS,
        'zh-cn': zhCN,
        'zh-hk': zhHK,
        'zh-tw': zhTW,
        lzh: lzh,
        ja: ja,
        ko: ko,
        vi: vi,
      } as LangFiles,
      selectedTranslation: null as SelectedTranslation | null,
      languages,
    }
  },

  watch: {
    queryMode(newValue) {
      localStorage.setItem('queryMode', newValue)
    },
    queryLang(newValue) {
      localStorage.setItem('queryLang', newValue)
    },
    queryContent(newValue) {
      localStorage.setItem('queryContent', newValue)
    },
    localeKey(newValue) {
      localStorage.setItem('localeKey', newValue)
    },
  },

  mounted() {
    this.search()
  },

  computed: {
    availableKeys(): string[] {
      if (!this.queryContent) return []

      const searchText = this.queryContent.trim().toLowerCase()

      switch (this.queryMode) {
        case 'key':
          return Object.keys(this.langFiles['en-us']).filter((key) =>
            key.toLowerCase().includes(searchText),
          )

        case 'source':
          return Object.entries(this.langFiles['en-us'])
            .filter(([, value]) => value.toLowerCase().includes(searchText))
            .map(([key]) => key)

        case 'translation':
          const langCode = this.getLanguageCode(this.queryLang)
          if (!langCode || !this.langFiles[langCode]) return []

          return Object.entries(this.langFiles[langCode])
            .filter(([, value]) => value.toLowerCase().includes(searchText))
            .map(([key]) => key)

        default:
          return []
      }
    },
    currentDateTime() {
      const date = new Date()
      const timeZone = -date.getTimezoneOffset() / 60
      const timeZoneStr = `UTC${timeZone >= 0 ? '+' : '-'}${Math.abs(timeZone)}`
      return `${date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })} (${timeZoneStr})`
    },
    filteredLanguages(): LanguageInfo[] {
      return this.languages.filter((lang) => {
        if (!this.enableOtherLang) {
          return ['zh-cn', 'zh-hk', 'zh-tw', 'lzh'].includes(lang.code)
        }
        return lang.code !== 'en-us'
      })
    },
  },

  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    getCategoryFromKey(key: string): string {
      if (key.includes('advancement')) return 'advancements'
      if (key.includes('biome')) return 'biome'
      if (key.includes('block')) return 'block'
      if (key.includes('effect')) return 'effect'
      if (key.includes('enchantment')) return 'enchantment'
      if (key.includes('entity')) return 'entity'
      if (key.includes('item')) return 'item'
      return 'block'
    },

    search() {
      this.error = ''
      this.translations = []

      if (!this.queryContent.trim() && !this.localeKey) {
        this.error = '请输入查询内容'
        return
      }

      switch (this.queryMode) {
        case 'key':
          this.searchByKey(this.queryContent || this.localeKey)
          break
        case 'source':
          this.searchBySourceText(this.queryContent)
          break
        case 'translation':
          this.searchByTranslation(this.queryContent)
          break
      }

      if (this.translations.length === 0) {
        this.error = '未找到匹配的翻译'
        this.selectedTranslation = null
        return
      }

      if (this.translations.length === 1 || this.localeKey) {
        const keyToUse = this.localeKey || this.translations[0].key
        if (keyToUse) {
          this.updateSelectedTranslation(keyToUse)
        }
      } else if (this.translations[0].key) {
        this.localeKey = this.translations[0].key
        this.updateSelectedTranslation(this.translations[0].key)
      }
    },

    searchByKey(key: string) {
      const searchText = key.trim().toLowerCase()
      if (!searchText) return

      Object.keys(this.langFiles['en-us'])
        .filter((key) => key.toLowerCase().includes(searchText))
        .forEach((key) => this.collectTranslationsForKey(key))
    },

    searchBySourceText(text: string) {
      const searchText = text.trim().toLowerCase()
      if (!searchText) return

      Object.entries(this.langFiles['en-us'])
        .filter(([, value]) => value.toLowerCase().includes(searchText))
        .forEach(([key]) => this.collectTranslationsForKey(key))
    },

    searchByTranslation(text: string) {
      const searchText = text.trim().toLowerCase()
      if (!searchText) return

      const langCode = this.getLanguageCode(this.queryLang)
      if (!langCode || !this.langFiles[langCode]) return

      Object.entries(this.langFiles[langCode])
        .filter(([, value]) => value.toLowerCase().includes(searchText))
        .forEach(([key]) => this.collectTranslationsForKey(key))
    },

    collectTranslationsForKey(key: string) {
      this.translations.push({
        language: 'en-us',
        name: this.langFiles['en-us'][key],
        key: key,
      })
    },

    getLanguageCode(lang: string): string {
      const codeMap: { [key: string]: string } = {
        zh_cn: 'zh-cn',
        zh_hk: 'zh-hk',
        zh_tw: 'zh-tw',
        lzh: 'lzh',
        ja_jp: 'ja',
        ko_kr: 'ko',
        vi_vn: 'vi',
      }
      return codeMap[lang] || ''
    },

    onQueryInput: debounce(function (
      this: ComponentPublicInstance & {
        selectedTranslation: SelectedTranslation | null
        error: string
        translations: Translation[]
        queryContent: string
        localeKey: string
        search: () => void
      },
    ) {
      this.selectedTranslation = null
      this.error = ''
      this.translations = []
      this.localeKey = ''

      if (!this.queryContent.trim()) {
        return
      }

      this.search()
    }, 300),

    updateSelectedTranslation(key: string) {
      this.selectedTranslation = {
        source: this.langFiles['en-us'][key],
        key: key,
        category: this.getCategoryFromKey(key),
        translations: this.languages
          .filter((lang) => lang.code !== 'en-us')
          .map((lang) => ({
            code: lang.code,
            name: lang.displayName,
            text: this.langFiles[lang.code][key],
          })),
      }
    },
  },
})

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
) {
  let timer: number | null = null
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
</script>

<style scoped>
.translation-query {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

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
  right: -30px;
  top: 1rem;
  width: 30px;
  height: 40px;
  background: #7aa2ea;
  color: white;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  z-index: 100;
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

.sidebar-collapsed .main-content {
  margin-left: 40px;
}

.settings {
  height: auto;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  padding: 1.5rem;
  box-sizing: border-box;
  width: 100%;
}

@media (max-width: 1024px) {
  .sidebar {
    position: relative;
    width: 100% !important;
    height: auto;
    min-height: auto;
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
    min-height: auto;
  }

  .sidebar-collapsed .main-content {
    margin-left: 0;
  }

  .toggle-button {
    display: none;
  }
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
}

.input-group input,
.input-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
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

.submit-button {
  display: none;
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
  font-family: 'Fira Code', monospace;
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

@media (max-width: 768px) {
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
}

/* Dark mode styles */
:deep(body.dark-mode) .settings,
:deep(body.dark-mode) .result-card {
  background: #333;
}

:deep(body.dark-mode) .input-group input,
:deep(body.dark-mode) .input-group select {
  background: #424242;
  border-color: #555;
  color: #e0e0e0;
}

:deep(body.dark-mode) .translation-item {
  border-bottom-color: #444;
}

/* Base table styles */
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

/* Table styles by category */
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

/* Table content styles */
.title {
  font-family: 'Noto Serif', 'Times New Roman', SimSun, Times, serif;
  font-size: 2.5em;
  font-weight: 600;
  text-align: center;
}

.subtitle {
  font-family: 'Fira Code', 'Source Code Pro', Consolas, Monaco, monospace;
  font-size: 1.25em;
  text-align: center;
}

.table-header {
  font-family:
    'Noto Serif SC', 'Source Han Serif SC', 'Source Han Serif CN', '思源宋体',
    'Times New Roman', SimSun, Times, serif;
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

.zh-cn {
  font-family:
    'Noto Serif SC', 'Source Han Serif SC', 'Source Han Serif CN', '思源宋体',
    'Times New Roman', SimSun, Times, serif;
}

.zh-hk {
  font-family:
    'Noto Serif HK', 'Source Han Serif HC', 'Source Han Serif HK',
    '思源宋體 香港', 'Times New Roman', SimSun, Times, serif;
}

.zh-tw {
  font-family:
    'Noto Serif TC', 'Source Han Serif TC', 'Source Han Serif TW', '思源宋體',
    'Times New Roman', SimSun, Times, serif;
}

.lzh {
  font-family:
    'I.Ming', 'Noto Serif TC Light', 'Source Han Serif TC Light',
    'Source Han Serif TW Light', '思源宋體 Light', 'Times New Roman', SimSun,
    Times, serif;
}

.ja {
  font-family:
    'Noto Serif JP', 'Source Han Serif', 'Source Han Serif JP',
    'Times New Roman', SimSun, Times, serif;
}

.ko {
  font-family:
    'Noto Serif KR', 'Source Han Serif K', 'Source Han Serif KR',
    'Times New Roman', Times, serif;
}

.vi {
  font-family: 'Noto Serif', 'Times New Roman', SimSun, Times, serif;
}

.minecraft-title {
  font-family:
    'Noto Serif', 'Source Han Serif', 'Times New Roman', SimSun, Times, serif;
  text-align: center;
  font-size: 2.25em;
  font-weight: 900;
  color: #bfbfbf;
}

:deep(body.dark-mode) table td,
:deep(body.dark-mode) table th {
  border-color: #666;
}

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
    padding: 0.25em;
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
    padding: 0.25em;
    font-size: 0.8em;
  }

  .title {
    font-size: 1.5em;
  }

  .subtitle {
    font-size: 0.7em;
  }

  .minecraft-title {
    font-size: 0.9em;
  }

  .form-container {
    gap: 0.5rem;
  }
}

@media screen and (max-height: 480px) and (orientation: landscape) {
  .sidebar {
    position: fixed;
    width: 250px !important;
    height: 100vh;
    overflow-y: auto;
    padding-top: 0.5rem;
  }

  .main-content {
    margin-left: 250px;
    height: 100vh;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .sidebar-collapsed .main-content {
    margin-left: 40px;
  }

  .result-section {
    transform: scale(0.85);
    transform-origin: center top;
  }

  .title {
    font-size: 2em;
    margin-bottom: 0.3em;
  }

  .subtitle {
    font-size: 0.9em;
    margin-bottom: 0.5em;
  }

  table td,
  table th {
    padding: 0.3em 1em;
    font-size: 1em;
  }

  .string {
    font-size: 1em;
  }

  .minecraft-title {
    font-size: 1.2em;
    margin-top: 0.5em;
  }

  .form-container {
    padding: 0.5rem;
  }

  .input-group {
    margin-bottom: 0.4rem;
  }

  .input-group label {
    font-size: 0.9em;
  }

  .input-group input,
  .input-group select {
    padding: 0.4rem;
    font-size: 0.9em;
  }

  .checkbox-group {
    margin: 0.3rem 0;
  }

  .toggle-button {
    width: 25px;
    height: 35px;
    right: -25px;
  }
}

@media (max-height: 480px) and (orientation: landscape) {
  .sidebar-layout {
    flex-direction: row;
    height: 100vh;
    overflow: hidden;
  }

  .sidebar {
    position: fixed;
    width: 280px !important;
    height: 100vh;
    padding-top: 0.5rem;
  }

  .settings {
    padding: 0.5rem;
    height: calc(100vh - 1rem);
    overflow-y: auto;
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
  .sidebar-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 1rem;
  }

  .sidebar {
    position: sticky;
    top: 0;
    width: 300px !important;
    height: 100vh;
    padding-top: 1rem;
  }

  .main-content {
    margin-left: 0;
  }

  .result-section {
    max-width: 100%;
  }

  table {
    width: auto;
    min-width: 90%;
  }

  table td,
  table th {
    padding: 0.4em 1.5em;
    font-size: 1.3em;
  }

  .title {
    font-size: 2em;
  }

  .subtitle {
    font-size: 1.1em;
  }

  .string {
    font-size: 1.3em;
    min-width: 15vw;
    max-width: 35vw;
  }

  .table-header {
    font-size: 1.5em;
  }

  .minecraft-title {
    font-size: 1.4em;
  }

  .form-container {
    gap: 0.8rem;
  }

  .input-group input,
  .input-group select {
    padding: 0.6rem;
    font-size: 1rem;
  }

  @media (orientation: landscape) {
    .sidebar-layout {
      height: 100vh;
    }

    .main-content {
      overflow-y: auto;
      height: 100vh;
    }
  }
}
</style>
