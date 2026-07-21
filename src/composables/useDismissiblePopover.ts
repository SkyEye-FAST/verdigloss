import { onMounted, onUnmounted, type Ref } from 'vue'

/** Closes an open popover when a pointer lands outside its owning element. */
export function useDismissiblePopover(
  root: Ref<HTMLElement | null>,
  isOpen: Ref<boolean>,
  dismiss: () => void | Promise<void>,
) {
  function handlePointerDown(event: PointerEvent) {
    if (isOpen.value && root.value && !root.value.contains(event.target as Node)) void dismiss()
  }

  onMounted(() => document.addEventListener('pointerdown', handlePointerDown))
  onUnmounted(() => document.removeEventListener('pointerdown', handlePointerDown))
}
