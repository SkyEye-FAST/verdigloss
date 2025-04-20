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
    <div class="container">
      <div id="info" v-show="!showSummary">
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
        <div id="boxes" :class="queryLang">
          <div
            v-for="(box, index) in boxes"
            :key="index"
            class="translation-character"
            :class="[queryLang.replace(/_/, '-'), box.class, { dark: isDarkMode }]"
          >
            {{ box.char }}
          </div>
        </div>
      </div>

      <input
        v-if="!showSummary"
        v-model="inputText"
        autocomplete="off"
        id="inputBox"
        type="text"
        :class="queryLang.replace(/_/, '-')"
        :placeholder="$t('quiz.answer_placeholder')"
        @input="onInput"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        ref="inputRef"
      />

      <div id="buttons" class="quiz-controls" v-if="!showSummary">
        <button v-if="canHint" @click="showHint">{{ $t('quiz.hint') }}</button>
        <button v-if="canSkip" @click="skipQuestion" :disabled="isLocked">
          {{ $t('quiz.skip') }}
        </button>
      </div>

      <div class="summary" v-if="showSummary">
        <div id="title" :class="queryLang.replace(/_/, '-')">
          {{ $t('quiz.complete') }}
        </div>
        <div id="level" class="key" v-if="queryLang === 'zh_cn'">
          <i-material-symbols-star style="font-size: smaller" />
          <span id="levelNum">{{ totalLevel.toFixed(2) }} /</span>
          <i-material-symbols-stars style="font-size: smaller" />
          <span id="score">{{ totalScore.toFixed(2) }} pts</span>
        </div>
        <table id="summaryTable">
          <thead>
            <tr>
              <th>{{ $t('quiz.source') }}</th>
              <th>{{ $t('quiz.translation') }}</th>
            </tr>
          </thead>
          <tbody id="summaryBody">
            <tr v-for="question in questions" :key="question.key">
              <td>{{ question.source }}</td>
              <td>
                <span
                  v-for="(char, i) in question.translationChars"
                  :key="i"
                  class="transl"
                  :class="[charStates[question.key]?.[i]?.replace('box', ''), { dark: isDarkMode }]"
                  >{{ char }}</span
                >
              </td>
            </tr>
          </tbody>
        </table>
        <div class="code-container">
          <div class="code">{{ quizCode }}</div>
          <span style="font-size: 1.2em">
            <i-material-symbols-content-copy v-if="!isCopied" class="btn" @click="copyCode" />
            <i-material-symbols-check v-else class="btn" />
            <i-material-symbols-share class="btn" v-if="canShare" @click="shareResult" />
          </span>
        </div>
        <div class="buttons">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getSegmentedText } from '@/utils/text'
import ratingData from '@/assets/data/rating.json'
import idList from '@/assets/data/id.json'
import enUS from '@#/en_us.json'
import zhCN from '@#/zh_cn.json'
import zhHK from '@#/zh_hk.json'
import zhTW from '@#/zh_tw.json'
import lzh from '@/assets/mc_lang/valid/lzh.json'
import { useDarkMode } from '@/composables/useDarkMode'

const { t } = useI18n()

interface Question {
  source: string
  key: string
  translation: string
  rating?: number
  translationChars?: string[]
}

interface Box {
  char: string
  class: string
  isHint?: boolean
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
const charStates = ref<Record<string, string[]>>({})

const onCompositionStart = () => {
  isComposing.value = true
}

const onCompositionEnd = () => {
  isComposing.value = false
  onInput()
}

const isTimerMode = computed(() => route.query.t === '1')
const remainingTime = ref(240)
let timerInterval: number | null = null

const progressWidth = computed(() => (remainingTime.value / 240) * 100)

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const startTimer = () => {
  if (isTimerMode.value) {
    timerInterval = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--
        timeScore.value = remainingTime.value * 0.5
      } else {
        clearInterval(timerInterval!)
        showSummary.value = true
      }
    }, 1000)
  }
}

const timeScore = ref(90)

