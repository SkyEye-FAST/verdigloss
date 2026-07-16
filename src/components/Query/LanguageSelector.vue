<template>
  <div ref="root" class="language-selector">
    <button
      ref="trigger"
      class="language-selector__trigger"
      type="button"
      :aria-expanded="isOpen"
      :aria-controls="popupId"
      :aria-label="`${resolvedLabel}: ${selectedSummary}`"
      @click="toggleDropdown"
      @keydown.escape="closeDropdown"
    >
      <span class="language-selector__summary">{{ selectedSummary }}</span>
      <i-material-symbols-expand-more aria-hidden="true" :class="{ 'is-rotated': isOpen }" />
    </button>
    <div
      v-if="isOpen"
      :id="popupId"
      class="language-selector__popover"
      role="group"
      :aria-label="resolvedLabel"
      @keydown.esc.stop.prevent="closeAndRestoreFocus"
    >
      <div class="language-selector__actions">
        <button type="button" @click="selectAll">{{ $t('language_selector.select_all') }}</button>
        <button type="button" @click="clearAll">{{ $t('language_selector.clear') }}</button>
      </div>
      <div class="language-selector__options">
        <label v-for="option in options" :key="option.value" class="language-selector__option">
          <input
            type="checkbox"
            :value="option.value"
            :checked="modelValue.includes(option.value)"
            @change="toggleOption(option.value)"
          />
          <span :lang="option.htmlLang" :class="[option.value.replace(/_/, '-'), 'sans']">{{
            option.label
          }}</span>
          <code>{{ option.value }}</code>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
const selectedSummary = computed(() => {
  const labels = props.options
    .filter((option) => props.modelValue.includes(option.value))
    .map((option) => option.label)
  return labels.length ? labels.join(', ') : resolvedPlaceholder.value
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
function handlePointerDown(event: PointerEvent) {
  if (isOpen.value && root.value && !root.value.contains(event.target as Node))
    void closeAndRestoreFocus()
}
onMounted(() => document.addEventListener('pointerdown', handlePointerDown))
onUnmounted(() => document.removeEventListener('pointerdown', handlePointerDown))
</script>

<style scoped>
.language-selector {
  position: relative;
  width: 100%;
  min-width: 0;
  max-width: 100%;
}
.language-selector__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  min-height: var(--control-height);
  padding: 0.5rem 0.75rem;
  overflow: hidden;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  text-align: left;
}
.language-selector__summary {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.language-selector__trigger svg {
  flex: none;
  transition: transform var(--motion-fast);
}
.is-rotated {
  transform: rotate(180deg);
}
.language-selector__popover {
  position: absolute;
  z-index: 80;
  top: calc(100% + 0.35rem);
  right: 0;
  left: 0;
  overflow: hidden;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  box-shadow: var(--shadow-md);
}
.language-selector__actions {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid var(--border);
}
.language-selector__actions button {
  min-height: 36px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--accent-strong);
  font-weight: 700;
}
.language-selector__actions button:hover {
  background: var(--accent-soft);
}
.language-selector__options {
  max-height: min(45dvh, 320px);
  overflow: auto;
  overscroll-behavior: contain;
}
.language-selector__option {
  display: grid;
  grid-template-columns: 1.25rem minmax(0, 1fr) auto;
  gap: 0.65rem;
  align-items: center;
  min-height: 44px;
  padding: 0.45rem 0.75rem;
  border-bottom: 1px solid var(--border);
}
.language-selector__option > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.language-selector__option:hover {
  background: var(--surface-subtle);
}
.language-selector__option input {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  accent-color: var(--accent);
}
.language-selector__option code {
  color: var(--muted);
  font: 0.75rem var(--monospace-font);
}
@media (max-width: 800px) {
  .language-selector__popover {
    position: fixed;
    z-index: 100;
    inset: auto var(--space-4) calc(70px + var(--safe-bottom)) var(--space-4);
    width: auto;
    min-width: 0;
    max-width: none;
  }
  .language-selector__options {
    max-height: min(48dvh, 360px);
  }
}
</style>
