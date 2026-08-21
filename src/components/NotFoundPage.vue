<template>
  <section
    class="grid min-h-[calc(100dvh-64px)] place-content-center gap-4 text-center"
    aria-labelledby="not-found-title"
  >
    <h1 id="not-found-title">{{ $t('not_found.heading') }}</h1>
    <p>{{ $t('not_found.description') }}</p>
    <router-link to="/">{{ $t('not_found.return_home') }}</router-link>
  </section>
</template>
