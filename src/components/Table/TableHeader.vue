<template>
  <header
    class="mx-auto mt-[var(--space-6)] mb-[var(--space-4)] w-[min(100%-2rem,var(--content-max))] border-b border-border max-[640px]:mt-[var(--space-4)] max-[640px]:w-[min(100%-1rem,var(--content-max))]"
  >
    <div
      class="flex items-baseline justify-between gap-[var(--space-4)] pb-[var(--space-4)] max-[640px]:block"
    >
      <h1
        class="m-0 font-app-serif text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.1] font-bold tracking-[-0.025em]"
      >
        {{ $t('table.title') }}
      </h1>
      <p class="m-0 text-[0.9rem] text-muted max-[640px]:mt-[0.35rem]">
        {{
          $t('table.version_credit', {
            version: minecraftVersion,
            author: $t('table.author'),
          })
        }}
      </p>
    </div>
    <div
      class="grid items-center gap-[var(--space-3)] pb-[var(--space-4)] [grid-template-columns:minmax(220px,1.4fr)_minmax(220px,1fr)_auto_auto] max-[1023px]:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)] max-[640px]:grid-cols-1"
      :aria-label="$t('table.controls_label')"
    >
      <label
        class="flex min-h-[var(--control-height)] items-center rounded-[var(--radius-sm)] border border-border-strong bg-surface shadow-app-sm"
        ><span class="sr-only">{{ $t('table.search_placeholder') }}</span
        ><i-material-symbols-search class="ml-[0.7rem] text-muted" aria-hidden="true" /><input
          class="h-[42px] min-w-0 w-full border-0 bg-transparent px-[0.7rem] outline-0"
          :value="searchQuery"
          type="search"
          :placeholder="$t('table.search_placeholder')"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      /></label>
      <LanguageSelector
        v-model="selectedLanguages"
        :label="$t('table.displayed_languages')"
        :placeholder="$t('language_selector.choose')"
        :options="languageOptions"
        summary-mode="codes"
      />
      <label
        class="inline-flex min-h-[var(--control-height)] items-center gap-2 whitespace-nowrap text-[0.9rem] text-content-secondary"
        ><input
          class="size-[1.1rem] accent-accent"
          v-model="usePagination"
          type="checkbox"
        /><span>{{ $t('table.use_pagination') }}</span></label
      >
      <details ref="exportMenu" class="relative" @keydown.escape.stop.prevent="closeExportMenu">
        <summary
          class="interactive-control flex min-h-[var(--control-height)] list-none items-center gap-[0.35rem] rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 font-bold shadow-app-sm [&::-webkit-details-marker]:hidden"
        >
          <i-material-symbols-download aria-hidden="true" /> {{ $t('table.export.label') }}
        </summary>
        <div
          class="absolute z-30 right-0 mt-[0.35rem] min-w-[230px] rounded-[var(--radius-md)] border border-border-strong bg-surface-raised p-3 shadow-app-md max-[640px]:right-auto max-[640px]:left-0"
        >
          <label
            class="inline-flex min-h-[var(--control-height)] items-center gap-2 whitespace-nowrap text-[0.9rem] text-content-secondary"
            ><input
              class="size-[1.1rem] accent-accent"
              v-model="downloadAllData"
              type="checkbox"
            /><span>{{
              downloadAllData ? $t('table.export.all_rows') : $t('table.export.current_page')
            }}</span></label
          >
          <div class="mt-2 grid grid-cols-3 gap-[0.35rem]">
            <button
              v-for="type in formats"
              :key="type"
              class="interactive-control min-h-9 rounded-[var(--radius-sm)] border border-border bg-surface font-mono text-[0.75rem] hover:border-accent hover:bg-accent-soft"
              type="button"
              @click="emitDownload(type)"
            >
              {{ type.toUpperCase() }}
            </button>
          </div>
        </div>
      </details>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { LanguageMetadata } from '@/data/languages'
import { readBooleanPreference, writeStoredValue } from '@/utils/storage'
import LanguageSelector from '../Query/LanguageSelector.vue'

const props = defineProps<{
  searchQuery: string
  minecraftVersion: string
  languages: readonly LanguageMetadata[]
}>()
const emit = defineEmits<{
  'update:searchQuery': [string]
  download: [{ type: 'tsv' | 'csv' | 'json' | 'xml' | 'xlsx'; all: boolean }]
}>()
const selectedLanguages = defineModel<string[]>('selectedLanguages', {
  default: () => ['en_us', 'zh_cn', 'zh_hk', 'zh_tw', 'lzh'],
})
const usePagination = defineModel('usePagination', { default: true })
const downloadAllData = defineModel('downloadAllData', {
  default: readBooleanPreference('table:downloadAllData', true),
})
const formats = ['tsv', 'csv', 'json', 'xml', 'xlsx'] as const
const exportMenu = ref<HTMLDetailsElement | null>(null)
const languageOptions = computed(() =>
  props.languages.map((language) => ({
    value: language.code,
    label: language.gameName,
    htmlLang: language.htmlLang,
  })),
)

function closeExportMenu() {
  exportMenu.value?.removeAttribute('open')
}

function handlePointerDown(event: PointerEvent) {
  if (exportMenu.value?.open && !exportMenu.value.contains(event.target as Node)) closeExportMenu()
}

function emitDownload(type: (typeof formats)[number]) {
  closeExportMenu()
  emit('download', { type, all: downloadAllData.value })
}

onMounted(() => document.addEventListener('pointerdown', handlePointerDown))
onUnmounted(() => document.removeEventListener('pointerdown', handlePointerDown))
watch(downloadAllData, (value) => writeStoredValue('table:downloadAllData', value))
</script>
