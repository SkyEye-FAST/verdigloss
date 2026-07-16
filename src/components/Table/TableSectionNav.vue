<template>
  <nav class="table-section-nav" :aria-label="$t('table.sections.label')">
    <router-link to="/table">{{ $t('table.sections.standard') }}</router-link>
    <router-link to="/table/color">{{ $t('table.sections.colors') }}</router-link>
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
  min-height: 2.25rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  color: var(--text-secondary);
  font-weight: 700;
  text-decoration: none;
}

.table-section-nav a.router-link-exact-active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
}

@media (max-width: 640px) {
  .table-section-nav {
    width: min(calc(100% - 1rem), var(--content-max));
  }
}
</style>
