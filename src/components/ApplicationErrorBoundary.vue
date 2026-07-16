<template>
  <slot v-if="!error" :key="revision" />
  <main v-else class="application-error" role="alert">
    <h1>{{ $t('error_boundary.title') }}</h1>
    <p>{{ $t('error_boundary.description') }}</p>
    <div>
      <button type="button" @click="retry">{{ $t('error_boundary.retry') }}</button>
      <router-link to="/">{{ $t('error_boundary.return_to_query') }}</router-link>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const error = ref<unknown>(null)
const revision = ref(0)

onErrorCaptured((cause) => {
  error.value = cause
  return false
})

function retry() {
  error.value = null
  revision.value += 1
}
</script>

<style scoped>
.application-error {
  width: min(100% - 2rem, 42rem);
  min-height: calc(100dvh - 64px);
  margin: 0 auto;
  display: grid;
  align-content: center;
  gap: 1rem;
  color: var(--text);
}
.application-error div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.application-error button,
.application-error a {
  min-height: var(--control-height);
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  text-decoration: none;
}
</style>
