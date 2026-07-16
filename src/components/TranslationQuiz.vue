<template>
  <div class="sans" :class="currentLang.toLowerCase()">
    <main class="quiz-container">
      <h1 class="quiz-title" :class="currentLang.toLowerCase()">{{ $t('quiz.title') }}</h1>
      <p class="quiz-description">
        {{ $t('quiz.portal_description') }}
      </p>
      <section class="quiz-generator">
        <label class="quiz-field" for="query-lang">
          <span>{{ $t('quiz.language') }}</span>
          <select
            :class="`${queryLang.replace('_', '-')} sans`"
            v-model="queryLang"
            id="query-lang"
          >
            <option
              v-for="language in quizLanguages"
              :key="language.code"
              :value="language.code"
              :class="[language.typographyClass, 'sans']"
              :lang="language.htmlLang"
            >
              {{ language.gameName }}
            </option>
          </select>
        </label>
        <label for="timer-mode" class="timer-control">
          <input type="checkbox" id="timer-mode" v-model="timerMode" />
          <span>{{ $t('quiz.timer_mode') }}</span>
        </label>
        <Transition name="motion-status" mode="out-in">
          <p
            :key="eligibility.status"
            class="quiz-eligibility"
            :class="`quiz-eligibility--${eligibility.status}`"
            :role="eligibility.status === 'error' ? 'alert' : 'status'"
            aria-live="polite"
          >
            <template v-if="eligibility.status === 'loading'">
              {{ $t('quiz.eligibility.loading') }}
            </template>
            <template v-else-if="eligibility.status === 'available'">
              {{ $t('quiz.eligibility.available', { count: eligibility.count }) }}
            </template>
            <template v-else-if="eligibility.status === 'unavailable'">
              {{
                $t('quiz.eligibility.unavailable', {
                  count: eligibility.count,
                  minimum: quizQuestionCount,
                })
              }}
            </template>
            <template v-else>{{ $t('quiz.eligibility.failure') }}</template>
          </p>
        </Transition>
        <button
          class="quiz-btn-primary interactive-control"
          type="button"
          :disabled="eligibility.status !== 'available' || isStartingQuiz"
          @click="startRandomQuiz"
        >
          {{
            eligibility.status === 'loading' || isStartingQuiz
              ? $t('quiz.eligibility.loading_button')
              : $t('quiz.random_quiz')
          }}
        </button>
      </section>
      <div class="quiz-separator" aria-hidden="true">
        <span>{{ $t('quiz.or') }}</span>
      </div>
      <section class="quiz-code-entry">
        <div class="quiz-input-group">
          <input
            v-model="inputCode"
            type="text"
            id="quiz-code"
            :placeholder="$t('quiz.code_placeholder')"
            @keyup.enter="startQuiz"
          />
          <button class="quiz-enter-button interactive-control" type="button" @click="startQuiz">
            {{ $t('quiz.nav.enter') }}
          </button>
        </div>
        <Transition name="motion-status">
          <p v-if="quizError" role="alert" class="quiz-error">{{ quizError }}</p>
        </Transition>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import quizIdData from '@/assets/data/quiz-id-map.json'
import legacyQuizIdMap from '@/assets/data/id.json'
import { useLocale } from '@/composables/useLocale'
import { languageRegistry, type LanguageCode } from '@/data/languages'
import {
  QUIZ_QUESTION_COUNT,
  buildEligibleQuestionPool,
  getQuizLanguageAvailability,
} from '@/domain/quiz'
import { decodeQuizCode, encodeQuizCode } from '@/domain/quiz-code'
import { shuffle } from '@/domain/shuffle'
import { loadLanguages, type LanguageFile } from '@/services/translation-data'

const router = useRouter()
const { t } = useI18n()
const { locale: currentLang } = useLocale()

const queryLang = ref<LanguageCode>('zh_cn')
const inputCode = ref('')
const timerMode = ref(false)
const quizError = ref('')
const isStartingQuiz = ref(false)
const quizQuestionCount = QUIZ_QUESTION_COUNT
const quizIdMap = quizIdData.ids
const loadedQuizData = ref<Partial<Record<LanguageCode, LanguageFile>>>({})
type EligibilityState =
  | { status: 'loading' }
  | { status: 'available'; count: number }
  | { status: 'unavailable'; count: number }
  | { status: 'error' }
const eligibility = ref<EligibilityState>({ status: 'loading' })
let eligibilityRevision = 0

const quizLanguages = computed(() => languageRegistry.filter((language) => language.quiz.enabled))

