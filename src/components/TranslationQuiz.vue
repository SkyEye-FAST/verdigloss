<template>
  <div class="translation-quiz">
    <Nav :is-dark-mode="isDarkMode" @toggle-dark-mode="toggleDarkMode" />
    <div class="quiz-container">
      <div class="quiz-title" :lang="currentLang">{{ $t('quiz.title') }}</div>
      <button class="quiz-btn-primary" @click="startRandomQuiz">
        {{ $t('quiz.random_quiz') }}
      </button>
      <div class="quiz-select-group">
        <label for="query-lang">{{ $t('quiz.language') }}</label>
        <select v-model="queryLang" id="query-lang">
          <option value="zh_cn" lang="zh-Hans-CN">简体中文 (中国大陆)</option>
          <option value="zh_hk" lang="zh-Hant-HK">
            繁體中文 (香港特別行政區)
          </option>
          <option value="zh_tw" lang="zh-Hant-TW">繁體中文 (台灣)</option>
          <option value="lzh" lang="lzh">文言 (華夏)</option>
        </select>
      </div>
      <div class="quiz-input-group">
        <input
          v-model="inputCode"
          type="text"
          :placeholder="$t('quiz.code_placeholder')"
          @keyup.enter="startQuiz"
        />
        <button class="quiz-enter-button" @click="startQuiz">
          {{ $t('quiz.nav.enter') }}
        </button>
      </div>
      <div class="actions">
        <div class="buttons">
          <router-link to="/" class="button">
            <i-material-symbols-manage-search class="icon" />
            {{ $t('quiz.nav.query') }}
          </router-link>
          <router-link to="/table" class="button">
            <i-material-symbols-table class="icon" />
            {{ $t('quiz.nav.table') }}
          </router-link>
          <a
            href="https://github.com/SkyEye-FAST/verdigloss"
            class="button"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePreferredDark } from '@vueuse/core'
import { currentLocale } from '@/main'
import Nav from './PageNav.vue'
import idList from '@/assets/data/id.json'
import { useDarkMode } from '@/composables/useDarkMode'

const router = useRouter()
const preferredDark = usePreferredDark()
const currentLang = computed(() => currentLocale.value)

const queryLang = ref('zh_cn')
const inputCode = ref('')

const generateQuizCode = () => {
  const allKeys = Object.keys(idList)
  const shuffled = allKeys.sort(() => Math.random() - 0.5)
  const selectedKeys = shuffled.slice(0, 10)
  const sortedKeys = selectedKeys.sort((a, b) =>
    idList[a as keyof typeof idList].localeCompare(
      idList[b as keyof typeof idList],
    ),
  )
  return sortedKeys.join('')
}

const startRandomQuiz = () => {
  const quizCode = generateQuizCode()
  router.push(`/quiz/${quizCode}?l=${queryLang.value}`)
}

const startQuiz = () => {
  if (inputCode.value.trim() && inputCode.value.length === 30) {
    router.push(`/quiz/${inputCode.value}?l=${queryLang.value}`)
  }
}

const { isDarkMode, toggleDarkMode } = useDarkMode()

onMounted(() => {
  document.body.classList.toggle('dark-mode', isDarkMode.value)
})

watch(preferredDark, (newValue) => {
  if (localStorage.getItem('darkMode') === null) {
    isDarkMode.value = newValue
    document.body.classList.toggle('dark-mode', newValue)
  }
})
</script>

<style scoped>
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

a {
  font-size: x-large;
}

label {
  font-size: x-large;
  text-align: right;
}

.quiz-input-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  width: 100%;
}

.quiz-select-group {
  display: flex;
  align-items: center;
  flex-direction: row;
  padding-bottom: 20px;
  width: 100%;
}

select {
  margin-left: 5px;
}

select,
input[type='text'] {
  font-family: 'Fira Code', 'Source Code Pro', Consolas, Monaco, monospace;
  flex: 1;
  padding: 0.4em;
  font-size: x-large;
  background: white;
  border: 2px solid #5b9bd5;
  border-radius: 4px;
  transition: all 0.3s ease;
}

button {
  background-color: white;
  cursor: pointer;
  font-size: x-large;
  transition: all 0.3s ease;
  border: 2px solid #5b9bd5;
  border-radius: 4px;
}

button:hover {
  background-color: #5b9bd515;
}

select:hover,
input[type='text']:hover {
  border-color: #4a8ac4;
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

.quiz-title {
  font-weight: 900;
  text-align: center;
}

.quiz-title[lang='en'] {
  font-size: 2.25em;
  font-family: 'Noto Serif', 'Times New Roman', SimSun, Times, serif;
}

.quiz-title[lang='zh-CN'] {
  font-size: 2.75em;
  font-family:
    'Noto Serif SC', 'Source Han Serif SC', 'Source Han Serif CN', '思源宋体',
    'Times New Roman', SimSun, Times, serif;
}

.quiz-title[lang='zh-TW'] {
  font-size: 2.75em;
  font-family:
    'Noto Serif TC', 'Source Han Serif TC', 'Source Han Serif TW', '思源宋體',
    'Times New Roman', SimSun, Times, serif;
}

body.dark-mode {
  background-color: #121212;
}

body.dark-mode .quiz-container {
  background-color: #333;
  border-color: #555;
  color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

body.dark-mode select,
body.dark-mode input[type='text'] {
  background: #2a2a2a;
  color: #e0e0e0;
  border-color: #555;
}

body.dark-mode button {
  background-color: #2a2a2a;
  color: #e0e0e0;
  border-color: #555;
}

body.dark-mode .quiz-btn-primary {
  background-color: #4a4a4a;
}

body.dark-mode .quiz-btn-primary:hover {
  background-color: #555;
}

body.dark-mode button:hover {
  background-color: #3a3a3a;
}

.actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.button {
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

.button:hover {
  background: #4a8ac4;
}

.icon {
  font-size: 1.2rem;
  color: white;
  display: inline-block;
  vertical-align: middle;
}

body.dark-mode .button {
  background: #4a4a4a;
}

body.dark-mode .button:hover {
  background: #5a5a5a;
}

@media (orientation: portrait) {
  .quiz-container {
    padding: 2rem 1rem;
  }

  .quiz-input-group,
  .quiz-select-group {
    width: 95%;
  }

  select,
  input[type='text'],
  button {
    font-size: 1.2em;
    padding: 0.5em;
  }
}

@media (orientation: portrait) and (max-width: 760px) {
  a {
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
  label,
  select,
  .quiz-container input[type='text'] {
    font-size: 14px;
    padding: 7px;
  }

  .quiz-btn-primary,
  .quiz-select-group,
  .quiz-input-group {
    width: 90%;
  }
}
</style>