const totalScore = ref(0)
const questionScore = ref(0)

const queryLang = computed(() => (route.query.l as string) || 'zh_cn')
const quizCode = computed(() => route.params.code as string)
const questions = ref<Question[]>([])
const currentQuestion = computed(() => questions.value[currentIndex.value])
const boxes = computed(() => getBoxes())
const canHint = computed(
  () =>
    !showSummary.value &&
    boxes.value.filter((b) => !b.class.includes('correct') && !b.class.includes('hinted')).length >
      1,
)
const canSkip = computed(() => !showSummary.value && !canHint.value)
const canShare = computed(() => !!navigator.share)

const fullStars = computed(() => Math.floor(currentQuestion.value?.rating || 0))
const hasHalfStar = computed(() => (currentQuestion.value?.rating || 0) % 1 > 0)
const totalLevel = computed(() => questions.value.reduce((sum, q) => sum + (q.rating || 0), 0))

const getBoxes = (): Box[] => {
  if (!currentQuestion.value) return []

  const input = getSegmentedText(inputText.value)
  const translation = getSegmentedText(currentQuestion.value.translation)

  return translation.map((char, i) => {
    const userChar = input[i] || ''
    const isHinted = charStates.value[currentQuestion.value.key]?.[i]?.includes('hinted')
    let boxClass = ''

    if (isHinted) {
      boxClass = 'hinted'
      if (userChar === char) {
        boxClass += ' correct'
      }
    } else if (!userChar) {
      boxClass = ''
    } else if (userChar === char) {
      boxClass = 'correct'
    } else if (translation.includes(userChar)) {
      boxClass = 'exist'
    }

    return {
      char: isHinted ? char : userChar || '',
      class: boxClass,
    }
  })
}

const onInput = () => {
  if (isComposing.value || isLocked.value) return

  const translation = currentQuestion.value.translation
  inputText.value = getSegmentedText(inputText.value)
    .slice(0, getSegmentedText(translation).length)
    .join('')

  if (inputText.value === translation) {
    handleCorrectAnswer()
  }
}

const handleCorrectAnswer = async () => {
  isLocked.value = true
  if (!charStates.value[currentQuestion.value.key]) {
    charStates.value[currentQuestion.value.key] = []
  }
  boxes.value.forEach((box, index) => {
    charStates.value[currentQuestion.value.key][index] = box.class
  })

  totalScore.value += questionScore.value

  await new Promise((resolve) => setTimeout(resolve, 800))

  if (currentIndex.value >= questions.value.length - 1) {
    if (timerInterval) {
      clearInterval(timerInterval)
    }
    showSummary.value = true
  } else {
    currentIndex.value++
    inputText.value = ''
    questionScore.value = 10
  }

  isLocked.value = false
}

const showHint = () => {
  if (isLocked.value) return

  const translation = getSegmentedText(currentQuestion.value.translation)
  const currentBoxes = boxes.value

  const hintIndex = currentBoxes.findIndex(
    (b) => !b.class.includes('correct') && !b.class.includes('hinted'),
  )

  if (hintIndex !== -1) {
    if (!charStates.value[currentQuestion.value.key]) {
      charStates.value[currentQuestion.value.key] = []
    }
    charStates.value[currentQuestion.value.key][hintIndex] = 'hinted'

    const hintCount = charStates.value[currentQuestion.value.key].filter((state) =>
      state?.includes('hinted'),
    ).length
    questionScore.value = Math.max(0, 10 * (1 - hintCount / translation.length))
  }
}

const skipQuestion = async () => {
  if (isLocked.value) return
  isLocked.value = true

  if (currentIndex.value >= questions.value.length - 1) {
    showSummary.value = true
  } else {
    currentIndex.value++
    inputText.value = ''
    questionScore.value = 10
  }

  isLocked.value = false
}

