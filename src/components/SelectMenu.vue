<template>
  <div class="relative min-w-0">
    <select
      :id="id"
      class="interactive-control min-h-[var(--control-height)] w-full appearance-none rounded-[var(--radius-sm)] border border-border-strong bg-surface py-2 pr-10 pl-3 text-content shadow-app-sm"
      :value="modelValue"
      :lang="current?.htmlLang"
      :class="current?.typographyClass"
      @change="select(($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :lang="option.htmlLang"
        :class="option.typographyClass"
      >
        {{ option.label }}
      </option>
    </select>
    <i-material-symbols-expand-more
      class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-content-secondary"
      aria-hidden="true"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

type Option = { value: string; label: string; htmlLang?: string; typographyClass?: string }
const props = defineProps<{ id?: string; modelValue: string; options: readonly Option[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; change: [value: string] }>()
const current = computed(() => props.options.find((option) => option.value === props.modelValue))

function select(value: string) {
  if (!props.options.some((option) => option.value === value)) return
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
