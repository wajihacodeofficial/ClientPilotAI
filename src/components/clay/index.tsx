import { motion, type HTMLMotionProps } from 'framer-motion'
import type * as React from 'react'
import { cn } from '@/lib/utils'

const popTransition = { type: 'spring' as const, stiffness: 360, damping: 22 }

export function ClayCard({ className, children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={popTransition}
      className={cn('clay-surface rounded-3xl clay-pop', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'soft' | 'ghost'
}

export function ClayButton({ className, variant = 'primary', children, ...props }: ClayButtonProps) {
  const variants = {
    primary: 'bg-[linear-gradient(145deg,var(--forest-700),var(--forest-900))] text-white',
    soft: 'bg-[linear-gradient(145deg,#fff,var(--forest-100))] text-[var(--forest-900)]',
    ghost: 'bg-transparent text-[var(--forest-700)]',
  }
  return (
    <motion.button
      whileTap={{ scale: 0.96, scaleY: 0.94 }}
      transition={popTransition}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold shadow-[var(--shadow-sm)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--clay-bg)] active:shadow-[var(--shadow-inset)] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export interface ClayBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'high' | 'medium' | 'low' | 'forest'
}

export function ClayBadge({ className, tone = 'forest', ...props }: ClayBadgeProps) {
  const tones = {
    high: 'bg-[var(--forest-100)] text-[var(--forest-700)]',
    medium: 'bg-[rgba(233,196,106,0.28)] text-[#9A6A17]',
    low: 'bg-[rgba(91,107,94,0.12)] text-[var(--clay-gray-text)]',
    forest: 'bg-[linear-gradient(145deg,var(--forest-100),#fff)] text-[var(--forest-700)]',
  }
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-[var(--shadow-sm)]', tones[tone], className)} {...props} />
}

export function ClayPod({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#fff,var(--forest-100))] text-[var(--forest-700)] shadow-[var(--shadow-sm)]', className)}
      {...props}
    >
      {children}
    </div>
  )
}
