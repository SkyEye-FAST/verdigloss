<template>
  <Nav
    :is-dark-mode="isDarkMode"
    :use-sans-font="useSansFont"
    @toggle-dark-mode="toggleDarkMode"
    @toggle-sans-font="toggleSansFont"
  />
  <div class="page-content">
    <h1 class="page-title" :class="currentLang.toLowerCase()">
      {{ $t('table.colors.title') }}
      <span style="font-size: 75%; color: gray"> (2025/7/23)</span>
    </h1>
    <div style="text-align: center; margin-bottom: 1rem">
      <label style="margin-right: 1.5em">
        <input type="checkbox" v-model="showKoreanMixed" />
        {{ $t('table.colors.show_korean_mixed') }}
      </label>
      <label>
        <input type="checkbox" v-model="showChuNom" />
        {{ $t('table.colors.show_chu_nom') }}
      </label>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Color / ID</th>
            <th v-for="lang in languages" :key="lang">{{ lang }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="color in colorData" :key="color.key">
            <td class="key-column">
              <div class="key-cell-content">
                <ColorIcon :src="color.icon" />
                <ColorIcon :src="color.iconNew" />
                <ColorPreview :color="color.hex" />
                <ColorPreview :color="color.textHex" />
                {{ color.key }}
              </div>
            </td>
            <td
              v-for="lang in languages"
              :key="lang"
              :class="[lang.replace(/_/, '-'), { sans: useSansFont }]"
            >
              <template v-if="lang === 'ko_kr'">
                <span>{{ color.translations.ko_kr.split(' ')[0] }}</span>
                <span v-if="showKoreanMixed">
                  {{
                    (() => {
                      const match = color.translations.ko_kr.match(/\(([^)]+)\)/)
                      return match ? ' ' + match[0] : ''
                    })()
                  }}
                </span>
              </template>
              <template v-else-if="lang === 'vi_vn'">
                <span>{{ color.translations.vi_vn.split('(')[0].trim() }}</span>
                <span v-if="showChuNom">
                  {{
                    (() => {
                      const match = color.translations.vi_vn.match(/\(([^)]+)\)/)
                      return match ? ' (' + match[1] + ')' : ''
                    })()
                  }}
                </span>
              </template>
              <template v-else>
                {{ color.translations[lang] }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useDarkMode } from '@/composables/useDarkMode'
import { currentLocale } from '@/main'

import Nav from '../PageNav.vue'
import ColorIcon from './ColorTable/ColorIcon.vue'
import ColorPreview from './ColorTable/ColorPreview.vue'
import colorTranslations from './ColorTable/colorTranslations'
import dyeIcons from './ColorTable/dyeIcons'
import dyeIconsNew from './ColorTable/dyeIconsNew'

const { isDarkMode, toggleDarkMode } = useDarkMode()
const currentLang = computed(() => currentLocale.value)

const showKoreanMixed = ref(true)
const showChuNom = ref(true)
const useSansFont = ref(localStorage.getItem('table:useSansFont') !== 'false')

const toggleSansFont = () => {
  useSansFont.value = !useSansFont.value
  localStorage.setItem('table:useSansFont', useSansFont.value.toString())
}

const languages: Array<keyof (typeof colorData)[0]['translations']> = [
  'en_us',
  'zh_cn',
  'zh_hk',
  'zh_tw',
  'lzh',
  'ja_jp',
  'ko_kr',
  'vi_vn',
]

const colorList = [
  'black',
  'blue',
  'brown',
  'cyan',
  'gray',
  'green',
  'light_blue',
  'light_gray',
  'lime',
  'magenta',
  'orange',
  'pink',
  'purple',
  'red',
  'white',
  'yellow',
] as const

type ColorKey = (typeof colorList)[number]

const colorData = colorList.map((key) => ({
  key,
  hex: getHex(key),
  textHex: getTextHex(key),
  icon: dyeIcons[key],
  iconNew: dyeIconsNew[key],
  translations: colorTranslations[key],
}))

function getHex(key: ColorKey): string {
  switch (key) {
    case 'black':
      return '#1D1D21'
    case 'blue':
      return '#3C44AA'
    case 'brown':
      return '#835432'
    case 'cyan':
      return '#169C9C'
    case 'gray':
      return '#474F52'
    case 'green':
      return '#5E7C16'
    case 'light_blue':
      return '#3AB3DA'
    case 'light_gray':
      return '#9D9D97'
    case 'lime':
      return '#80C71F'
    case 'magenta':
      return '#C74EBD'
    case 'orange':
      return '#F9801D'
    case 'pink':
      return '#F38BAA'
    case 'purple':
      return '#8932B8'
    case 'red':
      return '#B02E26'
    case 'white':
      return '#F9FFFE'
    case 'yellow':
      return '#FED83D'
    default:
      return '#000000'
  }
}

function getTextHex(key: ColorKey): string {
  switch (key) {
    case 'black':
      return '#000000'
    case 'blue':
      return '#0000FF'
    case 'brown':
      return '#8B4513'
    case 'cyan':
      return '#00FFFF'
    case 'gray':
      return '#808080'
    case 'green':
      return '#00FF00'
    case 'light_blue':
      return '#9AC0CD'
    case 'light_gray':
      return '#D3D3D3'
    case 'lime':
      return '#BFFF00'
    case 'magenta':
      return '#FF00FF'
    case 'orange':
      return '#FF681F'
    case 'pink':
      return '#FF69B4'
    case 'purple':
      return '#A020F0'
    case 'red':
      return '#FF0000'
    case 'white':
      return '#FFFFFF'
    case 'yellow':
      return '#FFFF00'
    default:
      return '#000000'
  }
}

onMounted(() => {
  document.body.classList.toggle('dark-mode', isDarkMode.value)
})
</script>

<style scoped>
.page-content {
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.page-title {
  font-weight: 900;
  text-align: center;
  font-size: 2.5rem;
  margin-top: 20px;
  margin-bottom: 1rem;
  color: #333;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: max-content;
  min-width: 80%;
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
  min-width: 80px;
  max-width: 200px;
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
}

.key-column {
  min-width: 100px;
  max-width: 300px;
  font-family: var(--monospace-font), monospace;
  background: inherit;
}

.key-cell-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 2px;
  flex-shrink: 0;
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

/* Dark mode */
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

body.dark-mode .page-title {
  color: #e0e0e0;
}

/* Responsive styles */
@media (max-width: 768px) {
  .table-wrapper {
    margin: 0 -10px;
    padding: 0 10px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  table {
    font-size: 13px;
  }

  table td,
  table th {
    padding: 4px 6px;
    min-width: 50px;
    font-size: 12px;
  }

  .key-column {
    min-width: 100px;
  }

  .color-preview {
    width: 14px;
    height: 14px;
  }
}
</style>
