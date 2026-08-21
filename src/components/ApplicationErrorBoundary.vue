<template>
  <slot v-if="!error" :key="revision" />
  <main
    v-else
    class="grid min-h-[calc(100dvh-64px)] content-center gap-4 mx-auto w-[min(100%-2rem,42rem)] text-content"
    aria-labelledby="application-error-title"
  >
    <h1 id="application-error-title" ref="errorHeading" tabindex="-1">
      {{ $t('error_boundary.title') }}
    </h1>
    <p role="alert">{{ $t('error_boundary.description') }}</p>
    <div class="flex flex-wrap gap-3">
      <button
        class="min-h-[var(--control-height)] rounded-[var(--radius-sm)] border border-border-strong bg-surface px-[0.9rem] py-[0.65rem] text-content"
        type="button"
        @click="retry"
      >
        {{ $t('error_boundary.retry') }}
      </button>
      <router-link
        class="inline-flex min-h-[var(--control-height)] items-center rounded-[var(--radius-sm)] border border-border-strong bg-surface px-[0.9rem] py-[0.65rem] text-content no-underline"
        to="/"
        @click="retry"
        >{{ $t('error_boundary.return_to_query') }}</router-link
      >
    </div>
  </main>
</template>

<script setup lang="ts">
import { nextTick, onErrorCaptured, ref } from 'vue'

const error = ref<unknown>(null)
const errorHeading = ref<HTMLElement | null>(null)
const revision = ref(0)

onErrorCaptured((cause) => {
  error.value = cause
  void nextTick(() => errorHeading.value?.focus())
  return false
})

function retry() {
  error.value = null
  revision.value += 1
  void nextTick(() => document.getElementById('main-content')?.focus())
}
</script>
