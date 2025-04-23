<template>
  <div
    class="language-selector"
    :class="{ 'is-active': isOpen }"
    @keydown.space.prevent="toggleDropdown"
    @keydown.enter.prevent="toggleDropdown"
    @keydown.esc="closeDropdown"
    tabindex="0"
    role="listbox"
    aria-multiselectable="true"
    :aria-expanded="isOpen"
  >
    <div class="selected-display" @click="toggleDropdown">
      <span v-if="modelValue.length">
        {{ selectedLanguages }}
      </span>
      <span v-else class="placeholder">{{ placeholder }}</span>
    </div>
    <div v-show="isOpen" class="options-container">
      <label
        v-for="option in options"
        :key="option.value"
        class="option"
        :class="{
          'is-selected': modelValue.includes(option.value),
        }"
      >
        <input
          type="checkbox"
          :value="option.value"
          :checked="modelValue.includes(option.value)"
          @change="toggleOption(option.value)"
        />
        <span :lang="option.htmlLang" :class="option.value.replace(/_/, '-')" class="sans">
          {{ option.label }}
        </span>
        <span class="lang-code">({{ option.value }})</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option {
  value: string
  label: string
  htmlLang: string
}

const props = defineProps<{
  modelValue: string[]
  options: Option[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const isOpen = ref(false)
const selectedLanguages = computed(() => {
  return props.options
    .filter((opt) => props.modelValue.includes(opt.value))
    .map((opt) => opt.value)
    .join(', ')
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const toggleOption = (value: string) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(value)
  if (index === -1) {
    newValue.push(value)
  } else {
    newValue.splice(index, 1)
  }
  emit('update:modelValue', newValue)
}

const handleClickOutside = (event: MouseEvent) => {
  const el = event.target as HTMLElement
  if (!el.closest('.language-selector')) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.language-selector {
  position: relative;
  width: 100%;
}

.selected-display {
  font-family: var(--monospace-font), monospace;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  background: #fff;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  line-height: 1.4;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.placeholder {
  color: #999;
}

.options-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.option {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  cursor: pointer;
  user-select: none;
  gap: 0.5rem;
  border-bottom: 1px solid #eee;
}

.lang-code {
  font-family: var(--monospace-font), monospace;
  color: #666;
  font-size: 0.9em;
}

body.dark-mode .lang-code {
  color: #999;
}

body.dark-mode .selected-display,
body.dark-mode .options-container {
  background: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}

body.dark-mode .option {
  border-bottom-color: #444;
}

body.dark-mode .option:hover {
  background-color: rgba(122, 162, 234, 0.2);
}

body.dark-mode.option.is-selected {
  background-color: rgba(122, 162, 234, 0.3);
}

@media (max-width: 768px) {
  .selected-display {
    font-size: 0.8rem;
    padding: 0.2rem 0.4rem;
  }

  .options-container {
    max-height: 320px;
  }

  .option {
    padding: 1rem;
  }

  .option input[type='checkbox'] {
    width: 1.25rem;
    height: 1.25rem;
  }
}

@media (max-height: 480px) and (orientation: landscape) {
  .options-container {
    position: fixed;
    left: 280px;
    top: 0;
    max-height: 100vh;
    width: 280px;
    margin-top: 0;
    border-radius: 0;
    border-left: 1px solid #ddd;
    border-top: none;
    border-bottom: none;
  }

  body.dark-mode .options-container {
    border-left-color: #444;
  }

  .sidebar-collapsed .options-container {
    left: 40px;
  }

  .option {
    padding: 0.75rem;
  }
}
</style>
