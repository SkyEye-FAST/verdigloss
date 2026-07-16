<template>
  <ApplicationErrorBoundary><ApplicationShell /></ApplicationErrorBoundary>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ApplicationShell from './components/ApplicationShell.vue'
import ApplicationErrorBoundary from './components/ApplicationErrorBoundary.vue'

export default defineComponent({
  name: 'App',
  components: { ApplicationErrorBoundary, ApplicationShell },
})
</script>
