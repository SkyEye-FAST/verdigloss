<template>
  <div class="translation-query">
    <div class="nav-buttons">
      <router-link
        to="/table"
        class="nav-button"
        :title="$t('query.nav.table')"
      >
        <i-material-symbols-table-view-outline style="font-size: 1.5em" />
      </router-link>
      <a
        href="https://github.com/Teahouse-Studios/mcwzh-meme-web-builder"
        target="_blank"
        class="nav-button"
        :title="$t('query.nav.github')"
      >
        <img
          src="@/assets/images/github-icon.svg"
          alt="GitHub"
          class="github-icon"
          style="width: 1.5em; height: 1.5em"
        />
      </a>
      <button
        class="nav-button"
        @click="toggleDarkMode"
        :title="$t('query.nav.dark_mode')"
      >
        <i-material-symbols-dark-mode
          v-if="isDarkMode"
          style="font-size: 1.5em"
        />
        <i-material-symbols-light-mode v-else style="font-size: 1.5em" />
      </button>
    </div>
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
              <label for="enableOtherLang">
                {{ $t('query.enable_other_lang') }}
              </label>
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
                <th class="table-header">{{ $t('query.table.langName') }}</th>
                <th class="table-header">
                  {{ $t('query.table.translation') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr lang="zh-Hans-CN" class="zh-cn">
                <td class="lang-name">简体中文 (中国大陆)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'zh-cn',
                    )?.text
                  }}
                </td>
              </tr>
              <tr lang="zh-Hant-HK" class="zh-hk">
                <td class="lang-name">繁體中文 (香港特別行政區)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'zh-hk',
                    )?.text
                  }}
                </td>
              </tr>
              <tr lang="zh-Hant-TW" class="zh-tw">
                <td class="lang-name">繁體中文 (台灣)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'zh-tw',
                    )?.text
                  }}
                </td>
              </tr>
              <tr lang="lzh" class="lzh">
                <td class="lang-name">文言 (華夏)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'lzh',
                    )?.text
                  }}
                </td>
              </tr>
              <tr v-if="enableOtherLang" lang="ja" class="ja">
                <td class="lang-name">日本語 (日本)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'ja',
                    )?.text
                  }}
                </td>
              </tr>
              <tr v-if="enableOtherLang" lang="ko" class="ko">
                <td class="lang-name">한국어 (대한민국)</td>
                <td class="string">
                  {{
                    selectedTranslation?.translations.find(
                      (t) => t.code === 'ko',
                    )?.text
                  }}
                </td>
              </tr>
              <tr v-if="enableOtherLang" lang="vi" class="vi">
                <td class="lang-name">Tiếng Việt (Việt Nam)</td>
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
          <footer class="minecraft-title" :lang="currentLang">
            {{ $t('query.title') }}<br />
            {{ $t('query.java_edition') }}{{ minecraftVersion }}
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type ComponentPublicInstance } from 'vue'
import { currentLocale } from '@/main'
import enUS from '@#/en_us.json'
import zhCN from '@#/zh_cn.json'
import zhHK from '@#/zh_hk.json'
import zhTW from '@#/zh_tw.json'
import lzh from '@#/lzh.json'
import ja from '@#/ja_jp.json'
import ko from '@#/ko_kr.json'
import vi from '@#/vi_vn.json'

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
      minecraftVersion: '',
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
      isDarkMode: document.body.classList.contains('dark-mode'),
    }
  },

  async mounted() {
    try {
      const response = await fetch('/src/assets/mc_lang/version.txt')
      if (response.ok) {
        this.minecraftVersion = await response.text()
      } else {
        console.error('Failed to load version.txt')
        this.minecraftVersion = 'Unknown version'
      }
    } catch (error) {
      console.error('Error loading version.txt:', error)
      this.minecraftVersion = 'Error loading version'
    }

    this.search()

    // 初始化暗色模式
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode === 'true') {
      document.body.classList.add('dark-mode')
      this.isDarkMode = true
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

  computed: {
    currentLang(): string {
      return currentLocale.value
    },
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
        this.error = 'Please enter query content'
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
        this.error = 'No matching translations found'
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

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      document.body.classList.toggle('dark-mode')
      localStorage.setItem('darkMode', this.isDarkMode ? 'true' : 'false')
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

/* Nav */
.nav-buttons {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 1000;
}

.nav-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  color: #666;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  color: #7aa2ea;
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
  overflow-y: auto;
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

.minecraft-title[lang='zh-CN'],
.zh-cn {
  font-family:
    'Noto Serif SC', 'Source Han Serif SC', 'Source Han Serif CN', '思源宋体',
    'Times New Roman', SimSun, Times, serif;
}

.minecraft-title[lang='zh-HK'],
.zh-hk {
  font-family:
    'Noto Serif HK', 'Source Han Serif HC', 'Source Han Serif HK',
    '思源宋體 香港', 'Times New Roman', SimSun, Times, serif;
}

.minecraft-title[lang='zh-TW'],
.zh-tw {
  font-family:
    'Noto Serif TC', 'Source Han Serif TC', 'Source Han Serif TW', '思源宋體',
    'Times New Roman', SimSun, Times, serif;
}

.lzh {
  font-family:
    'Shanggu Serif VF', 'I.Ming', 'Noto Serif TC Light',
    'Source Han Serif TC Light', 'Source Han Serif TW Light', '思源宋體 Light',
    'Times New Roman', SimSun, Times, serif;
}

.minecraft-title[lang='ja'],
.ja {
  font-family:
    'Noto Serif JP', 'Source Han Serif', 'Source Han Serif JP',
    'Times New Roman', SimSun, Times, serif;
}

.minecraft-title[lang='ko'],
.ko {
  font-family:
    'Noto Serif KR', 'Source Han Serif K', 'Source Han Serif KR',
    'Times New Roman', Times, serif;
}

.minecraft-title,
.vi {
  font-family: 'Noto Serif', 'Times New Roman', SimSun, Times, serif;
}

/* Footer */
.minecraft-title {
  text-align: center;
  font-size: 2.25em;
  font-weight: 900;
  color: #bfbfbf;
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
  .nav-buttons {
    top: auto;
    bottom: 1rem;
    right: 1rem;
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
    font-size: 1.2em;
  }

  .form-container {
    gap: 0.5rem;
  }
}

@media screen and (max-height: 480px) and (orientation: landscape) {
  .sidebar-layout {
    flex-direction: column;
  }

  .sidebar {
    position: relative;
    width: 100% !important;
    height: auto;
    min-height: auto;
  }

  .main-content {
    margin-left: 0 !important;
    height: auto;
    min-height: calc(100vh - 250px);
  }

  .result-section {
    width: 100%;
    overflow-x: auto;
  }

  table {
    margin: 0.5em auto;
    font-size: 0.85em;
  }

  .title {
    font-size: 1.8em;
  }

  .subtitle {
    font-size: 1em;
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
    padding: 1rem;
  }

  .main-content {
    margin-left: 0;
    min-height: auto;
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

@media (max-width: 1024px) {
  .sidebar {
    position: relative;
    width: 100% !important;
    height: auto;
    min-height: auto;
  }

  .main-content {
    margin-left: 0 !important;
    padding: 1rem;
  }

  .toggle-button {
    display: none;
  }

  .settings {
    display: block !important;
    padding: 1rem;
  }

  .result-section {
    margin-top: 1rem;
    width: 100%;
    overflow-x: auto;
  }

  table {
    min-width: 100%;
    font-size: 0.9em;
  }
}
</style>
