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
    <div class="table-wrapper" role="region" tabindex="0" :aria-label="$t('table.colors.region')">
      <table>
        <caption>
          {{
            $t('table.colors.caption')
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col">{{ $t('table.colors.color_id') }}</th>
            <th v-for="lang in languages" :key="lang" scope="col">{{ lang }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="color in colorDataset.colors" :key="color.key">
            <th scope="row" class="key-column">
              <div class="key-cell-content">
                <ColorIcon :src="color.icon" />
                <ColorIcon :src="color.iconNew" />
                <ColorPreview :color="color.hex" />
                <ColorPreview :color="color.textHex" />
                {{ color.key }}
              </div>
            </th>
            <td v-for="lang in languages" :key="lang" :class="lang.replace(/_/, '-')">
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
import { ref } from 'vue'

import { useLocale } from '@/composables/useLocale'
import { colorDataset } from '@/features/colors/color-data'

import ColorIcon from './ColorTable/ColorIcon.vue'
import ColorPreview from './ColorTable/ColorPreview.vue'
import TableSectionNav from '../Table/TableSectionNav.vue'

const { locale: currentLang } = useLocale()

const showKoreanMixed = ref(true)
const showChuNom = ref(true)
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
  width: max-content;
  min-width: 58rem;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;
  font-size: 0.86rem;
}

.table-wrapper caption {
  padding: var(--space-2) var(--space-3);
  color: var(--muted);
  text-align: left;
}

.table-wrapper th,
.table-wrapper td {
  min-width: 8.5rem;
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
  position: sticky;
  z-index: 2;
  left: 0;
  min-width: 12rem;
  background: var(--surface);
}

.table-wrapper thead .key-column {
  z-index: 5;
  background: var(--surface-subtle);
}

.table-wrapper tr:nth-child(even) > * {
  background: color-mix(in srgb, var(--surface-subtle) 72%, var(--surface));
}

.table-wrapper tr:nth-child(even) > .key-column {
  background: color-mix(in srgb, var(--surface-subtle) 72%, var(--surface));
}

.table-wrapper tbody tr:hover > *,
.table-wrapper tbody tr:hover > .key-column {
  background: var(--accent-soft);
}

.key-cell-content {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font: 0.78rem var(--monospace-font);
}

@media (max-width: 800px) {
  .page-content {
    width: calc(100% - 1rem);
    padding-top: var(--space-4);
  }

  .table-wrapper {
    width: 100%;
    margin: 0;
  }

  .table-wrapper table {
    min-width: 54rem;
  }

  .table-wrapper th,
  .table-wrapper td {
    min-width: 7.5rem;
  }

  .table-wrapper .key-column {
    min-width: 11.5rem;
  }
}
</style>
