import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'
import { useTranslationData } from '@/composables/useTranslationData'
import { loadLanguages } from '@/services/translation-data'
import type { LanguageCode } from '@/data/languages'

vi.mock('@/services/translation-data', () => ({ loadLanguages: vi.fn() }))

it('shares and saves the preference and discards loads from a previous selection', async () => {
  const scope = effectScope()
  const [query, table] = scope.run(() => [useTranslationData(), useTranslationData()])!
  query!.useFullLanguageFiles.value = false
  let resolveOld!: (files: Awaited<ReturnType<typeof loadLanguages>>) => void
  vi.mocked(loadLanguages).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve
      }),
  )
  const oldLoad = query!.ensureLanguages(['en_us'])
  query!.useFullLanguageFiles.value = true
  expect(table!.useFullLanguageFiles.value).toBe(true)
  expect(localStorage.getItem('verdigloss:useFullLanguageFiles:v1')).toBe('true')
  const full = { en_us: { 'gui.done': 'Done' } } as Record<LanguageCode, Record<string, string>>
  vi.mocked(loadLanguages).mockResolvedValueOnce(full)
  await query!.ensureLanguages(['en_us'])
  expect(loadLanguages).toHaveBeenLastCalledWith(['en_us'], 'full')
  resolveOld({ en_us: { stone: 'Stone' } } as Record<LanguageCode, Record<string, string>>)
  await oldLoad
  expect(query!.files.value).toEqual(full)
  query!.useFullLanguageFiles.value = false
  expect(query!.files.value).toEqual({})
  expect(table!.files.value).toEqual({})
  scope.stop()
})
