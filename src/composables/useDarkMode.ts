import { ref } from 'vue'
import { usePreferredDark } from '@vueuse/core'

export const useDarkMode = () => {
  const preferredDark = usePreferredDark()
  const isDarkMode = ref(
    localStorage.getItem('darkMode') === null
      ? preferredDark.value
      : localStorage.getItem('darkMode') === 'true',
  )

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    updateDarkMode()
  }

  const updateDarkMode = () => {
    document.body.classList.toggle('dark-mode', isDarkMode.value)
    localStorage.setItem('darkMode', isDarkMode.value.toString())
  }

  updateDarkMode()

  return {
    isDarkMode,
    toggleDarkMode,
  }
}
