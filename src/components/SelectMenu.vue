<template>
  <div ref="root" class="relative min-w-0">
    <button
      ref="trigger"
      class="interactive-control flex min-h-[var(--control-height)] w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 py-2 text-left shadow-app-sm"
      type="button"
      :aria-expanded="open"
      @click="open = !open"
      @keydown.escape="close"
    >
      <span class="min-w-0 truncate" :lang="current?.htmlLang" :class="current?.typographyClass">{{
        current?.label
      }}</span
      ><i-material-symbols-expand-more
        class="shrink-0"
        :class="{ 'rotate-180': open }"
        aria-hidden="true"
      />
    </button>
    <Transition name="motion-popover"
      ><div
        v-if="open"
        class="absolute z-[100] top-[calc(100%+0.35rem)] right-0 left-0 max-h-72 overflow-auto rounded-[var(--radius-md)] border border-border-strong bg-surface-raised p-1 shadow-app-md"
        role="listbox"
      >
        <button
          v-for="option in options"
          :key="option.value"
          class="flex min-h-10 w-full items-center rounded-[var(--radius-sm)] px-3 text-left hover:bg-accent-soft aria-selected:bg-accent-soft"
          type="button"
          role="option"
          :aria-selected="option.value === modelValue"
          :lang="option.htmlLang"
          :class="option.typographyClass"
          @click="select(option.value)"
        >
          {{ option.label }}
        </button>
      </div></Transition
    >
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDismissiblePopover } from '@/composables/useDismissiblePopover'
type Option = { value: string; label: string; htmlLang?: string; typographyClass?: string }
const props = defineProps<{ modelValue: string; options: readonly Option[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; change: [value: string] }>()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const current = computed(() => props.options.find((option) => option.value === props.modelValue))
function select(value: string) {
  emit('update:modelValue', value)
  emit('change', value)
  open.value = false
}
function close() {
  open.value = false
}
useDismissiblePopover(root, open, close)
</script>
