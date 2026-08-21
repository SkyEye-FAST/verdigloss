<template>
  <img :src="src" width="16" height="16" :alt="alt" style="image-rendering: pixelated" />
</template>

<script setup lang="ts">
defineProps<{ src: string; alt: string }>()
</script>
