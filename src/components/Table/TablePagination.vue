<template>
  <nav class="pagination-controls" aria-label="Table pagination">
    <p v-if="showInfo" class="pagination-info" aria-live="polite">{{ $t('table.pagination.total_rows') }}{{ totalItems }}</p>
    <div class="pagination-buttons">
      <button class="page-button" type="button" :disabled="currentPage <= 1 || !totalItems" aria-label="Previous page" @click="emit('update:currentPage', currentPage - 1)">
        <i-material-symbols-arrow-back aria-hidden="true" /><span>Previous</span>
      </button>
      <div class="page-numbers">
        <template v-for="(page, index) in displayedPages" :key="`${page}-${index}`">
          <span v-if="page === 'ellipsis'" class="ellipsis" aria-hidden="true">…</span>
          <button v-else class="page-number" :class="{ active: currentPage === page }" type="button" :aria-current="currentPage === page ? 'page' : undefined" :aria-label="`Page ${page}`" @click="emit('update:currentPage', page)">{{ page }}</button>
        </template>
      </div>
      <label class="page-jump"><span class="sr-only">Jump to page</span><input v-model="jumpPage" type="number" min="1" :max="totalPages || 1" inputmode="numeric" placeholder="#" aria-label="Jump to page" @change="jump" /></label>
      <button class="page-button" type="button" :disabled="currentPage >= totalPages || !totalItems" aria-label="Next page" @click="emit('update:currentPage', currentPage + 1)"><span>Next</span><i-material-symbols-arrow-forward aria-hidden="true" /></button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
const props = defineProps<{ currentPage: number; totalItems: number; itemsPerPage: number; showInfo?: boolean }>()
const emit = defineEmits<{ 'update:currentPage': [page: number] }>()
const jumpPage = ref('')
const totalPages = computed(() => props.totalItems ? Math.ceil(props.totalItems / props.itemsPerPage) : 0)
const displayedPages = computed<Array<number | 'ellipsis'>>(() => {
  if (totalPages.value <= 1) return totalPages.value ? [1] : []
  const pages = new Set([1, totalPages.value, props.currentPage - 1, props.currentPage, props.currentPage + 1])
  const ordered = [...pages].filter((page) => page > 0 && page <= totalPages.value).sort((a, b) => a - b)
  return ordered.flatMap((page, index) => index && page - ordered[index - 1]! > 1 ? ['ellipsis', page] : [page])
})
function jump() { const page = Number(jumpPage.value); if (Number.isInteger(page) && page >= 1 && page <= totalPages.value) emit('update:currentPage', page); jumpPage.value = '' }
</script>

<style scoped>
.pagination-controls { display: grid; gap: .65rem; justify-items: center; width: min(100%, var(--content-max)); margin: var(--space-6) auto; }
.pagination-info { margin: 0; color: var(--muted); font-size: .9rem; }
.pagination-buttons, .page-numbers { display: flex; align-items: center; gap: .35rem; }
.page-button, .page-number, .page-jump input { min-height: var(--control-height); border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--text); }
.page-button { display: inline-flex; align-items: center; gap: .35rem; padding: 0 .7rem; }
.page-number { min-width: var(--control-height); padding: 0 .4rem; }
.page-number.active { border-color: var(--accent); background: var(--accent); color: #fff; }
.page-jump input { width: 3.25rem; padding: .25rem .45rem; text-align: center; }
.ellipsis { min-width: 1.5rem; color: var(--muted); text-align: center; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
@media (max-width: 560px) { .pagination-buttons { gap: .2rem; } .page-button span, .page-numbers .page-number:not(.active):not(:first-child):not(:last-child), .ellipsis { display: none; } .page-button { min-width: var(--control-height); padding: 0 .5rem; } }
</style>