const copyCode = async () => {
  await navigator.clipboard.writeText(quizCode.value)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

const shareResult = () => {
  if (canShare.value) {
    navigator.share({
      title: t('quiz.title'),
      text: t('quiz.description'),
      url: window.location.href,
    })
  }
}

const restartQuiz = () => {
  const selectedLang = queryLang.value
  const langFile = langFiles[selectedLang]
  const allKeys = Object.keys(idList).filter(
    (key) => enUS[key as keyof typeof enUS] !== langFile[key as keyof typeof langFile],
  )
  const shuffled = allKeys.sort(() => Math.random() - 0.5)
  const selectedKeys = shuffled.slice(0, 10)
  const sortedKeys = selectedKeys.sort((a, b) =>
    idList[a as keyof typeof idList].localeCompare(idList[b as keyof typeof idList]),
  )
  const keys = sortedKeys.join('')
  router.push(`/quiz/${keys}?l=${queryLang.value}`)
}

const returnToPortal = () => {
  router.push('/quiz')
}

const langFiles: Record<string, Record<string, string>> = {
  zh_cn: zhCN,
  zh_hk: zhHK,
  zh_tw: zhTW,
  lzh: lzh,
}

const loadQuestions = () => {
  if (!quizCode.value || quizCode.value.length !== 30) {
    router.push('/quiz')
    return
  }

  const codeSegments = quizCode.value.match(/.{3}/g) || []
  if (!codeSegments.every((seg) => Object.keys(idList).includes(seg))) {
    router.push('/quiz')
    return
  }

  const selectedKeys = codeSegments.map((seg) => idList[seg as keyof typeof idList]).sort()
  const selectedLang = queryLang.value
  const langFile = langFiles[selectedLang]

  questions.value = selectedKeys
    .map((key) => ({
      source: enUS[key as keyof typeof enUS],
      key: key,
      translation: langFile[key as keyof typeof langFile],
      rating:
        selectedLang === 'zh_cn' ? ratingData[key as keyof typeof ratingData] || 0 : undefined,
      translationChars: getSegmentedText(langFile[key as keyof typeof langFile]),
    }))
    .filter((question) => question.source !== question.translation)
}

onMounted(async () => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode')
    isDarkMode.value = true
  }
  loadQuestions()
  startTimer()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
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

body.dark-mode .progress-bar {
  background-color: #333;
}

body.dark-mode .progress-fill {
  background-color: #64b5f6;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  flex-direction: column;
  padding: 2rem;
  box-sizing: border-box;
}

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

.translation-character.hinted.correct {
  color: #000;
  background-color: #64b5f6;
}

.translation-character.exist {
  color: #000;
  background-color: #ffd600;
}

.translation-character.dark {
  color: #e0e0e0;
  background-color: #9ca3af25;
}

.translation-character.correct.dark {
  color: #e0e0e0;
  background-color: #43a047;
}

.translation-character.exist.dark {
  color: #e0e0e0;
  background-color: #afb42b;
}

.translation-character.hinted.dark {
  color: #e0e0e0;
  background-color: #d32f2f;
}

.translation-character.hinted.correct.dark {
  color: #e0e0e0;
  background-color: #0288d1;
}

#buttons button,
input[type='text'] {
  font-size: 1.75em;
  text-align: center;
  border: 2px solid;
  border-radius: 8px;
  box-sizing: border-box;
  background-color: transparent;
  color: #000;
}

input[type='text'] {
  margin-top: 20px;
  height: 3em;
  width: 50%;
  border-color: #50535a1a;
}

#inputBox {
  border-color: #50535a1a;
}

body.dark-mode #inputBox {
  border-color: #e0e0e01a;
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

.info {
  margin-bottom: 20px;
}

.source {
  font-family: 'Noto Serif', 'Times New Roman', SimSun, Times, serif;
  font-size: clamp(2.5em, calc(3em + 1vw), 4em);
  font-weight: 600;
  text-align: center;
}

.key {
  font-family: 'Fira Code', 'Source Code Pro', Consolas, Monaco, monospace;
  font-size: clamp(1.5em, calc(1.5em + 0.6vw), 3em);
  text-align: center;
  padding-top: 10px;
}

