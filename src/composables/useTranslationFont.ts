import { ref, watch } from 'vue'

import { readBooleanPreference, writeStoredValue } from '@/utils/storage'

const useSansFont = ref(readBooleanPreference('table:useSansFont', true))

function applyFontPreference() {
  document.body.classList.toggle('translation-font-sans', useSansFont.value)
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
