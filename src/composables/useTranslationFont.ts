import { ref, watch } from 'vue'

import { readBooleanPreference, writeStoredValue } from '@/utils/storage'

const useSansFont = ref(readBooleanPreference('table:useSansFont', false))
let fontChangeTimer: number | undefined

function applyFontPreference() {
  document.body.classList.add('translation-font-changing')
  document.body.classList.toggle('translation-font-sans', useSansFont.value)
  if (fontChangeTimer !== undefined) window.clearTimeout(fontChangeTimer)
  fontChangeTimer = window.setTimeout(() => {
    document.body.classList.remove('translation-font-changing')
  }, 160)
}

watch(useSansFont, applyFontPreference, { immediate: true })

export function useTranslationFont() {
  const setUseSansFont = (value: boolean) => {
    useSansFont.value = value
    writeStoredValue('table:useSansFont', value)
  }

  return {
    useSansFont,
    setUseSansFont,
    toggleTranslationFont: () => setUseSansFont(!useSansFont.value),
  }
}
