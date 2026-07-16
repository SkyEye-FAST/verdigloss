import { ref } from 'vue'
import { usePreferredDark } from '@vueuse/core'
import { readBooleanPreference, writeStoredValue } from '@/utils/storage'

export const useDarkMode = () => {
  const preferredDark = usePreferredDark()
  const isDarkMode = ref(readBooleanPreference('darkMode', preferredDark.value))

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    updateDarkMode()
  }

  const updateDarkMode = () => {
    document.body.classList.toggle('dark-mode', isDarkMode.value)
    writeStoredValue('darkMode', isDarkMode.value)
  }

  updateDarkMode()

  return {
    isDarkMode,
    toggleDarkMode,
  }
}
