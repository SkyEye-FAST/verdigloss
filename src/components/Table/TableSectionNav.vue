<template>
  <nav
    class="table-section-nav flex flex-wrap gap-[var(--space-2)] mx-auto mb-[var(--space-4)] [width:min(calc(100%-2rem),var(--content-max))] max-[640px]:[width:min(calc(100%-1rem),var(--content-max))]"
    :aria-label="$t('table.sections.label')"
  >
    <router-link
      class="interactive-control relative min-h-9 rounded-full border border-border-strong px-3 py-[0.45rem] font-bold text-content-secondary no-underline after:absolute after:right-3 after:bottom-1 after:left-3 after:h-0.5 after:rounded-full after:bg-accent after:content-[''] after:opacity-0 after:scale-x-[0.6] after:transition-[opacity,transform] after:duration-[var(--motion-fast)] after:ease-[var(--ease-standard)] [&.router-link-exact-active]:border-accent [&.router-link-exact-active]:bg-accent-soft [&.router-link-exact-active]:text-accent-strong [&.router-link-exact-active]:after:opacity-100 [&.router-link-exact-active]:after:scale-x-100"
      to="/table"
      >{{ $t('table.sections.standard') }}</router-link
    >
    <router-link
      class="interactive-control relative min-h-9 rounded-full border border-border-strong px-3 py-[0.45rem] font-bold text-content-secondary no-underline after:absolute after:right-3 after:bottom-1 after:left-3 after:h-0.5 after:rounded-full after:bg-accent after:content-[''] after:opacity-0 after:scale-x-[0.6] after:transition-[opacity,transform] after:duration-[var(--motion-fast)] after:ease-[var(--ease-standard)] [&.router-link-exact-active]:border-accent [&.router-link-exact-active]:bg-accent-soft [&.router-link-exact-active]:text-accent-strong [&.router-link-exact-active]:after:opacity-100 [&.router-link-exact-active]:after:scale-x-100"
      to="/table/color"
      >{{ $t('table.sections.colors') }}</router-link
    >
  </nav>
</template>
