<template>
  <div class="color-preview" :style="{ backgroundColor: color }"></div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{ color: string }>()
</script>

<style scoped>
.color-preview {
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
