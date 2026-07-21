<template>
  <span
    class="size-4 shrink-0 rounded-[2px] border border-border-strong"
    :style="{ backgroundColor: color }"
    :aria-label="$t('table.colors.color_value', { color })"
    role="img"
    :title="color"
  ></span>
</template>

<script setup lang="ts">
defineProps<{ color: string }>()
</script>
