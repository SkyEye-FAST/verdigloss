import { computed, ref, shallowRef, watch } from 'vue'
import type { LanguageCode } from '@/data/languages'
import {
  loadLanguages,
  type LanguageFile,
  type LanguageDataSource,
} from '@/services/translation-data'
import { readBooleanPreference, writeStoredValue } from '@/utils/storage'

const preferenceKey = 'verdigloss:useFullLanguageFiles:v1'
const useFullLanguageFiles = ref(readBooleanPreference(preferenceKey, false))
watch(useFullLanguageFiles, (value) => writeStoredValue(preferenceKey, value), { flush: 'sync' })

export function useTranslationData() {
  const files = shallowRef<Partial<Record<LanguageCode, LanguageFile>>>({})
  const source = computed<LanguageDataSource>(() => (useFullLanguageFiles.value ? 'full' : 'valid'))
  let generation = 0

  watch(
    source,
    () => {
      generation++
      files.value = {}
    },
    { flush: 'sync' },
  )

  async function ensureLanguages(codes: readonly LanguageCode[]) {
    const missing = codes.filter((code) => !files.value[code])
    if (!missing.length) return
    const revision = generation
    const loaded = await loadLanguages(missing, source.value)
    if (revision !== generation) return
    files.value = { ...files.value, ...loaded }
  }

  return { files, useFullLanguageFiles, ensureLanguages }
}