.rating span {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

#title {
  font-size: 2.8em;
  font-weight: 900;
}

.summary {
  text-align: center;
  background-color: white;
  padding: 20px 30px;
  width: max-content;
  border-radius: 8px;
}

.buttons {
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

body.dark-mode .button {
  background: #4a4a4a !important;
}

body.dark-mode .button:hover {
  background: #5a5a5a !important;
}

.code-container {
  margin: 0 auto;
  padding: 15px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.code {
  padding: 0 5px;
  font-size: 16px;
  font-family: 'Fira Code', 'Source Code Pro', Consolas, Monaco, monospace;
}

#level {
  padding: 0;
  font-size: 1.5em;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

#level i {
  display: flex;
  align-items: center;
}

#levelNum,
#score {
  margin: 0 10px;
}

.transl {
  color: #000;
}

.transl.correct {
  background-color: #85df4c;
}

.transl.exist {
  background-color: #f3d837;
}

.transl.hinted {
  background-color: #ff6d55;
}

.transl.hinted.correct {
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

.transl.hinted.correct.dark {
  color: #5ab0f3;
  background-color: transparent;
}

.transl.exist.dark {
  color: #f3d837;
  background-color: transparent;
}

table {
  margin: 10px auto 0 auto;
  border-collapse: collapse;
  font-size: larger;
}

table td,
table th {
  border: 2px solid #5b9bd5;
  padding: 5px;
}

table tr:nth-child(odd) {
  background-color: #2e4e6c0f;
}

table tr:nth-child(even) {
  background-color: #5b9bd533;
}

table thead {
  font-size: larger;
}

table tr td:nth-child(1) {
  font-family: 'Noto Serif', 'Times New Roman', Simsun, Times, serif;
}

table thead,
table tr td:nth-child(2) {
  font-family:
    'Noto Serif SC', 'Source Han Serif SC', 'Source Han Serif CN', '思源宋体', 'Times New Roman',
    SimSun, Times, serif;
}

body.dark-mode .summary {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

body.dark-mode #buttons button,
body.dark-mode input[type='text'] {
  color: #e0e0e0;
  border-color: #505050;
}

body.dark-mode table td,
body.dark-mode table th {
  border-color: #505050;
}

body.dark-mode table tr:nth-child(odd) {
  background-color: #2a2a2a;
}

body.dark-mode table tr:nth-child(even) {
  background-color: #333333;
}

body.dark-mode .code {
  background-color: #2a2a2a;
  color: #e0e0e0;
}

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

body.dark-mode .nav-button {
  background: #333 !important;
  color: #e0e0e0;
}

.timer {
  font-family: 'Fira Code', monospace;
  font-size: 2em;
  font-weight: bold;
  color: #5b9bd5;
  margin-bottom: 10px;
}

body.dark-mode .timer {
  color: #64b5f6;
}

@media (orientation: landscape) and (max-height: 520px) {
  .container {
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

  input[type='text'] {
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

  #summaryTable {
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
  .container {
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
  input[type='text'] {
    font-size: 1.25em;
  }

  .quiz-controls {
    margin-top: 1.5em !important;
  }

  .summary {
    font-size: smaller;
  }

  .summary button {
    font-size: 16px;
  }

  .nav-buttons {
    top: auto;
    bottom: 1rem;
    right: 1rem;
  }
}

@media (orientation: portrait) and (min-width: 768px) and (max-width: 1024px) {
  .container {
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
  input[type='text'] {
    font-size: 1.75em;
  }
}

@media (orientation: portrait) and (min-width: 1024px) {
  .container {
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
  input[type='text'] {
    font-size: 2em;
  }
}

@media (orientation: portrait) {
  .container {
    padding: 1rem;
  }

  .quiz-controls {
    margin-top: 2em;
    width: 80%;
    height: 2.5em;
  }

  input[type='text'] {
    width: 80%;
  }

  .quiz-controls button {
    height: 2.5em;
  }

  .zh-cn.title {
    font-size: 2em;
  }

  .summary {
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

  input[type='text'] {
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
