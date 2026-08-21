<template>
  <div class="page-content">
    <h1 class="page-title" :class="currentLang.toLowerCase()">
      {{ $t('table.colors.title') }}
    </h1>
    <p class="updated-at">
      {{ $t('table.colors.updated', { date: colorDataset.updatedAt }) }}
    </p>
    <TableSectionNav />
    <fieldset class="color-variants">
      <legend>{{ $t('table.colors.variants') }}</legend>
      <label class="interactive-control">
        <input type="checkbox" v-model="showKoreanMixed" />
        {{ $t('table.colors.show_korean_mixed') }}
      </label>
      <label class="interactive-control">
        <input type="checkbox" v-model="showChuNom" />
        {{ $t('table.colors.show_chu_nom') }}
      </label>
    </fieldset>
    <div
      v-if="!isCompactLayout"
      class="table-wrapper"
      role="region"
      tabindex="0"
      :aria-label="$t('table.colors.region')"
    >
      <table :style="{ width: `${13 + colorLanguages.length * 10}rem` }">
        <caption>
          {{
            $t('table.colors.caption')
          }}
        </caption>
        <colgroup>
          <col class="key-column-track" />
          <col v-for="language in colorLanguages" :key="language.code" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" class="key-column">
              {{ $t('table.colors.color_id') }}
            </th>
            <th v-for="language in colorLanguages" :key="language.code" scope="col">
              <code aria-hidden="true">{{ language.code }}</code>
              <span class="sr-only" :lang="language.htmlLang">{{ language.gameName }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="color in colorDataset.colors" :key="color.key">
            <th scope="row" class="key-column">
              <div class="key-cell-content">
                <ColorIcon
                  :src="color.icon"
                  :alt="$t('table.colors.dye_icon_legacy', { color: color.key })"
                />
                <ColorIcon
                  :src="color.iconNew"
                  :alt="$t('table.colors.dye_icon_current', { color: color.key })"
                />
                <ColorPreview :color="color.hex" />
                <ColorPreview :color="color.textHex" />
                {{ color.key }}
              </div>
            </th>
            <td
              v-for="language in colorLanguages"
              :key="language.code"
              :class="language.typographyClass"
              :lang="language.htmlLang"
            >
              {{ translationFor(color, language.code) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ol v-else class="color-card-list" :aria-label="$t('table.colors.caption')">
      <li v-for="(color, colorIndex) in colorDataset.colors" :key="color.key">
        <article :aria-labelledby="`color-key-${colorIndex}`">
          <header class="color-card-header">
            <div class="color-card-visuals">
              <ColorIcon
                :src="color.icon"
                :alt="$t('table.colors.dye_icon_legacy', { color: color.key })"
              />
              <ColorIcon
                :src="color.iconNew"
                :alt="$t('table.colors.dye_icon_current', { color: color.key })"
              />
              <ColorPreview :color="color.hex" />
              <ColorPreview :color="color.textHex" />
            </div>
            <h2 :id="`color-key-${colorIndex}`">{{ color.key }}</h2>
          </header>
          <dl>
            <div v-for="language in colorLanguages" :key="language.code" class="color-translation">
              <dt>
                <span :class="language.typographyClass" :lang="language.htmlLang">{{
                  language.gameName
                }}</span>
                <code>{{ language.code }}</code>
              </dt>
              <dd :class="language.typographyClass" :lang="language.htmlLang">
                {{ translationFor(color, language.code) }}
              </dd>
            </div>
          </dl>
        </article>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { ref } from 'vue'

import { useLocale } from '@/composables/useLocale'
import { languageByCode } from '@/data/languages'
import { colorDataset } from '@/features/colors/color-data'

import ColorIcon from './ColorTable/ColorIcon.vue'
import ColorPreview from './ColorTable/ColorPreview.vue'
import TableSectionNav from '../Table/TableSectionNav.vue'

const { locale: currentLang } = useLocale()
const isCompactLayout = useMediaQuery('(max-width: 800px)')

const showKoreanMixed = ref(true)
const showChuNom = ref(true)
type ColorRow = (typeof colorDataset.colors)[number]
type ColorLanguageCode = keyof ColorRow['translations']
const languageCodes: ColorLanguageCode[] = [
  'en_us',
  'zh_cn',
  'zh_hk',
  'zh_tw',
  'lzh',
  'ja_jp',
  'ko_kr',
  'vi_vn',
]
const colorLanguages = languageCodes.map((code) => languageByCode[code])

function translationFor(color: ColorRow, language: ColorLanguageCode) {
  if (language === 'ko_kr') {
    return `${color.korean.label}${showKoreanMixed.value ? ` ${color.korean.annotation}` : ''}`
  }
  if (language === 'vi_vn') {
    return `${color.chuNom.label}${showChuNom.value ? ` ${color.chuNom.annotation}` : ''}`
  }
  return color.translations[language] || ''
}
</script>

<style scoped>
.page-content {
  width: min(calc(100% - 2rem), var(--content-max));
  margin: 0 auto;
  padding: var(--space-6) 0 var(--space-8);
}

.page-title {
  margin: 0;
  font: 700 clamp(1.75rem, 4vw, 2.75rem)/1.1 var(--serif-font);
  letter-spacing: -0.02em;
}

.updated-at {
  margin: var(--space-2) 0 var(--space-4);
  color: var(--muted);
}

.color-variants {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin: 0 0 var(--space-4);
  padding: var(--space-4) 0;
  border: 0;
  border-block: 1px solid var(--border);
}

.page-content :deep(.table-section-nav) {
  width: 100%;
  margin-bottom: var(--space-4);
}

.color-variants legend {
  width: 100%;
  padding: 0;
  color: var(--text-secondary);
  font-weight: 700;
}

.color-variants label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--control-height);
  padding-inline: var(--space-2);
}

.color-variants input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--accent);
}

