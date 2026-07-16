<template>
  <img
    :src="src"
    width="16"
    height="16"
    :alt="$t('table.colors.dye_icon')"
    style="image-rendering: pixelated"
  />
</template>

<script setup lang="ts">
defineProps<{ src: string }>()
</script>
