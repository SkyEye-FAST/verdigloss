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
      <span style="font-size: 75%; color: gray"> ({{ colorDataset.updatedAt }})</span>
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
          <tr v-for="color in colorDataset.colors" :key="color.key">
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
                <span>{{ color.korean.label }}</span>
                <span v-if="showKoreanMixed"> {{ color.korean.annotation }}</span>
              </template>
              <template v-else-if="lang === 'vi_vn'">
                <span>{{ color.chuNom.label }}</span>
                <span v-if="showChuNom"> {{ color.chuNom.annotation }}</span>
              </template>
              <template v-else>
                {{ color.translations[lang] || '' }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useDarkMode } from '@/composables/useDarkMode'
import { useLocale } from '@/composables/useLocale'
import { colorDataset } from '@/features/colors/color-data'

import Nav from '../PageNav.vue'
import ColorIcon from './ColorTable/ColorIcon.vue'
import ColorPreview from './ColorTable/ColorPreview.vue'
import { readBooleanPreference, writeStoredValue } from '@/utils/storage'

const { isDarkMode, toggleDarkMode } = useDarkMode()
const { locale: currentLang } = useLocale()

const showKoreanMixed = ref(true)
const showChuNom = ref(true)
const useSansFont = ref(readBooleanPreference('table:useSansFont', true))

const toggleSansFont = () => {
  useSansFont.value = !useSansFont.value
  writeStoredValue('table:useSansFont', useSansFont.value)
}

const languages: Array<keyof (typeof colorDataset.colors)[0]['translations']> = [
  'en_us',
  'zh_cn',
  'zh_hk',
  'zh_tw',
  'lzh',
  'ja_jp',
  'ko_kr',
  'vi_vn',
]


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
