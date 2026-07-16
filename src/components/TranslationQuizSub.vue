<template>
  <div class="translation-quiz-sub">
    <div class="progress-bar" v-if="isTimerMode">
      <div class="progress-fill" :style="{ transform: `scaleX(${progressScale})` }"></div>
    </div>
    <div class="quiz-container">
      <p v-if="loadingQuestions" class="quiz-loading" role="status" aria-live="polite">
        {{ $t('quiz.active.loading') }}
      </p>
      <p v-if="routeError" role="alert" class="quiz-route-error">{{ routeError }}</p>
      <div class="quiz-info" v-show="!loadingQuestions && !showSummary && !routeError">
        <div class="quiz-status" aria-live="polite">
          <span class="quiz-progress">{{ progressDisplay }}</span>
          <span v-if="isTimerMode" class="timer">{{ formatTime(remainingTime) }}</span>
        </div>
        <Transition :name="shouldAnimateQuestion ? 'motion-replace' : ''" mode="out-in">
          <div :key="currentQuestion?.key" class="quiz-question-content">
            <div class="info">
              <div class="source">{{ currentQuestion?.source }}</div>
              <div class="key">{{ currentQuestion?.key }}</div>
              <div class="key rating" v-if="currentQuestion?.rating !== undefined">
                <span style="font-size: smaller; margin-right: 20px">
                  <span v-for="i in fullStars" :key="i">
                    <i-material-symbols-star />
                  </span>
                  <span v-if="hasHalfStar">
                    <i-material-symbols-star-half />
                  </span>
                </span>
                <span>{{ currentQuestion?.rating.toFixed(2) }}</span>
              </div>
            </div>
            <div
              class="quiz-boxes"
              :class="queryLang"
              role="group"
              :aria-label="$t('quiz.active.character_states')"
            >
              <div
                v-for="(box, index) in boxes"
                :key="index"
                class="translation-character"
                :class="[queryLang.replace(/_/, '-'), box.state, { dark: isDarkMode }]"
                role="img"
                :aria-label="$t(`quiz.character_state.${box.state}`)"
              >
                {{ box.char }}
              </div>
            </div>
            <ul class="state-legend" :aria-label="$t('quiz.active.state_legend')">
              <li>
                <span class="state-swatch correct"></span>{{ $t('quiz.character_state.correct') }}
              </li>
              <li>
                <span class="state-swatch present"></span>{{ $t('quiz.character_state.present') }}
              </li>
              <li>
                <span class="state-swatch hinted"></span>{{ $t('quiz.character_state.hinted') }}
              </li>
              <li>
                <span class="state-swatch hinted-correct"></span
                >{{ $t('quiz.character_state.hinted-correct') }}
              </li>
            </ul>
          </div>
        </Transition>
      </div>

      <input
        v-if="!loadingQuestions && !showSummary && !routeError"
        v-model="inputText"
        autocomplete="off"
        class="quiz-input"
        :class="currentLang.toLowerCase()"
        :placeholder="$t('quiz.answer_placeholder')"
        @input="onInput"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        ref="inputRef"
        type="text"
      />

      <div class="quiz-controls" v-if="!loadingQuestions && !showSummary && !routeError">
        <button v-if="canHint" class="quiz-hint-btn interactive-control" @click="showHint">
          {{ $t('quiz.hint') }}
        </button>
        <button
          v-if="canSkip"
          class="quiz-skip-btn interactive-control"
          @click="skipQuestion"
          :disabled="isLocked"
        >
          {{ $t('quiz.skip') }}
        </button>
      </div>

      <div ref="summaryRef" class="quiz-summary" v-if="showSummary && !routeError">
        <div class="quiz-title" :class="currentLang.toLowerCase()">
          {{ $t('quiz.complete') }}
        </div>
        <div class="summary-statistics">
          <div v-if="isTimerMode" class="summary-info">
            <i-material-symbols-timer style="font-size: smaller" />
            <span class="summary-label">{{
              $t('quiz.summary.used_time', { time: formatTime(usedTime) })
            }}</span>
          </div>
          <div class="summary-info" v-if="queryLang === 'zh_cn'">
            <i-material-symbols-star style="font-size: smaller" />
            <span class="summary-label">{{
              $t('quiz.summary.level', { level: totalLevel.toFixed(2) })
            }}</span>
            <i-material-symbols-stars style="font-size: smaller" />
            <span class="summary-label">{{
              $t('quiz.summary.score', { score: totalScore.toFixed(2) })
            }}</span>
          </div>
        </div>
        <div
          class="quiz-summary-table-wrapper"
          role="region"
          tabindex="0"
          :aria-label="$t('quiz.summary.results_region')"
        >
          <table class="quiz-summary-table">
            <colgroup>
              <col class="summary-source-column" />
              <col class="summary-translation-column" />
              <col class="summary-status-column" />
            </colgroup>
            <caption class="sr-only">
              {{
                $t('quiz.summary.caption')
              }}
            </caption>
            <thead :class="currentLang.toLowerCase()">
              <tr>
                <th scope="col">{{ $t('quiz.source') }}</th>
                <th scope="col">{{ $t('quiz.translation') }}</th>
                <th scope="col">{{ $t('quiz.summary.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="question in questions" :key="question.key">
                <td class="en-us">{{ question.source }}</td>
                <td :class="currentLang.toLowerCase()">
                  <span
                    v-for="(char, i) in question.translationChars"
                    :key="i"
                    class="transl"
                    :class="[
                      questionResults[question.key]?.states[i] || 'empty',
                      { dark: isDarkMode },
                    ]"
                    >{{ char }}</span
                  >
                </td>
                <td class="status-cell">
                  {{ completionLabel(questionResults[question.key]?.completion) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="quiz-code-container">
          <div class="quiz-code">{{ quizCode }}</div>
          <span class="quiz-code-actions">
            <button
              class="interactive-control"
              type="button"
              :aria-label="
                isCopied ? $t('quiz.feedback.code_copied') : $t('quiz.actions.copy_code')
              "
              @click="copyCode"
            >
              <Transition name="motion-icon" mode="out-in">
                <i-material-symbols-check v-if="isCopied" key="check" aria-hidden="true" />
                <i-material-symbols-content-copy v-else key="copy" aria-hidden="true" />
              </Transition>
            </button>
            <button
              v-if="canShare"
              class="interactive-control"
              type="button"
              :aria-label="$t('quiz.actions.share_result')"
              @click="shareResult"
            >
              <i-material-symbols-share aria-hidden="true" />
            </button>
          </span>
        </div>
        <p class="quiz-feedback" aria-live="polite">
          {{ isCopied ? $t('quiz.feedback.code_copied') : '' }}
        </p>
        <p v-if="actionError" role="alert" class="quiz-route-error">{{ actionError }}</p>
        <div class="quiz-summary-buttons">
          <button class="button interactive-control" @click="restartQuiz">
            {{ $t('quiz.restart') }}
          </button>
          <button class="button interactive-control" @click="returnToPortal">
            {{ $t('quiz.return') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, shallowRef, watch } from 'vue'

import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import legacyQuizIdMap from '@/assets/data/id.json'
import quizIdData from '@/assets/data/quiz-id-map.json'
import ratingData from '@/assets/data/rating.json'
import { useDarkMode } from '@/composables/useDarkMode'
import { useLocale } from '@/composables/useLocale'
import { languageRegistry, type LanguageCode } from '@/data/languages'
import { matchCharacters, type CharacterState } from '@/domain/matching'
import {
  QUIZ_QUESTION_COUNT,
  buildEligibleQuestionPool,
  buildQuizQuestions,
  questionSegmentCount,
} from '@/domain/quiz'
import { decodeQuizCode, encodeQuizCode } from '@/domain/quiz-code'
import { parseTargetLanguage, parseTimerMode, type TimerMode } from '@/domain/route'
import { aggregateScores, calculateQuestionScore, type QuestionCompletion } from '@/domain/scoring'
import { shuffle } from '@/domain/shuffle'
import {
  createQuizTimer,
  elapsedMilliseconds,
  isTimerExpired,
  remainingSeconds,
  timerProgressPercent,
  type QuizTimer,
} from '@/domain/timer'
import { loadLanguages, type LanguageFile } from '@/services/translation-data'
import { copyText, shareContent } from '@/utils/sharing'
import { getSegmentedText } from '@/utils/text'

const { t } = useI18n()
const { locale: currentLang } = useLocale()
const languageFiles = shallowRef<Partial<Record<LanguageCode, LanguageFile>>>({})

interface Question {
  source: string
  key: string
  translation: string
  rating?: number
  translationChars?: string[]
}

interface Box {
  char: string
  state: CharacterState
}

interface StoredQuestionResult {
  completion: QuestionCompletion
  score: number
  states: CharacterState[]
}

const route = useRoute()
const router = useRouter()

const { isDarkMode } = useDarkMode()

const currentIndex = ref(0)
const inputText = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const summaryRef = ref<HTMLElement | null>(null)
const showSummary = ref(false)
const shouldAnimateQuestion = ref(false)
const isComposing = ref(false)
const isLocked = ref(false)
const isCopied = ref(false)
const loadingQuestions = ref(true)
const routeError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const questionResults = ref<Record<string, StoredQuestionResult>>({})
const hintsByQuestion = ref<Record<string, number[]>>({})

const onCompositionStart = () => {
  isComposing.value = true
}

const onCompositionEnd = () => {
  isComposing.value = false
  onInput()
}

const QUIZ_DURATION_SECONDS = 240
const timerMode = ref<TimerMode>('untimed')
const isTimerMode = computed(() => timerMode.value === 'timed')
const timer = ref<QuizTimer | null>(null)
const now = ref(Date.now())
let timerInterval: number | null = null

const remainingTime = computed(() => (timer.value ? remainingSeconds(timer.value, now.value) : 0))
const usedTime = computed(() =>
  timer.value
    ? Math.min(
        QUIZ_DURATION_SECONDS,
        Math.floor(elapsedMilliseconds(timer.value, now.value) / 1000),
      )
    : 0,
)
const progressScale = computed(() =>
  timer.value ? timerProgressPercent(timer.value, now.value) / 100 : 0,
)
const progressDisplay = computed(() => `${currentIndex.value + 1} / ${questions.value.length}`)

const completionLabel = (completion: QuestionCompletion | undefined) =>
  t(`quiz.completion.${completion ?? 'unanswered'}`)

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const stopTimer = () => {
  if (timerInterval !== null) window.clearInterval(timerInterval)
  timerInterval = null
}

const startTimer = () => {
  // Timed quizzes use real elapsed time and deliberately continue while the page is hidden.
  if (!isTimerMode.value) return
  now.value = Date.now()
  timer.value = createQuizTimer(now.value, QUIZ_DURATION_SECONDS)
  timerInterval = window.setInterval(() => {
    now.value = Date.now()
    if (timer.value && isTimerExpired(timer.value, now.value)) finishTimedQuiz()
  }, 250)
}

const queryLang = ref<LanguageCode>('zh_cn')
const quizCode = computed(() => route.params.code as string)
const questions = ref<Question[]>([])
const currentQuestion = computed(() => questions.value[currentIndex.value])
const boxes = computed(() => getBoxes())
const canHint = computed(
  () =>
    !showSummary.value &&
    boxes.value.filter(
      (box) => box.state !== 'correct' && box.state !== 'hinted' && box.state !== 'hinted-correct',
    ).length > 1,
)
const canSkip = computed(() => !showSummary.value && !canHint.value)
const canShare = computed(() => typeof navigator !== 'undefined' && !!navigator.share)

const fullStars = computed(() => Math.floor(currentQuestion.value?.rating || 0))
const hasHalfStar = computed(() => (currentQuestion.value?.rating || 0) % 1 > 0)
const totalLevel = computed(() => questions.value.reduce((sum, q) => sum + (q.rating || 0), 0))
const totalScore = computed(() => aggregateScores(Object.values(questionResults.value)))

const getBoxes = (): Box[] => {
  const cq = currentQuestion.value
  if (!cq) return []
  return matchCharacters(
    cq.translation,
    inputText.value,
    new Set(hintsByQuestion.value[cq.key] ?? []),
  )
}

const onInput = () => {
  if (isComposing.value || isLocked.value) return

  const cq = currentQuestion.value
  const translation = cq ? cq.translation || '' : ''
  inputText.value = getSegmentedText(inputText.value)
    .slice(0, getSegmentedText(translation).length)
    .join('')

  if (cq && inputText.value === (cq.translation || '')) {
    handleCorrectAnswer()
  }
}

const ANSWER_FEEDBACK_DURATION_MS = 420

const handleCorrectAnswer = async () => {
  isLocked.value = true
  const cq = currentQuestion.value
  if (!cq) return
  recordCurrentResult('correct')

  await new Promise((resolve) => window.setTimeout(resolve, ANSWER_FEEDBACK_DURATION_MS))
  if (showSummary.value) {
    isLocked.value = false
    return
  }
  advanceQuestion()
  isLocked.value = false
}

const showHint = () => {
  if (isLocked.value) return
  const cq = currentQuestion.value
  if (!cq) return

  const currentBoxes = boxes.value

  const hintIndex = currentBoxes.findIndex(
    (box) => box.state !== 'correct' && box.state !== 'hinted' && box.state !== 'hinted-correct',
  )

  if (hintIndex !== -1) {
    const currentHints = hintsByQuestion.value[cq.key] ?? []
    hintsByQuestion.value = { ...hintsByQuestion.value, [cq.key]: [...currentHints, hintIndex] }
  }
}

const skipQuestion = async () => {
  if (isLocked.value) return
  isLocked.value = true
  recordCurrentResult('skipped')
  advanceQuestion()
  isLocked.value = false
}

const recordCurrentResult = (completion: QuestionCompletion) => {
  const question = currentQuestion.value
  if (!question) return
  const states = boxes.value.map((box) => box.state)
  const score = calculateQuestionScore({
    completion,
    hintCount: (hintsByQuestion.value[question.key] ?? []).length,
    segmentCount: questionSegmentCount(question),
  })
  questionResults.value = {
    ...questionResults.value,
    [question.key]: { completion, score: score.score, states },
  }
}

const advanceQuestion = () => {
  if (currentIndex.value >= questions.value.length - 1) {
    stopTimer()
    showSummary.value = true
    void nextTick(() => summaryRef.value?.scrollIntoView({ block: 'start' }))
    return
  }
  shouldAnimateQuestion.value = true
  currentIndex.value += 1
  inputText.value = ''
  void nextTick(() => inputRef.value?.focus())
}

const finishTimedQuiz = () => {
  if (showSummary.value) return
  for (let index = currentIndex.value; index < questions.value.length; index += 1) {
    const question = questions.value[index] as Question
    if (questionResults.value[question.key]) continue
    const states = index === currentIndex.value ? boxes.value.map((box) => box.state) : []
    const score = calculateQuestionScore({
      completion: 'timed-out',
      hintCount: (hintsByQuestion.value[question.key] ?? []).length,
      segmentCount: questionSegmentCount(question),
    })
    questionResults.value = {
      ...questionResults.value,
      [question.key]: { completion: 'timed-out', score: score.score, states },
    }
  }
  stopTimer()
  showSummary.value = true
  void nextTick(() => summaryRef.value?.scrollIntoView({ block: 'start' }))
}

const copyCode = async () => {
  const result = await copyText(quizCode.value)
  if (!result.ok) {
    actionError.value = t('quiz.errors.copy_failure')
    return
  }
  actionError.value = null
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

const shareResult = async () => {
  const result = await shareContent({
    title: t('quiz.title'),
    text: t('quiz.description'),
    url: window.location.href,
  })
  if (!result.ok) {
    actionError.value = t('quiz.errors.share_failure')
  }
}

const restartQuiz = () => {
  const eligible = buildEligibleQuestionPool(
    queryLang.value,
    languageFiles.value as Record<LanguageCode, LanguageFile>,
    quizIdData.ids,
  )
  const code = encodeQuizCode(
    shuffle(eligible.map((question) => question.key)).slice(0, QUIZ_QUESTION_COUNT),
    quizIdData.ids,
  )
  if (!code.ok) {
    actionError.value = t('quiz.errors.replacement_failure')
    return
  }
  router.push({
    name: 'quiz-code',
    params: { code: code.value },
    query: { l: queryLang.value, t: isTimerMode.value ? '1' : '0' },
  })
}

const returnToPortal = () => {
  router.push('/quiz')
}

const resetQuizState = () => {
  stopTimer()
  currentIndex.value = 0
  inputText.value = ''
  showSummary.value = false
  isComposing.value = false
  isLocked.value = false
  isCopied.value = false
  actionError.value = null
  questionResults.value = {}
  hintsByQuestion.value = {}
  timer.value = null
  shouldAnimateQuestion.value = false
}

const loadQuestions = async () => {
  resetQuizState()
  loadingQuestions.value = true
  routeError.value = null
  const decoded = decodeQuizCode(quizCode.value, quizIdData.ids, legacyQuizIdMap)
  if (!decoded.ok) {
    routeError.value = t('quiz.errors.invalid_route_code')
    questions.value = []
    loadingQuestions.value = false
    return
  }
  const quizLanguages = languageRegistry
    .filter((language) => language.quiz.enabled)
    .map((language) => language.code)
  const language = parseTargetLanguage(route.query.l, quizLanguages, 'zh_cn')
  const timerResult = parseTimerMode(route.query.t)
  if (!language.ok || !timerResult.ok) {
    routeError.value = t('quiz.errors.invalid_route_options')
    questions.value = []
    loadingQuestions.value = false
    return
  }
  queryLang.value = language.value
  timerMode.value = timerResult.value
  try {
    languageFiles.value = {
      ...languageFiles.value,
      ...(await loadLanguages(['en_us', queryLang.value])),
    }
  } catch {
    routeError.value = t('quiz.errors.load_failure')
    questions.value = []
    loadingQuestions.value = false
    return
  }
  const selected = buildQuizQuestions(
    decoded.value.keys,
    queryLang.value,
    languageFiles.value as Record<LanguageCode, LanguageFile>,
    quizIdData.ids,
  )
  if (!selected.ok) {
    routeError.value = t('quiz.errors.insufficient_route_questions', {
      minimum: QUIZ_QUESTION_COUNT,
    })
    questions.value = []
    loadingQuestions.value = false
    return
  }
  questions.value = shuffle(selected.value).map((question) => ({
    ...question,
    rating:
      queryLang.value === 'zh_cn' ? ratingData[question.key as keyof typeof ratingData] : undefined,
    translationChars: getSegmentedText(question.translation),
  }))
  loadingQuestions.value = false
  startTimer()
}

watch(
  () => [route.params.code, route.query.l, route.query.t],
  () => void loadQuestions(),
  { immediate: true },
)

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.translation-quiz-sub {
  --app-bar-offset: 64px;
  min-height: calc(100dvh - var(--app-bar-offset));
}

.progress-bar {
  position: sticky;
  z-index: 45;
  top: var(--app-bar-offset);
  height: 4px;
  background: var(--border);
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transform-origin: left;
  transition: transform 250ms linear;
}

.quiz-container {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: var(--space-3);
  width: min(calc(100% - 2rem), 64rem);
  min-height: calc(100dvh - var(--app-bar-offset) - 4px);
  margin: 0 auto;
  padding: clamp(1.5rem, 5vh, 3.5rem) 0 max(3rem, env(keyboard-inset-height, 0px));
}

.quiz-loading,
.quiz-route-error {
  width: min(100%, 42rem);
  margin: 0;
  padding: var(--space-4);
  border-left: 4px solid var(--info);
  background: color-mix(in srgb, var(--info) 8%, var(--surface));
  color: var(--text-secondary);
}

.quiz-route-error {
  border-color: var(--error);
  background: color-mix(in srgb, var(--error) 8%, var(--surface));
  color: var(--error);
}

.quiz-info {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  width: 100%;
  text-align: center;
}

.quiz-question-content {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  width: 100%;
}

.quiz-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}
.quiz-progress {
  color: var(--muted);
}

.info {
  display: grid;
  justify-items: center;
  gap: var(--space-2);
  width: 100%;
}

.timer {
  color: var(--warning);
  font: 700 1.1rem var(--monospace-font);
}

.source {
  max-width: 100%;
  font: 700 clamp(2rem, 6vw, 4.25rem)/1.08 var(--serif-font);
  overflow-wrap: anywhere;
}

.key {
  max-width: 100%;
  color: var(--muted);
  font: clamp(0.78rem, 2vw, 1.05rem) var(--monospace-font);
  overflow-wrap: anywhere;
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.rating > span:first-child {
  display: inline-flex;
  margin-right: 0 !important;
  color: var(--warning);
}

.quiz-boxes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(0.3rem, 1vw, 0.55rem);
  width: 100%;
}

.translation-character {
  display: grid;
  place-items: center;
  inline-size: clamp(2.7rem, 6vw, 5.2rem);
  block-size: clamp(3rem, 7vw, 5.4rem);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
  color: var(--text);
  font-size: clamp(1.25rem, 3vw, 2.2rem);
  transition:
    background-color var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard),
    color var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-emphasized);
}

.translation-character.correct,
.transl.correct,
.state-swatch.correct {
  border-color: var(--success);
  background: color-mix(in srgb, var(--success) 24%, var(--surface));
}

.translation-character.correct {
  transform: scale(1.03);
}

.translation-character.present,
.transl.present,
.state-swatch.present {
  border-color: var(--warning);
  background: color-mix(in srgb, var(--warning) 24%, var(--surface));
}

.translation-character.absent,
.transl.absent,
.state-swatch.absent {
  border-color: var(--error);
  background: color-mix(in srgb, var(--error) 18%, var(--surface));
}

.translation-character.hinted,
.transl.hinted,
.state-swatch.hinted {
  border-color: var(--error);
  background: color-mix(in srgb, var(--error) 28%, var(--surface));
}

.translation-character.hinted-correct,
.transl.hinted-correct,
.state-swatch.hinted-correct {
  border-color: var(--info);
  background: color-mix(in srgb, var(--info) 24%, var(--surface));
}

.state-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  color: var(--muted);
  font-size: 0.78rem;
  list-style: none;
}

.state-legend li {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.state-swatch {
  width: 0.8rem;
  height: 0.8rem;
  border: 1px solid var(--border-strong);
  border-radius: 2px;
}

.quiz-input,
.quiz-controls {
  width: min(100%, 42rem);
}

.quiz-input {
  min-height: 3.5rem;
  padding: 0.65rem 1rem;
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font-size: clamp(1.05rem, 2.5vw, 1.35rem);
  text-align: center;
  scroll-margin-bottom: 40dvh;
}

.quiz-controls {
  display: grid;
  gap: var(--space-3);
}

.quiz-controls button,
.quiz-summary-buttons .button,
.quiz-code-actions button {
  min-height: var(--control-height);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-weight: 700;
}

.quiz-controls button:hover,
.quiz-summary-buttons .button:hover,
.quiz-code-actions button:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.quiz-title {
  color: var(--text);
  font: 700 clamp(2rem, 5vw, 3rem)/1.1 var(--serif-font);
  text-align: center;
}

.quiz-summary {
  display: grid;
  justify-items: center;
  gap: var(--space-4);
  width: 100%;
  scroll-margin-top: calc(var(--app-bar-offset) + var(--space-3));
}

.summary-statistics {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}

.summary-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--text-secondary);
}

.quiz-summary-table-wrapper {
  width: 100%;
  max-height: min(55dvh, 34rem);
  overflow: auto;
  border: 1px solid var(--border);
  background: var(--surface);
}

.quiz-summary-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.quiz-summary-table th,
.quiz-summary-table td {
  padding: 0.65rem 0.75rem;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  text-align: left;
  vertical-align: top;
  overflow-wrap: anywhere;
}

.summary-source-column {
  width: 38%;
}
.summary-translation-column {
  width: 42%;
}
.summary-status-column {
  width: 20%;
}

.quiz-summary-table th {
  position: sticky;
  z-index: 2;
  top: 0;
  background: var(--surface-subtle);
}

.quiz-summary-table tr:nth-child(even) td {
  background: color-mix(in srgb, var(--surface-subtle) 72%, var(--surface));
}

.transl {
  display: inline-block;
  min-width: 1.15em;
  margin: 1px;
  padding: 0.08rem 0.16rem;
  border-radius: 2px;
  text-align: center;
}

.status-cell {
  font-weight: 700;
}

.quiz-code-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-2);
  width: min(100%, 48rem);
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
}

