import { LoaderCircle } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean
  children: ReactNode
}

function ButtonContent({ isSubmitting, children }: Pick<AppButtonProps, 'isSubmitting' | 'children'>) {
  return (
    <>
      {isSubmitting && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
      <span className="inline-flex min-w-0 flex-row items-center justify-center gap-2 whitespace-nowrap">{children}</span>
    </>
  )
}

export const PrimaryButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ isSubmitting = false, disabled, className = '', children, ...props }, ref) => (
    <button
      {...props}
      ref={ref}
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting || undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-nasa-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-deep-space disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 ${className}`}
    >
      <ButtonContent isSubmitting={isSubmitting}>{children}</ButtonContent>
    </button>
  ),
)

PrimaryButton.displayName = 'PrimaryButton'

export const SecondaryButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ isSubmitting = false, disabled, className = '', children, ...props }, ref) => (
    <button
      {...props}
      ref={ref}
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting || undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-line bg-card px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-nasa-blue hover:text-nasa-blue disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
    >
      <ButtonContent isSubmitting={isSubmitting}>{children}</ButtonContent>
    </button>
  ),
)

SecondaryButton.displayName = 'SecondaryButton'
