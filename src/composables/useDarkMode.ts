import { computed, ref, watch } from 'vue'
import { usePreferredDark } from '@vueuse/core'
import { readStoredValue, writeStoredValue } from '@/utils/storage'

export type DarkModePreference = 'system' | 'light' | 'dark'
const preferredDark = usePreferredDark()
const stored = readStoredValue({
  key: 'darkMode',
  fallback: 'system' as DarkModePreference,
  parse(raw) {
    if (raw === 'true') return 'dark'
    if (raw === 'false') return 'light'
    try {
      const value: unknown = JSON.parse(raw)
      return value === 'system' || value === 'light' || value === 'dark' ? value : undefined
    } catch { return undefined }
  },
})
const mode = ref<DarkModePreference>(stored)
const isDarkMode = computed(() => mode.value === 'dark' || (mode.value === 'system' && preferredDark.value))

function applyDarkMode() { document.body.classList.toggle('dark-mode', isDarkMode.value) }
watch([mode, preferredDark], applyDarkMode, { immediate: true })

export function useDarkMode() {
  const setMode = (value: DarkModePreference) => { mode.value = value; writeStoredValue('darkMode', value) }
  return { mode, isDarkMode, setMode, toggleDarkMode: () => setMode(isDarkMode.value ? 'light' : 'dark') }
}
