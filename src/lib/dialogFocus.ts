/** Keep keyboard focus within an open modal, including when its controls change. */
export function trapDialogFocus(event: KeyboardEvent, dialog: HTMLElement): void {
  if (event.key !== 'Tab') return
  const controls = [...dialog.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => element.tabIndex >= 0 && !element.closest('[hidden], [inert]'))
  const first = controls[0]
  const last = controls.at(-1)
  const active = dialog.ownerDocument.activeElement
  if (!first || !dialog.contains(active) || (event.shiftKey ? active === first : active === last)) {
    event.preventDefault()
    ;(event.shiftKey ? last : first)?.focus()
    if (!first) dialog.focus()
  }
}
