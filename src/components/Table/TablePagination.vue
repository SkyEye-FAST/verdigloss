<template>
  <nav
    class="grid w-full justify-items-center gap-[0.65rem] mx-auto my-[var(--space-5)] [width:min(100%,var(--content-max))] max-[560px]:[&.pagination-controls--top]:my-[var(--space-3)] max-[560px]:[&.pagination-controls--top_.pagination-buttons]:hidden max-[560px]:[&.pagination-controls--bottom]:sticky max-[560px]:[&.pagination-controls--bottom]:z-20 max-[560px]:[&.pagination-controls--bottom]:bottom-[calc(70px+var(--safe-bottom)+var(--space-2))] max-[560px]:[&.pagination-controls--bottom]:w-fit max-[560px]:[&.pagination-controls--bottom]:max-w-[calc(100%-1rem)] max-[560px]:[&.pagination-controls--bottom]:mb-[var(--space-3)] max-[560px]:[&.pagination-controls--bottom]:overflow-x-auto max-[560px]:[&.pagination-controls--bottom]:rounded-[var(--radius-md)] max-[560px]:[&.pagination-controls--bottom]:border max-[560px]:[&.pagination-controls--bottom]:border-border max-[560px]:[&.pagination-controls--bottom]:bg-surface-raised max-[560px]:[&.pagination-controls--bottom]:p-[0.35rem] max-[560px]:[&.pagination-controls--bottom]:shadow-app-sm"
    :class="`pagination-controls--${position}`"
    :aria-label="$t('table.pagination.label')"
  >
    <p v-if="showInfo" class="m-0 text-[0.9rem] text-muted" aria-live="polite">
      {{ $t('table.pagination.total_rows') }}{{ totalItems }}
    </p>
    <div class="pagination-buttons flex items-center gap-[0.35rem] max-[560px]:gap-[0.2rem]">
      <button
        class="interactive-control inline-flex min-h-[var(--control-height)] items-center gap-[0.35rem] rounded-[var(--radius-sm)] border border-border bg-surface px-[0.7rem] text-content max-[560px]:min-h-[2.4rem] max-[560px]:min-w-[2.4rem] max-[560px]:px-[0.45rem] max-[560px]:[&>span]:hidden"
        type="button"
        :disabled="currentPage <= 1 || !totalItems"
        :aria-label="$t('table.pagination.previous')"
        @click="emit('update:currentPage', currentPage - 1)"
      >
        <i-material-symbols-arrow-back aria-hidden="true" /><span>{{
          $t('table.pagination.previous_short')
        }}</span>
      </button>
      <div class="flex items-center gap-[0.35rem]">
        <template v-for="(page, index) in displayedPages" :key="`${page}-${index}`">
          <span v-if="page === 'ellipsis'" class="min-w-6 text-center text-muted" aria-hidden="true"
            >…</span
          >
          <button
            v-else
            class="interactive-control min-h-[var(--control-height)] min-w-[var(--control-height)] rounded-[var(--radius-sm)] border border-border bg-surface px-[0.4rem] text-content aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-on-accent max-[560px]:min-h-[2.25rem] max-[560px]:min-w-[2.25rem]"
            type="button"
            :aria-current="currentPage === page ? 'page' : undefined"
            :aria-label="$t('table.pagination.page', { page })"
            @click="emit('update:currentPage', page)"
          >
            {{ page }}
          </button>
        </template>
      </div>
      <label class="max-[560px]:hidden"
        ><span class="sr-only">{{ $t('table.pagination.jump') }}</span
        ><input
          v-model="jumpPage"
          class="min-h-[var(--control-height)] w-[3.25rem] rounded-[var(--radius-sm)] border border-border bg-surface px-[0.45rem] py-[0.25rem] text-center text-content"
          type="number"
          min="1"
          :max="totalPages || 1"
          inputmode="numeric"
          placeholder="#"
          :aria-label="$t('table.pagination.jump')"
          @change="jump"
      /></label>
      <button
        class="interactive-control inline-flex min-h-[var(--control-height)] items-center gap-[0.35rem] rounded-[var(--radius-sm)] border border-border bg-surface px-[0.7rem] text-content max-[560px]:min-h-[2.4rem] max-[560px]:min-w-[2.4rem] max-[560px]:px-[0.45rem] max-[560px]:[&>span]:hidden"
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
