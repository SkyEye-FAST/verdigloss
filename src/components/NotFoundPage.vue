<template>
  <main class="not-found">
    <h1>404</h1>
    <p>{{ $t('not_found.description') }}</p>
    <router-link to="/">{{ $t('not_found.return_home') }}</router-link>
  </main>
</template>
<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 1rem;
}
</style>
