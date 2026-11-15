import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from './Buttons'

interface ConfirmationModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isSubmitting?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isSubmitting = false,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const triggerElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    triggerElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    cancelButtonRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
      triggerElementRef.current?.focus()
      triggerElementRef.current = null
    }
  }, [isSubmitting, onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-deep-space/75"
        aria-label="Cerrar confirmación"
        onClick={isSubmitting ? undefined : onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
        className="relative w-full max-w-md rounded-card border border-line bg-card p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-control text-muted hover:bg-canvas hover:text-ink disabled:cursor-not-allowed"
          aria-label="Cerrar"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
        <h2 id="confirmation-title" className="pr-10 text-xl font-semibold text-ink">
          {title}
        </h2>
        <p id="confirmation-description" className="mt-3 text-sm leading-6 text-muted">
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <SecondaryButton ref={cancelButtonRef} type="button" onClick={onClose} disabled={isSubmitting}>
            {cancelLabel}
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onConfirm} isSubmitting={isSubmitting}>
            {confirmLabel}
          </PrimaryButton>
        </div>
      </section>
    </div>
  )
}
