<template>
  <nav class="table-section-nav" :aria-label="$t('table.sections.label')">
    <router-link class="interactive-control" to="/table">{{
      $t('table.sections.standard')
    }}</router-link>
    <router-link class="interactive-control" to="/table/color">{{
      $t('table.sections.colors')
    }}</router-link>
  </nav>
</template>

<style scoped>
.table-section-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  width: min(calc(100% - 2rem), var(--content-max));
  margin: 0 auto var(--space-4);
}

.table-section-nav a {
  position: relative;
  min-height: 2.25rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  color: var(--text-secondary);
  font-weight: 700;
  text-decoration: none;
}
.table-section-nav a::after {
  position: absolute;
  right: 0.75rem;
  bottom: 0.25rem;
  left: 0.75rem;
  height: 2px;
  border-radius: 99px;
  background: var(--accent);
  content: '';
  opacity: 0;
  transform: scaleX(0.6);
  transition:
    opacity var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-standard);
}

.table-section-nav a.router-link-exact-active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
}
.table-section-nav a.router-link-exact-active::after {
  opacity: 1;
  transform: scaleX(1);
}

@media (max-width: 640px) {
  .table-section-nav {
    width: min(calc(100% - 1rem), var(--content-max));
  }
}
</style>
