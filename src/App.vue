<template>
  <ApplicationShell />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ApplicationShell from './components/ApplicationShell.vue'

export default defineComponent({
  name: 'App',
  components: { ApplicationShell },
})
</script>
