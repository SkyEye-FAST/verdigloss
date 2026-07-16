<template>
  <div class="sans" :class="currentLang.toLowerCase()">
    <Nav :is-dark-mode="isDarkMode" @toggle-dark-mode="toggleDarkMode" />
    <div class="quiz-container">
      <div class="quiz-title" :class="currentLang.toLowerCase()">{{ $t('quiz.title') }}</div>
      <button class="quiz-btn-primary" @click="startRandomQuiz">
        {{ $t('quiz.random_quiz') }}
      </button>
      <div class="quiz-select-group">
        <label for="query-lang">{{ $t('quiz.language') }}</label>
        <select :class="`${queryLang.replace('_', '-')} sans`" v-model="queryLang" id="query-lang">
          <option
            v-for="language in quizLanguages"
            :key="language.code"
            :value="language.code"
            :class="[language.typographyClass, 'sans']"
            :lang="language.htmlLang"
            :disabled="!language.available"
          >
            {{ language.nativeName }} ({{ language.eligibleCount }}/{{ quizQuestionCount }})
          </option>
        </select>
        <input type="checkbox" id="timer-mode" v-model="timerMode" class="timer-checkbox" />
        <label for="timer-mode" class="timer-label">{{ $t('quiz.timer_mode') }}</label>
      </div>
      <p v-if="quizError" role="alert" class="quiz-error">{{ quizError }}</p>
      <div class="quiz-input-group">
        <input
          v-model="inputCode"
          type="text"
          id="quiz-code"
          :placeholder="$t('quiz.code_placeholder')"
          @keyup.enter="startQuiz"
        />
        <button class="quiz-enter-button" @click="startQuiz">
          {{ $t('quiz.nav.enter') }}
        </button>
      </div>
      <div class="quiz-actions">
        <div class="quiz-actions-buttons">
          <router-link to="/" class="quiz-actions-button">
            <i-material-symbols-manage-search class="icon" />
            {{ $t('quiz.nav.query') }}
          </router-link>
          <router-link to="/table" class="quiz-actions-button">
            <i-material-symbols-table class="icon" />
            {{ $t('quiz.nav.table') }}
          </router-link>
          <a
            href="https://github.com/SkyEye-FAST/verdigloss"
            class="quiz-actions-button"
            target="_blank"
          >
            <i-fa6-brands-github class="icon" />
            GitHub
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { useRouter } from 'vue-router'

import quizIdData from '@/assets/data/quiz-id-map.json'
import legacyQuizIdMap from '@/assets/data/id.json'
import { useDarkMode } from '@/composables/useDarkMode'
import { QUIZ_QUESTION_COUNT, buildEligibleQuestionPool, getQuizLanguageAvailability } from '@/domain/quiz'
import { decodeQuizCode, encodeQuizCode } from '@/domain/quiz-code'
import { shuffle } from '@/domain/shuffle'
import { currentLocale } from '@/main'
import { languageFiles, languageRegistry, type LanguageCode } from '@/utils/languages'
import { hasStoredValue } from '@/utils/storage'
import { usePreferredDark } from '@vueuse/core'

import Nav from './PageNav.vue'

const router = useRouter()
const preferredDark = usePreferredDark()
const currentLang = computed(() => currentLocale.value)

const queryLang = ref<LanguageCode>('zh_cn')
const inputCode = ref('')
const timerMode = ref(false)
const quizError = ref('')
const quizQuestionCount = QUIZ_QUESTION_COUNT
const quizIdMap = quizIdData.ids

const quizLanguages = computed(() =>
  languageRegistry
    .filter((language) => language.quiz.enabled)
    .map((language) => ({
      ...language,
      ...getQuizLanguageAvailability(language.code, languageFiles, quizIdMap),
    })),
)

const generateQuizCode = () => {
  const eligible = buildEligibleQuestionPool(queryLang.value, languageFiles, quizIdMap)
  if (eligible.length < QUIZ_QUESTION_COUNT) {
    quizError.value = `This language needs at least ${QUIZ_QUESTION_COUNT} eligible questions; it has ${eligible.length}.`
    return undefined
  }
  return encodeQuizCode(
    shuffle(eligible.map((question) => question.key)).slice(0, QUIZ_QUESTION_COUNT),
    quizIdMap,
  )
}

const startRandomQuiz = () => {
  quizError.value = ''
  const result = generateQuizCode()
  if (!result) return
  if (!result.ok) {
    quizError.value = 'Unable to generate a quiz code because its question mapping is invalid.'
    return
  }
  router.push({ name: 'TranslationQuizSub', params: { code: result.value }, query: { l: queryLang.value, t: timerMode.value ? '1' : '0' } })
}

const startQuiz = () => {
  quizError.value = ''
  const code = inputCode.value.trim()
  const result = decodeQuizCode(code, quizIdMap, legacyQuizIdMap)
  if (!result.ok) {
    quizError.value = 'Enter a complete, supported quiz code.'
    return
  }
  router.push({ name: 'TranslationQuizSub', params: { code }, query: { l: queryLang.value, t: timerMode.value ? '1' : '0' } })
}

const { isDarkMode, toggleDarkMode } = useDarkMode()

