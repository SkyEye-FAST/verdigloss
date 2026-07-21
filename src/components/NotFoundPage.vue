<template>
  <main class="grid min-h-screen place-content-center gap-4 text-center">
    <h1>404</h1>
    <p>{{ $t('not_found.description') }}</p>
    <router-link to="/">{{ $t('not_found.return_home') }}</router-link>
  </main>
</template>