.table-wrapper {
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  border: 1px solid var(--border);
  background: var(--surface);
}

.table-wrapper table {
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 0.86rem;
}

.table-wrapper col {
  width: 10rem;
}

.table-wrapper .key-column-track {
  width: 13rem;
}

.table-wrapper caption {
  padding: var(--space-2) var(--space-3);
  color: var(--muted);
  text-align: left;
}

.table-wrapper th,
.table-wrapper td {
  padding: 0.48rem 0.58rem;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  text-align: left;
  vertical-align: top;
  white-space: normal;
}

.table-wrapper thead th {
  position: sticky;
  z-index: 3;
  top: 0;
  background: var(--surface-subtle);
  color: var(--text-secondary);
  font: 700 0.78rem var(--monospace-font);
}

.table-wrapper .key-column {
  border-right-color: var(--border-strong);
}

.table-wrapper tr:nth-child(even) > * {
  background: color-mix(in srgb, var(--surface-subtle) 72%, var(--surface));
}

.table-wrapper tbody tr:hover > * {
  background: var(--accent-soft);
}

.key-cell-content {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font: 0.78rem var(--monospace-font);
  overflow-wrap: anywhere;
}

.table-wrapper thead code {
  color: inherit;
  font: inherit;
}

.color-card-list {
  display: grid;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.color-card-list > li {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.color-card-header {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
  border-bottom: 2px solid var(--accent);
  background: var(--surface-subtle);
}

.color-card-visuals {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.color-card-header h2 {
  margin: 0;
  color: var(--text);
  font: 700 0.8rem/1.45 var(--monospace-font);
  overflow-wrap: anywhere;
}

.color-card-list dl {
  margin: 0;
}

.color-translation + .color-translation {
  border-top: 1px solid var(--border);
}

.color-translation dt {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3) 0;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
}

.color-translation dt span {
  min-width: 0;
  color: var(--text);
  overflow-wrap: anywhere;
}

.color-translation dt code {
  flex: none;
  color: var(--muted);
  font: 0.72rem var(--monospace-font);
}

.color-translation dd {
  margin: 0;
  padding: var(--space-1) var(--space-3) var(--space-3);
  color: var(--text);
  font-size: 1.05rem;
  overflow-wrap: anywhere;
}

@media (max-width: 800px) {
  .page-content {
    width: calc(100% - 1rem);
    padding-top: var(--space-4);
  }
}
</style>