.quiz-code {
  min-width: 0;
  font: 0.75rem/1.5 var(--monospace-font);
  overflow-wrap: anywhere;
}

.quiz-code-actions {
  display: flex;
  gap: var(--space-2);
}

.quiz-code-actions button {
  display: grid;
  width: var(--control-height);
  padding: 0;
  place-items: center;
}

.quiz-feedback {
  min-height: 1.5rem;
  margin: 0;
  color: var(--success);
}

.quiz-summary-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}

.quiz-summary-buttons .button {
  padding: 0.6rem 1rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 800px) {
  .translation-quiz-sub {
    --app-bar-offset: 56px;
  }

  .quiz-container {
    width: min(calc(100% - 1rem), 64rem);
    min-height: calc(100dvh - var(--app-bar-offset) - 70px);
    padding: var(--space-4) 0 max(6rem, env(keyboard-inset-height, 0px));
    align-content: start;
  }

  .source {
    font-size: clamp(1.8rem, 9vw, 2.8rem);
  }

  .translation-character {
    inline-size: clamp(2.35rem, 13vw, 3.2rem);
    block-size: clamp(2.7rem, 14vw, 3.4rem);
  }

  .state-legend {
    gap: var(--space-2);
  }

  .quiz-summary-table th,
  .quiz-summary-table td {
    padding: 0.5rem;
    font-size: 0.88rem;
  }

  .quiz-summary-table .status-cell {
    padding-inline: 0.3rem;
    font-size: 0.82rem;
  }

  .quiz-code-container {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .quiz-container {
    min-height: auto;
    padding-block: var(--space-4);
    align-content: start;
  }

  .source {
    font-size: 2rem;
  }

  .translation-character {
    inline-size: 2.5rem;
    block-size: 2.7rem;
    font-size: 1.2rem;
  }

  .quiz-summary-table-wrapper {
    max-height: 65dvh;
  }
}

@media (prefers-reduced-motion: reduce) {
  .translation-character.correct {
    transform: none;
  }
}
</style>