async function loadEligibility(language: LanguageCode) {
  const revision = ++eligibilityRevision
  eligibility.value = { status: 'loading' }
  quizError.value = ''
  try {
    loadedQuizData.value = {
      ...loadedQuizData.value,
      ...(await loadLanguages(['en_us', language])),
    }
    if (revision !== eligibilityRevision) return
    const availability = getQuizLanguageAvailability(
      language,
      loadedQuizData.value as Record<LanguageCode, LanguageFile>,
      quizIdMap,
    )
    eligibility.value = availability.available
      ? { status: 'available', count: availability.eligibleCount }
      : { status: 'unavailable', count: availability.eligibleCount }
  } catch {
    if (revision === eligibilityRevision) eligibility.value = { status: 'error' }
  }
}

watch(queryLang, (language) => void loadEligibility(language), { immediate: true })

const generateQuizCode = async () => {
  loadedQuizData.value = {
    ...loadedQuizData.value,
    ...(await loadLanguages(['en_us', queryLang.value])),
  }
  const eligible = buildEligibleQuestionPool(
    queryLang.value,
    loadedQuizData.value as Record<LanguageCode, LanguageFile>,
    quizIdMap,
  )
  if (eligible.length < QUIZ_QUESTION_COUNT) {
    quizError.value = t('quiz.eligibility.unavailable', {
      minimum: QUIZ_QUESTION_COUNT,
      count: eligible.length,
    })
    return undefined
  }
  return encodeQuizCode(
    shuffle(eligible.map((question) => question.key)).slice(0, QUIZ_QUESTION_COUNT),
    quizIdMap,
  )
}

const startRandomQuiz = async () => {
  quizError.value = ''
  isStartingQuiz.value = true
  try {
    const result = await generateQuizCode()
    if (!result) return
    if (!result.ok) {
      quizError.value = t('quiz.errors.invalid_mapping')
      return
    }
    await router.push({
      name: 'quiz-code',
      params: { code: result.value },
      query: { l: queryLang.value, t: timerMode.value ? '1' : '0' },
    })
  } catch {
    quizError.value = t('quiz.errors.generate_failure')
  } finally {
    isStartingQuiz.value = false
  }
}

const startQuiz = () => {
  quizError.value = ''
  const code = inputCode.value.trim()
  const result = decodeQuizCode(code, quizIdMap, legacyQuizIdMap)
  if (!result.ok) {
    quizError.value = t('quiz.errors.unsupported_code')
    return
  }
  router.push({
    name: 'quiz-code',
    params: { code },
    query: { l: queryLang.value, t: timerMode.value ? '1' : '0' },
  })
}
</script>

<style scoped>
.quiz-container {
  display: grid;
  gap: var(--space-4);
  width: min(100% - 2rem, 42rem);
  min-height: calc(100dvh - 64px - var(--space-6));
  margin: 0 auto;
  padding: clamp(2.5rem, 8vh, 6rem) 0;
  align-content: center;
}

.quiz-title {
  margin: 0;
  color: var(--text);
  font: 700 clamp(2rem, 6vw, 3.4rem)/1.08 var(--serif-font);
  text-align: center;
  text-wrap: balance;
}

.quiz-description {
  max-width: 42rem;
  margin: 0 auto var(--space-3);
  color: var(--text-secondary);
  text-align: center;
}

.quiz-btn-primary,
.quiz-enter-button {
  min-height: var(--control-height);
  padding: 0.65rem 1rem;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: #fff;
  font-weight: 700;
}

.quiz-generator,
.quiz-code-entry {
  display: grid;
  gap: var(--space-3);
  width: 100%;
}

.quiz-field {
  display: grid;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-weight: 700;
}

.quiz-btn-primary:hover:not(:disabled),
.quiz-enter-button:hover {
  background: var(--accent-strong);
}

.quiz-field select,
.quiz-input-group input {
  width: 100%;
  min-width: 0;
  min-height: var(--control-height);
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
}

.timer-control input {
  width: 1.15rem;
  height: 1.15rem;
  accent-color: var(--accent);
}

.timer-control {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-weight: 700;
}

.quiz-eligibility,
.quiz-error {
  min-height: 1.5rem;
  margin: 0;
  font-size: 0.92rem;
}

.quiz-eligibility {
  color: var(--text-secondary);
}

.quiz-eligibility--available {
  color: var(--success);
}

.quiz-eligibility--unavailable,
.quiz-eligibility--error,
.quiz-error {
  color: var(--error);
}

.quiz-input-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-3);
}

.quiz-separator {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--space-3);
  color: var(--muted);
}

.quiz-separator::before,
.quiz-separator::after {
  height: 1px;
  background: var(--border);
  content: '';
}

@media (max-width: 800px) {
  .quiz-container {
    width: min(100% - 1rem, 42rem);
    min-height: calc(100dvh - 126px);
    padding: var(--space-4) var(--space-2) calc(70px + var(--safe-bottom) + var(--space-4));
    align-content: start;
  }

  .quiz-title {
    font-size: clamp(1.9rem, 8vw, 2.4rem);
  }

  .quiz-input-group {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .quiz-container {
    min-height: auto;
    padding-block: var(--space-5);
    align-content: start;
  }
}
</style>
