<template>
  <div class="translation-quiz-sub">
    <div class="progress-bar" v-if="isTimerMode">
      <div class="progress-fill" :style="{ width: progressWidth + '%' }"></div>
    </div>
    <div class="nav-buttons">
      <button class="nav-button" @click="toggleDarkMode">
        <i-material-symbols-light-mode v-if="isDarkMode" style="font-size: 1.5em" />
        <i-material-symbols-dark-mode v-else style="font-size: 1.5em" />
      </button>
    </div>
    <div class="quiz-container">
      <p v-if="routeError" role="alert" class="quiz-route-error">{{ routeError }}</p>
      <div class="quiz-info" v-show="!showSummary && !routeError">
        <div class="info">
          <div v-if="isTimerMode" class="timer">
            {{ formatTime(remainingTime) }}
          </div>
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
        <div class="quiz-boxes" :class="queryLang">
          <div
            v-for="(box, index) in boxes"
            :key="index"
            class="translation-character"
            :class="[queryLang.replace(/_/, '-'), box.state, { dark: isDarkMode }]"
          >
            {{ box.char }}
          </div>
        </div>
      </div>

      <input
        v-if="!showSummary && !routeError"
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

      <div class="quiz-controls" v-if="!showSummary && !routeError">
        <button v-if="canHint" class="quiz-hint-btn" @click="showHint">
          {{ $t('quiz.hint') }}
        </button>
        <button v-if="canSkip" class="quiz-skip-btn" @click="skipQuestion" :disabled="isLocked">
          {{ $t('quiz.skip') }}
        </button>
      </div>

      <div class="quiz-summary" v-if="showSummary && !routeError">
        <div class="quiz-title" :class="currentLang.toLowerCase()">
          {{ $t('quiz.complete') }}
        </div>
        <div v-if="isTimerMode" class="summary-info">
          <i-material-symbols-timer style="font-size: smaller" />
          <span class="summary-label">{{ formatTime(usedTime) }}</span>
        </div>
        <div class="summary-info" v-if="queryLang === 'zh_cn'">
          <i-material-symbols-star style="font-size: smaller" />
          <span class="summary-label">{{ totalLevel.toFixed(2) }} /</span>
          <i-material-symbols-stars style="font-size: smaller" />
          <span class="summary-label">{{ totalScore.toFixed(2) }} pts</span>
        </div>
        <table class="quiz-summary-table">
          <thead :class="currentLang.toLowerCase()">
            <tr>
              <th>{{ $t('quiz.source') }}</th>
              <th>{{ $t('quiz.translation') }}</th>
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
                  :class="[questionResults[question.key]?.states[i] || 'empty', { dark: isDarkMode }]"
                  >{{ char }}</span
                >
              </td>
            </tr>
          </tbody>
        </table>
        <div class="quiz-code-container">
          <div class="quiz-code">{{ quizCode }}</div>
          <span style="font-size: 1.2em">
            <i-material-symbols-content-copy v-if="!isCopied" class="btn" @click="copyCode" />
            <i-material-symbols-check v-else class="btn" />
            <i-material-symbols-share class="btn" v-if="canShare" @click="shareResult" />
          </span>
        </div>
        <p v-if="actionError" role="alert" class="quiz-route-error">{{ actionError }}</p>
        <div class="quiz-summary-buttons">
          <button class="button" @click="restartQuiz">
            {{ $t('quiz.restart') }}
          </button>
          <button class="button" @click="returnToPortal">
            {{ $t('quiz.return') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import legacyQuizIdMap from '@/assets/data/id.json'
import quizIdData from '@/assets/data/quiz-id-map.json'
import ratingData from '@/assets/data/rating.json'
import { useDarkMode } from '@/composables/useDarkMode'
import { matchCharacters, type CharacterState } from '@/domain/matching'
import { QUIZ_QUESTION_COUNT, buildEligibleQuestionPool, buildQuizQuestions, questionSegmentCount } from '@/domain/quiz'
import { decodeQuizCode, encodeQuizCode } from '@/domain/quiz-code'
import { parseTargetLanguage, parseTimerMode, type TimerMode } from '@/domain/route'
import { aggregateScores, calculateQuestionScore, type QuestionCompletion } from '@/domain/scoring'
import { shuffle } from '@/domain/shuffle'
import { createQuizTimer, elapsedMilliseconds, isTimerExpired, remainingSeconds, timerProgressPercent, type QuizTimer } from '@/domain/timer'
import { currentLocale } from '@/main'
import { languageFiles, languageRegistry, type LanguageCode } from '@/utils/languages'
import { copyText, shareContent } from '@/utils/sharing'
import { getSegmentedText } from '@/utils/text'

const { t } = useI18n()
const currentLang = computed(() => currentLocale.value)

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

const { isDarkMode, toggleDarkMode } = useDarkMode()

const currentIndex = ref(0)
const inputText = ref('')
const showSummary = ref(false)
const isComposing = ref(false)
const isLocked = ref(false)
const isCopied = ref(false)
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
  timer.value ? Math.min(QUIZ_DURATION_SECONDS, Math.floor(elapsedMilliseconds(timer.value, now.value) / 1000)) : 0,
)
const progressWidth = computed(() => (timer.value ? timerProgressPercent(timer.value, now.value) : 0))

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
    boxes.value.filter((box) => box.state !== 'correct' && box.state !== 'hinted' && box.state !== 'hinted-correct').length >
      1,
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
  return matchCharacters(cq.translation, inputText.value, new Set(hintsByQuestion.value[cq.key] ?? []))
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

const handleCorrectAnswer = async () => {
  isLocked.value = true
  const cq = currentQuestion.value
  if (!cq) return
  recordCurrentResult('correct')

  await new Promise((resolve) => setTimeout(resolve, 800))
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

  const hintIndex = currentBoxes.findIndex((box) =>
    box.state !== 'correct' && box.state !== 'hinted' && box.state !== 'hinted-correct',
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
    return
  }
  currentIndex.value += 1
  inputText.value = ''
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
}

const copyCode = async () => {
  const result = await copyText(quizCode.value)
  if (!result.ok) {
    actionError.value = 'Unable to copy the quiz code.'
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
    actionError.value = 'Unable to share the quiz result.'
  }
}

const restartQuiz = () => {
  const eligible = buildEligibleQuestionPool(queryLang.value, languageFiles, quizIdData.ids)
  const code = encodeQuizCode(
    shuffle(eligible.map((question) => question.key)).slice(0, QUIZ_QUESTION_COUNT),
    quizIdData.ids,
  )
  if (!code.ok) {
    actionError.value = 'Unable to generate a replacement quiz.'
    return
  }
  router.push({
    name: 'TranslationQuizSub',
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
}

const loadQuestions = () => {
  resetQuizState()
  routeError.value = null
  const decoded = decodeQuizCode(quizCode.value, quizIdData.ids, legacyQuizIdMap)
  if (!decoded.ok) {
    routeError.value = 'This quiz code is missing, malformed, unsupported, or contains an unknown question.'
    questions.value = []
    return
  }
  const quizLanguages = languageRegistry.filter((language) => language.quiz.enabled).map((language) => language.code)
  const language = parseTargetLanguage(route.query.l, quizLanguages, 'zh_cn')
  const timerResult = parseTimerMode(route.query.t)
  if (!language.ok || !timerResult.ok) {
    routeError.value = 'The quiz language or timer mode is invalid.'
    questions.value = []
    return
  }
  queryLang.value = language.value
  timerMode.value = timerResult.value
  const selected = buildQuizQuestions(decoded.value.keys, queryLang.value, languageFiles, quizIdData.ids)
  if (!selected.ok) {
    routeError.value = `This valid code provides fewer than ${QUIZ_QUESTION_COUNT} usable questions for the selected language.`
    questions.value = []
    return
  }
  questions.value = shuffle(selected.value).map((question) => ({
    ...question,
    rating: queryLang.value === 'zh_cn' ? ratingData[question.key as keyof typeof ratingData] : undefined,
    translationChars: getSegmentedText(question.translation),
  }))
  startTimer()
}

watch(
  () => [route.params.code, route.query.l, route.query.t],
  () => loadQuestions(),
  { immediate: true },
)

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
/* Progress Bar */
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #e0e0e0;
  z-index: 1000;
}

.progress-fill {
  height: 100%;
  background-color: #5b9bd5;
  transition: width 1s linear;
}

/* Main Container */
.quiz-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  flex-direction: column;
  padding: 2rem;
  box-sizing: border-box;
}

.quiz-route-error {
  color: #b42318;
  text-align: center;
}

/* Character Boxes */
.translation-character {
  display: inline-block;
  width: 7rem;
  height: 7rem;
  line-height: 7rem;
  border: 2px solid transparent;
  border-radius: 8px;
  margin: 5px;
  font-size: 3em;
  text-align: center;
  vertical-align: top;
  box-sizing: border-box;
  color: #000;
  background-color: #9ca3af25;
  font-weight: 700;
  transition: all 0.2s ease;
}

.translation-character.correct {
  color: #000;
  background-color: #64dd17;
}

.translation-character.hinted {
  color: #000;
  background-color: #ef5350;
}

.translation-character.hinted-correct {
  color: #000;
  background-color: #64b5f6;
}

.translation-character.present {
  color: #000;
  background-color: #ffd600;
}

/* Input & Controls */
.quiz-controls button,
.quiz-input {
  font-size: 1.75em;
  text-align: center;
  border: 2px solid;
  border-radius: 8px;
  box-sizing: border-box;
  background-color: transparent;
  color: #000;
}

.quiz-input {
  margin-top: 20px;
  height: 3em;
  width: 50%;
  border-color: #50535a1a;
}

.quiz-controls {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 50%;
  gap: 15px;
}

.quiz-controls button {
  height: 2.25em;
  flex: 1;
}

.quiz-controls button[disabled] {
  opacity: 0.5 !important;
}

button {
  background-color: transparent !important;
}

select:hover,
input:hover,
button:hover {
  border-width: 3px !important;
  border-color: inherit;
}

/* Info & Typography */
.info {
  margin-bottom: 20px;
}

.source {
  font-family: var(--serif-font), serif;
  font-size: clamp(2.5em, calc(3em + 1vw), 4em);
  font-weight: 600;
  text-align: center;
}

.key {
  font-family: var(--monospace-font), monospace;
  font-size: clamp(1.5em, calc(1.5em + 0.6vw), 3em);
  text-align: center;
  padding-top: 10px;
}

.rating span {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.quiz-title {
  font-size: 2.8em;
  font-weight: 900;
}

/* Summary Section */
.quiz-summary {
  text-align: center;
  background-color: white;
  padding: 20px 30px;
  width: max-content;
  border-radius: 8px;
}

.summary-info {
  font-family: var(--monospace-font), monospace;
  font-size: clamp(1.5em, calc(1.5em + 0.6vw), 3em);
  text-align: center;
  padding: 0;
  font-size: 1.5em;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.summary-info {
  display: flex;
  align-items: center;
}
.summary-label {
  margin: 0 10px;
}

.quiz-summary-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
}

.button {
  font-size: 1.2em;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: #5b9bd5 !important;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
  font-weight: 600;
  border: none;
}

.button:hover {
  background: #4a8ac4 !important;
}

.quiz-code-container {
  margin: 0 auto;
  padding: 15px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.quiz-code {
  padding: 0 5px;
  font-size: 16px;
  font-family: var(--monospace-font), monospace;
}

/* Summary Table */
.quiz-summary-table {
  margin: 10px auto 0 auto;
  border-collapse: collapse;
  font-size: larger;
}

.quiz-summary-table tr td,
.quiz-summary-table thead th {
  border: 2px solid #5b9bd5;
  padding: 5px;
}

.quiz-summary-table tr:nth-child(odd) {
  background-color: #2e4e6c0f;
}

.quiz-summary-table tr:nth-child(even) {
  background-color: #5b9bd533;
}

.quiz-summary-table thead {
  font-size: larger;
}

/* Navigation Buttons */
.nav-buttons {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 1000;
}

.nav-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff !important;
  color: #666;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  color: #7aa2ea;
}

/* Timer */
.timer {
  font-family: var(--monospace-font), monospace;
  font-size: 2em;
  font-weight: bold;
  color: #5b9bd5;
  margin-bottom: 10px;
}

/* Answer Highlighting */
.transl {
  color: #000;
}

.transl.correct {
  background-color: #85df4c;
}

.transl.present {
  background-color: #f3d837;
}

.transl.hinted {
  background-color: #ff6d55;
}

.transl.hinted-correct {
  background-color: #5ab0f3;
}

.transl.dark {
  color: #fff;
  background-color: transparent;
}

.transl.correct.dark {
  color: #85df4c;
  background-color: transparent;
}

.transl.hinted.dark {
  color: #ff6d55;
  background-color: transparent;
}

.transl.hinted-correct.dark {
  color: #5ab0f3;
  background-color: transparent;
}

.transl.present.dark {
  color: #f3d837;
  background-color: transparent;
}

.translation-character.dark {
  color: #e0e0e0;
  background-color: #9ca3af25;
}

.translation-character.correct.dark {
  color: #e0e0e0;
  background-color: #43a047;
}

.translation-character.present.dark {
  color: #e0e0e0;
  background-color: #afb42b;
}

.translation-character.hinted.dark {
  color: #e0e0e0;
  background-color: #d32f2f;
}

.translation-character.hinted-correct.dark {
  color: #e0e0e0;
  background-color: #0288d1;
}

/*  Dark Mode */
body.dark-mode .progress-bar {
  background-color: #333;
}

body.dark-mode .progress-fill {
  background-color: #64b5f6;
}

body.dark-mode .quiz-input {
  border-color: #e0e0e01a;
}

body.dark-mode .quiz-controls button,
body.dark-mode .quiz-input {
  color: #e0e0e0;
  border-color: #505050;
}

body.dark-mode .quiz-summary {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

body.dark-mode .quiz-summary-table td,
body.dark-mode .quiz-summary-table th {
  border-color: #505050;
}

body.dark-mode .quiz-summary-table tr:nth-child(odd) {
  background-color: #2a2a2a;
}

body.dark-mode .quiz-summary-table tr:nth-child(even) {
  background-color: #333333;
}

body.dark-mode .quiz-code {
  background-color: #2a2a2a;
  color: #e0e0e0;
}

body.dark-mode .nav-button {
  background: #333 !important;
  color: #e0e0e0;
}

body.dark-mode .button {
  background: #4a4a4a !important;
}

body.dark-mode .button:hover {
  background: #5a5a5a !important;
}

body.dark-mode .timer {
  color: #64b5f6;
}

/* Responsive Styles */
@media (orientation: landscape) and (max-height: 520px) {
  .quiz-container {
    padding: 1rem;
  }

  .source {
    font-size: clamp(1em, calc(1.4em + 1vw), 3em);
  }

  .key {
    font-size: clamp(0.5em, calc(0.5em + 1vw), 1.75em);
  }

  .translation-character {
    width: clamp(2em, calc(2em + 0.4vw), 3em);
    height: clamp(2em, calc(2em + 0.4vw), 3em);
    line-height: clamp(2em, calc(2em + 0.4vw), 3em);
    font-size: clamp(1.5em, calc(1.5em + 0.4vw), 3em);
    margin: 3px;
  }

  .quiz-input {
    width: 65%;
    height: 2.5em;
    font-size: 1.25em;
  }

  .quiz-controls button {
    height: 2.5em;
    font-size: 1.25em;
  }

  .quiz-controls {
    width: 65%;
  }

  .quiz-summary-table {
    display: none;
  }
}

@media (orientation: landscape) and (min-height: 520px) and (max-height: 850px) {
  .source {
    font-size: clamp(2.5em, calc(2.5em + 0.8vw), 4em);
  }

  .key {
    font-size: clamp(1em, calc(1em + 1vw), 2.5em);
  }

  .translation-character {
    width: clamp(2.25em, calc(2.25em + 0.6vw), 3.5em);
    height: clamp(2.25em, calc(2.25em + 0.6vw), 3.5em);
    line-height: clamp(2.25em, calc(2.25em + 0.6vw), 3.5em);
    font-size: clamp(1.9em, calc(1.9em + 0.5vw), 3em);
  }
}

@media (orientation: portrait) and (max-width: 768px) {
  .quiz-container {
    padding: 1rem;
  }

  .source {
    font-size: clamp(1.1em, calc(1.1em + 0.9vw), 2.5em);
  }

  .key {
    font-size: clamp(0.5em, calc(0.5em + 1vw), 1.6em);
  }

  .translation-character {
    width: clamp(2em, calc(2em + 0.4vw), 3em);
    height: clamp(2em, calc(2em + 0.4vw), 3em);
    line-height: clamp(2em, calc(2em + 0.4vw), 3em);
    font-size: clamp(1.5em, calc(1.5em + 0.4vw), 3em);
    margin: 3px;
  }

  .quiz-controls button,
  .quiz-input {
    font-size: 1.25em;
  }

  .quiz-controls {
    margin-top: 1.5em !important;
  }

  .quiz-summary {
    font-size: smaller;
  }

  .quiz-summary button {
    font-size: 16px;
  }

  .nav-buttons {
    top: auto;
    bottom: 1rem;
    right: 1rem;
  }
}

@media (orientation: portrait) and (min-width: 768px) and (max-width: 1024px) {
  .quiz-container {
    padding: 1rem;
  }

  .source {
    font-size: clamp(2em, calc(2em + 1vw), 3em);
  }

  .key {
    font-size: clamp(0.8em, calc(0.8em + 1vw), 2.25em);
  }

  .translation-character {
    width: clamp(2em, calc(2em + 0.4vw), 3em);
    height: clamp(2em, calc(2em + 0.4vw), 3em);
    line-height: clamp(2em, calc(2em + 0.4vw), 3em);
    font-size: clamp(1.75em, calc(1.75em + 0.4vw), 3em);
    margin: 3px;
  }

  .quiz-controls button,
  .quiz-input {
    font-size: 1.75em;
  }
}

@media (orientation: portrait) and (min-width: 1024px) {
  .quiz-container {
    padding: 1rem;
  }

  .source {
    font-size: clamp(2.5em, calc(2.5em + 1vw), 4em);
  }

  .key {
    font-size: clamp(1em, calc(1em + 1vw), 2.5em);
  }

  .translation-character {
    width: clamp(2.5em, calc(2.5em + 0.6vw), 3em);
    height: clamp(2.5em, calc(2.5em + 0.6vw), 3em);
    line-height: clamp(2.5em, calc(2.5em + 0.6vw), 3em);
    font-size: clamp(1.75em, calc(1.75em + 0.6vw), 3em);
    margin: 3px;
  }

  .quiz-controls button,
  .quiz-input {
    font-size: 2em;
  }
}

@media (orientation: portrait) {
  .quiz-container {
    padding: 1rem;
  }

  .quiz-controls {
    margin-top: 2em;
    width: 80%;
    height: 2.5em;
  }

  .quiz-input {
    width: 80%;
  }

  .quiz-controls button {
    height: 2.5em;
  }

  .zh-cn.title {
    font-size: 2em;
  }

  .quiz-summary {
    width: auto;
    padding: 20px 20px;
  }

  .translation-character {
    width: 4rem;
    height: 4rem;
    line-height: 4rem;
    font-size: 2em;
    margin: 3px;
  }

  .quiz-input {
    width: 90%;
    font-size: 1.5em;
  }

  .quiz-controls {
    width: 90%;
  }

  .quiz-controls button {
    font-size: 1.5em;
  }

  .source {
    font-size: 2em;
  }

  .key {
    font-size: 1.2em;
  }
}
</style>
