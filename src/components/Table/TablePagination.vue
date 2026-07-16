<template>
  <nav
    class="pagination-controls"
    :class="`pagination-controls--${position}`"
    :aria-label="$t('table.pagination.label')"
  >
    <p v-if="showInfo" class="pagination-info" aria-live="polite">
      {{ $t('table.pagination.total_rows') }}{{ totalItems }}
    </p>
    <div class="pagination-buttons">
      <button
        class="page-button interactive-control"
        type="button"
        :disabled="currentPage <= 1 || !totalItems"
        :aria-label="$t('table.pagination.previous')"
        @click="emit('update:currentPage', currentPage - 1)"
      >
        <i-material-symbols-arrow-back aria-hidden="true" /><span>{{
          $t('table.pagination.previous_short')
        }}</span>
      </button>
      <div class="page-numbers">
        <template v-for="(page, index) in displayedPages" :key="`${page}-${index}`">
          <span v-if="page === 'ellipsis'" class="ellipsis" aria-hidden="true">…</span>
          <button
            v-else
            class="page-number interactive-control"
            :class="{ active: currentPage === page }"
            type="button"
            :aria-current="currentPage === page ? 'page' : undefined"
            :aria-label="$t('table.pagination.page', { page })"
            @click="emit('update:currentPage', page)"
          >
            {{ page }}
          </button>
        </template>
      </div>
      <label class="page-jump"
        ><span class="sr-only">{{ $t('table.pagination.jump') }}</span
        ><input
          v-model="jumpPage"
          type="number"
          min="1"
          :max="totalPages || 1"
          inputmode="numeric"
          placeholder="#"
          :aria-label="$t('table.pagination.jump')"
          @change="jump"
      /></label>
      <button
        class="page-button interactive-control"
        type="button"
        :disabled="currentPage >= totalPages || !totalItems"
        :aria-label="$t('table.pagination.next')"
        @click="emit('update:currentPage', currentPage + 1)"
      >
        <span>{{ $t('table.pagination.next_short') }}</span
        ><i-material-symbols-arrow-forward aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getPageWindow, type PageWindowEntry } from '@/features/table/pagination'
const props = defineProps<{
  currentPage: number
  totalItems: number
  itemsPerPage: number
  showInfo?: boolean
  position?: 'top' | 'bottom'
}>()
const emit = defineEmits<{ 'update:currentPage': [page: number] }>()
const jumpPage = ref('')
const totalPages = computed(() =>
  props.totalItems ? Math.ceil(props.totalItems / props.itemsPerPage) : 0,
)
const position = computed(() => props.position ?? 'bottom')
const displayedPages = computed<PageWindowEntry[]>(() =>
  getPageWindow(totalPages.value, props.currentPage),
)
function jump() {
  const page = Number(jumpPage.value)
  if (Number.isInteger(page) && page >= 1 && page <= totalPages.value)
    emit('update:currentPage', page)
  jumpPage.value = ''
}
</script>

<style scoped>
.pagination-controls {
  display: grid;
  gap: 0.65rem;
  justify-items: center;
  width: min(100%, var(--content-max));
  margin: var(--space-5) auto;
}
.pagination-info {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}
.pagination-buttons,
.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.page-button,
.page-number,
.page-jump input {
  min-height: var(--control-height);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
}
.page-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.7rem;
}
.page-number {
  min-width: var(--control-height);
  padding: 0 0.4rem;
}
.page-number.active {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}
.page-jump input {
  width: 3.25rem;
  padding: 0.25rem 0.45rem;
  text-align: center;
}
.ellipsis {
  min-width: 1.5rem;
  color: var(--muted);
  text-align: center;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
@media (max-width: 560px) {
  .pagination-controls--top .pagination-buttons {
    display: none;
  }
  .pagination-controls--top {
    margin-block: var(--space-3);
  }
  .pagination-controls--bottom {
    position: sticky;
    z-index: 20;
    bottom: calc(70px + var(--safe-bottom) + var(--space-2));
    width: fit-content;
    max-width: calc(100% - 1rem);
    margin-bottom: var(--space-3);
    padding: 0.35rem;
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    box-shadow: var(--shadow-sm);
  }
  .pagination-buttons {
    gap: 0.2rem;
  }
  .page-button span,
  .page-jump {
    display: none;
  }
  .page-button {
    min-width: 2.4rem;
    min-height: 2.4rem;
    padding: 0 0.45rem;
  }
  .page-number {
    min-width: 2.25rem;
    min-height: 2.25rem;
  }
}
</style>
