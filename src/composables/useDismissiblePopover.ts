import { onMounted, onUnmounted, type Ref } from 'vue'

/** Closes an open popover when pointer or keyboard focus leaves its owning element. */
export function useDismissiblePopover(
  root: Ref<HTMLElement | null>,
  isOpen: Ref<boolean>,
  dismiss: () => void | Promise<void>,
) {
  let pointerStartedInside = false

  function handlePointerDown(event: PointerEvent) {
    pointerStartedInside = Boolean(root.value?.contains(event.target as Node))
    if (isOpen.value && root.value && !pointerStartedInside) void dismiss()
  }

  function handlePointerEnd() {
    pointerStartedInside = false
  }

  function handleFocusIn(event: FocusEvent) {
    // Clicking label text can focus a tabindex ancestor before its checkbox receives the click.
    if (pointerStartedInside) return
    if (isOpen.value && root.value && !root.value.contains(event.target as Node)) void dismiss()
  }

  onMounted(() => {
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('pointerup', handlePointerEnd)
    document.addEventListener('pointercancel', handlePointerEnd)
    document.addEventListener('focusin', handleFocusIn)
  })
  onUnmounted(() => {
    document.removeEventListener('pointerdown', handlePointerDown)
    document.removeEventListener('pointerup', handlePointerEnd)
    document.removeEventListener('pointercancel', handlePointerEnd)
    document.removeEventListener('focusin', handleFocusIn)
  })
}
