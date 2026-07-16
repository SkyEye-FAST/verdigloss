<template>
  <span class="color-preview" :style="{ backgroundColor: color }" :aria-label="`Colour value ${color}`" role="img" :title="color"></span>
</template>

<script setup lang="ts">
defineProps<{ color: string }>()
</script>

<style scoped>
.color-preview {
  width: 16px;
  height: 16px;
  border: 1px solid var(--border-strong);
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
