<template>
  <div class="nav-buttons">
    <router-link
      v-if="$route.path !== '/'"
      to="/"
      class="nav-button"
      :title="$t('query.nav.query')"
    >
      <i-material-symbols-manage-search style="font-size: 1.5em" />
    </router-link>
    <router-link
      v-if="$route.path !== '/quiz'"
      to="/quiz"
      class="nav-button"
      :title="$t('query.nav.quiz')"
    >
      <i-material-symbols-quiz style="font-size: 1.5em" />
    </router-link>
    <router-link to="/table" class="nav-button" :title="$t('query.nav.table')">
      <i-material-symbols-table-view-outline style="font-size: 1.5em" />
    </router-link>
    <a
      href="https://github.com/SkyEye-FAST/verdigloss"
      target="_blank"
      class="nav-button"
      :title="$t('query.nav.github')"
    >
      <i-fa6-brands-github style="font-size: 1.5em" />
    </a>
    <button class="nav-button" @click="toggleDarkMode" :title="$t('query.nav.dark_mode')">
      <i-material-symbols-dark-mode v-if="isDarkMode" style="font-size: 1.5em" />
      <i-material-symbols-light-mode v-else style="font-size: 1.5em" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isDarkMode: boolean
}

defineProps<Props>()
const emit = defineEmits(['toggleDarkMode'])

const toggleDarkMode = () => {
  emit('toggleDarkMode')
}
</script>

<style scoped>
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
  background: #fff;
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
  background: #333;
  color: #e0e0e0;
}

body.dark-mode .nav-button:hover {
  color: #7aa2ea;
}

@media (max-width: 768px) {
  .nav-buttons {
    top: auto;
    bottom: 1rem;
    right: 1rem;
  }
}

@media (max-height: 480px) and (orientation: landscape) {
  .nav-buttons {
    top: auto;
    bottom: 1rem;
    right: 1rem;
  }
}
</style>
