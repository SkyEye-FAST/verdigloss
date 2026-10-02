<template>
  <label
    class="inline-flex min-h-[var(--control-height)] items-center gap-2 text-[0.9rem] text-content-secondary"
  >
    <input v-model="enabled" class="size-[1.1rem] shrink-0 accent-accent" type="checkbox" />
    <span>{{ $t('app.use_full_language_files') }}</span>
  </label>
</template>

<script setup lang="ts">
const enabled = defineModel<boolean>({ required: true })
</script>
