import { cn } from '@/lib/utils'
import * as React from 'react'

// ============================================================
// Button
// ============================================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

const buttonVariants = {
  default: 'clay-btn-primary',
  outline: 'clay-raised text-(--text-primary) hover:bg-(--surface-raised)',
  ghost: 'bg-transparent text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--primary)',
  destructive: 'bg-(--danger) text-white clay-raised hover:bg-red-500',
  secondary: 'clay-inset text-(--text-primary)',
  link: 'underline-offset-4 hover:underline text-indigo-600 bg-transparent',
}

const buttonSizes = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-9 px-4 text-sm rounded-md',
  lg: 'h-10 px-6 text-sm rounded-md',
  icon: 'h-9 w-9 rounded-md',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

// ============================================================
// Badge
// ============================================================
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'muted'
}

const badgeVariants = {
  default: 'bg-(--primary-soft) text-(--primary)',
  outline: 'border border-(--text-secondary) text-(--text-secondary)',
  secondary: 'bg-(--surface-raised) text-(--text-secondary)',
  success: 'bg-(--success) text-white',
  warning: 'bg-(--warning) text-white',
  muted: 'bg-transparent text-(--text-muted)',
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
      badgeVariants[variant],
      className
    )}
    {...props}
  />
)

// ============================================================
// Card
// ============================================================
export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'clay-raised',
      className
    )}
    {...props}
  />
)

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 pb-3', className)} {...props} />
)

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-heading font-bold text-(--text-primary)', className)} {...props} />
)

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-(--text-secondary) mt-1', className)} {...props} />
)

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 pt-0', className)} {...props} />
)

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 pt-0 flex items-center', className)} {...props} />
)

// ============================================================
// Input
// ============================================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-11 w-full clay-inset px-4 py-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) transition-all disabled:opacity-50 border-none',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

// ============================================================
// Textarea
// ============================================================
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex w-full clay-inset px-4 py-3 text-sm text-(--text-primary) placeholder:text-(--text-muted) transition-all resize-none disabled:opacity-50 border-none',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

// ============================================================
// Select
// ============================================================
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-11 w-full clay-inset px-4 py-2 text-sm text-(--text-primary) transition-all disabled:opacity-50 cursor-pointer border-none',
      className
    )}
    {...props}
  />
))
Select.displayName = 'Select'

// ============================================================
// Progress
// ============================================================
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0-100
}

export const Progress = ({ value, className, ...props }: ProgressProps) => (
  <div
    className={cn('relative h-2.5 w-full overflow-hidden rounded-full clay-inset', className)}
    {...props}
  >
    <div
      className="h-full bg-(--primary) transition-all duration-500 ease-out"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
)

// ============================================================
// Skeleton
// ============================================================
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('clay-skeleton', className)} {...props} />
)

// ============================================================
// Separator
// ============================================================
export const Separator = ({ className, orientation = 'horizontal', ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: 'horizontal' | 'vertical' }) => (
  <div
    className={cn(
      'shrink-0 bg-(--primary-soft)',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className
    )}
    {...props}
  />
)

// ============================================================
// Avatar
// ============================================================
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
}

const avatarSizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-11 w-11 text-base' }

export const Avatar = ({ src, fallback, size = 'md', className, ...props }: AvatarProps) => (
  <div
    className={cn(
      'relative shrink-0 overflow-hidden rounded-full clay-raised flex items-center justify-center font-bold text-(--primary)',
      avatarSizes[size],
      className
    )}
    {...props}
  >
    {src ? (
      <img src={src} alt={fallback ?? ''} className="object-cover h-full w-full" />
    ) : (
      <span>{fallback ?? '?'}</span>
    )}
  </div>
)

// ============================================================
// Label
// ============================================================
export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn('text-[13px] font-bold text-(--text-secondary) block mb-1.5', className)}
    {...props}
  />
)

// ============================================================
// Sheet (slide-in panel)
// ============================================================
export interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  side?: 'right' | 'left'
  width?: string
}

export const Sheet = ({ open, onClose, children, side = 'right', width = 'w-[520px]' }: SheetProps) => {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          'fixed z-50 top-0 bottom-0 clay-floating shadow-2xl overflow-y-auto transition-transform duration-300 ease-out',
          width,
          side === 'right' ? 'right-4 top-4 bottom-4' : 'left-4 top-4 bottom-4',
          open
            ? 'translate-x-0'
            : side === 'right'
            ? 'translate-x-full'
            : '-translate-x-full'
        )}
      >
        {children}
      </div>
    </>
  )
}

// ============================================================
// Tabs
// ============================================================
export interface TabsProps {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export const Tabs = ({ tabs, active, onChange, className }: TabsProps) => (
  <div className={cn('flex border-b border-zinc-200 dark:border-zinc-800', className)}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 -mb-px',
          active === tab.id
            ? 'border-(--primary) text-(--primary)'
            : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
)

// ============================================================
// Tooltip (simple)
// ============================================================
export interface TooltipProps {
  content: string
  children: React.ReactNode
}

export const Tooltip = ({ content, children }: TooltipProps) => (
  <div className="relative group inline-flex">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
      {content}
    </div>
  </div>
)

// ============================================================
// Slider
// ============================================================
export interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (val: number) => void
  className?: string
}

export const Slider = ({ value, min, max, step = 1, onChange, className }: SliderProps) => (
  <div className={cn('flex items-center gap-3', className)}>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 appearance-none rounded-full bg-zinc-200 dark:bg-zinc-700 cursor-pointer accent-indigo-600"
    />
  </div>
)
