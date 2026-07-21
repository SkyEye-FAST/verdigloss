<template>
  <div ref="root" class="relative z-20 min-w-0 w-full max-w-full">
    <button
      ref="trigger"
      class="interactive-control flex min-h-[var(--control-height)] w-full items-center justify-between gap-2 overflow-hidden rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 py-2 text-left text-content shadow-app-sm"
      type="button"
      :aria-expanded="isOpen"
      :aria-controls="popupId"
      :aria-label="`${resolvedLabel}: ${selectedSummary}`"
      @click="toggleDropdown"
      @keydown.escape="closeDropdown"
    >
      <span class="flex min-w-0 flex-1 flex-wrap gap-1">
        <template v-if="selectedOptions.length">
          <span
            v-for="option in selectedOptions"
            :key="option.value"
            class="rounded bg-accent-soft px-1.5 py-0.5 text-[0.8rem] leading-none text-accent-strong"
          >
            {{ summaryMode === 'codes' ? option.value : option.label }}
          </span>
        </template>
        <span v-else class="truncate text-muted">{{ resolvedPlaceholder }}</span>
      </span>
      <i-material-symbols-expand-more
        class="shrink-0 transition-transform duration-[var(--motion-fast)] ease-[var(--ease-standard)]"
        aria-hidden="true"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>
    <Transition name="motion-popover">
      <div
        v-if="isOpen"
        :id="popupId"
        class="absolute z-[100] top-[calc(100%+0.35rem)] right-0 left-0 overflow-hidden rounded-[var(--radius-md)] border border-border-strong bg-surface-raised shadow-app-md max-[800px]:fixed max-[800px]:z-[110] max-[800px]:inset-[auto_var(--space-4)_calc(70px+var(--safe-bottom))] max-[800px]:w-auto max-[800px]:max-w-none"
        role="group"
        :aria-label="resolvedLabel"
        @keydown.esc.stop.prevent="closeAndRestoreFocus"
      >
        <div class="flex justify-between border-b border-border p-2">
          <button
            class="interactive-control min-h-9 rounded-[var(--radius-sm)] bg-accent px-3 font-bold text-on-accent shadow-app-sm hover:bg-accent-strong"
            type="button"
            @click="selectAll"
          >
            {{ $t('language_selector.select_all') }}
          </button>
          <button
            class="interactive-control min-h-9 rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 font-bold text-content-secondary hover:bg-surface-subtle"
            type="button"
            @click="clearAll"
          >
            {{ $t('language_selector.clear') }}
          </button>
        </div>
        <div
          class="max-h-[min(45dvh,320px)] overflow-auto overscroll-contain max-[800px]:max-h-[min(48dvh,360px)]"
        >
          <label
            v-for="option in options"
            :key="option.value"
            class="grid min-h-11 grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-[0.65rem] border-b border-border px-3 py-[0.45rem] hover:bg-surface-subtle"
          >
            <input
              type="checkbox"
              :value="option.value"
              :checked="modelValue.includes(option.value)"
              class="size-[1.125rem] accent-accent"
              @change="toggleOption(option.value)"
            />
            <span
              class="min-w-0 truncate"
              :lang="option.htmlLang"
              :class="[option.value.replace(/_/, '-'), 'sans']"
              >{{ option.label }}</span
            >
            <code class="font-mono text-[0.75rem] text-muted">{{ option.value }}</code>
          </label>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDismissiblePopover } from '@/composables/useDismissiblePopover'

interface Option {
  value: string
  label: string
  htmlLang: string
}
const props = defineProps<{
  modelValue: string[]
  options: Option[]
  placeholder?: string
  label?: string
  summaryMode?: 'codes' | 'labels'
}>()
const { t } = useI18n()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'change', value: string[]): void
}>()
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const isOpen = ref(false)
const popupId = `language-selector-${Math.random().toString(36).slice(2)}`
const resolvedLabel = computed(() => props.label ?? t('language_selector.selected'))
const resolvedPlaceholder = computed(() => props.placeholder ?? t('language_selector.choose'))
const selectedOptions = computed(() =>
  props.options.filter((option) => props.modelValue.includes(option.value)),
)
const selectedSummary = computed(() => {
  const summary = selectedOptions.value.map((option) =>
    props.summaryMode === 'codes' ? option.value : option.label,
  )
  return summary.length ? summary.join(', ') : resolvedPlaceholder.value
})
function toggleDropdown() {
  isOpen.value = !isOpen.value
}
function closeDropdown() {
  isOpen.value = false
}
async function closeAndRestoreFocus() {
  closeDropdown()
  await nextTick()
  trigger.value?.focus()
}
function update(value: string[]) {
  emit('update:modelValue', value)
  emit('change', value)
}
function toggleOption(value: string) {
  update(
    props.modelValue.includes(value)
      ? props.modelValue.filter((item) => item !== value)
      : [...props.modelValue, value],
  )
}
function selectAll() {
  update(props.options.map((option) => option.value))
}
function clearAll() {
  update([])
}
useDismissiblePopover(root, isOpen, closeAndRestoreFocus)
</script>