onMounted(() => {
  document.body.classList.toggle('dark-mode', isDarkMode.value)
})

watch(preferredDark, (newValue) => {
  if (!hasStoredValue('darkMode')) {
    isDarkMode.value = newValue
    document.body.classList.toggle('dark-mode', newValue)
  }
})
</script>

<style scoped>
/* Base Layout & Container */
body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.quiz-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  background: white;
  padding: 2rem;
  width: 800px;
  border: 2px solid #5b9bd5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.quiz-container a {
  font-size: x-large;
}

.quiz-container label {
  font-size: x-large;
  text-align: right;
}

.quiz-error {
  color: #b42318;
  margin: 0 0 1rem;
}

/* Form Groups & Inputs */
.quiz-input-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  width: 100%;
}

.quiz-input-group input,
.quiz-input-group button {
  font-family: inherit;
}

.quiz-select-group {
  display: flex;
  align-items: center;
  flex-direction: row;
  padding-bottom: 20px;
  width: 100%;
}

.quiz-container select {
  margin-left: 5px;
}

.quiz-container select,
.quiz-container input[type='text'] {
  flex: 1;
  padding: 0.4em;
  font-size: x-large;
  background: white;
  border: 2px solid #5b9bd5;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.quiz-container select:hover,
.quiz-container input[type='text']:hover {
  border-color: #4a8ac4;
  background-color: #5b9bd515;
}

/* Buttons */
.quiz-container button {
  cursor: pointer;
  font-size: x-large;
  transition: all 0.3s ease;
  border: 2px solid #5b9bd5;
  border-radius: 4px;
}

.quiz-container button:hover {
  background-color: #5b9bd515;
}

.quiz-btn-primary {
  width: 100%;
  box-sizing: border-box;
  margin: 20px 0;
  padding: 0.5em;
  background-color: #5b9bd5;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  font-family: inherit;
}

.quiz-enter-button {
  margin-left: 10px;
  padding: 0.5em 25px;
  background-color: #5b9bd5;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 4px;
}

.quiz-btn-primary:hover,
.quiz-enter-button:hover {
  background-color: #4a8ac4;
}

.quiz-btn-secondary {
  margin-left: 10px;
  padding: 0.4em 30px;
}

/* Title & Typography */
.quiz-title {
  font-weight: 900;
  text-align: center;
  font-size: 2.25em;
}

.quiz-title.zh-cn,
.quiz-title.zh-tw {
  font-size: 2.75em;
}

/* Quiz Actions (Links/Buttons) */
.quiz-actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.quiz-actions-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.quiz-actions-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: #5b9bd5;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
  font-weight: 600;
}

.quiz-actions-button:hover {
  background: #4a8ac4;
}

.icon {
  font-size: 1.2rem;
  color: white;
  display: inline-block;
  vertical-align: middle;
}

/* Timer Checkbox & Label */
.timer-label {
  margin-left: 5px;
  white-space: nowrap;
}

.timer-checkbox {
  width: 20px;
  height: 20px;
  margin-left: 15px;
  cursor: pointer;
}

/* Dark Mode Styles */
body.dark-mode {
  background-color: #121212;
}

body.dark-mode .quiz-container {
  background-color: #333;
  border-color: #555;
  color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

body.dark-mode .quiz-container select,
body.dark-mode .quiz-container input[type='text'] {
  background: #2a2a2a;
  color: #e0e0e0;
  border-color: #555;
}

body.dark-mode .quiz-container button {
  background-color: #2a2a2a;
  color: #e0e0e0;
  border-color: #555;
}

body.dark-mode .quiz-container .quiz-btn-primary {
  background-color: #4a4a4a;
}

body.dark-mode .quiz-container .quiz-btn-primary:hover {
  background-color: #555;
}

body.dark-mode .quiz-container button:hover {
  background-color: #3a3a3a;
}

body.dark-mode .quiz-container .quiz-actions-button {
  background: #4a4a4a;
}

body.dark-mode .quiz-container .quiz-actions-button:hover {
  background: #5a5a5a;
}

/* Responsive Styles */
@media (orientation: portrait) {
  .quiz-container {
    padding: 2rem 1rem;
  }

  .quiz-input-group,
  .quiz-select-group {
    width: 95%;
  }

  .quiz-container select,
  .quiz-container input[type='text'],
  .quiz-container button {
    font-size: 1.2em;
    padding: 0.5em;
  }
}

@media (orientation: portrait) and (max-width: 760px) {
  .quiz-container a {
    font-size: initial;
  }

  .quiz-container {
    width: 95%;
    padding: 30px 0;
  }

  .quiz-title {
    font-size: 1.5em !important;
  }

  .quiz-btn-primary,
  .quiz-btn-secondary,
  .quiz-container label,
  .quiz-container select,
  .quiz-container input[type='text'] {
    font-size: 14px;
    padding: 7px;
  }

  .quiz-btn-primary,
  .quiz-select-group,
  .quiz-input-group {
    width: 90%;
  }

  .timer-label {
    margin-left: 10px;
    font-size: 14px;
  }

  .timer-checkbox {
    width: 16px;
    height: 16px;
  }
}
</style>
