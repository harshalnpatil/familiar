import React from 'react'

import { cn } from '../../lib/utils'

const buttonVariants = {
  default: 'bg-indigo-600 text-white hover:bg-indigo-700',
  destructive:
    'border border-red-300 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20',
  outline:
    'border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700',
  ghost: 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700',
  link: 'text-indigo-600 dark:text-indigo-300 underline-offset-4 hover:underline',
  secondary:
    'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700'
}

const buttonSizes = {
  default: 'h-9 px-3 py-2 text-[14px]',
  sm: 'h-9 px-2.5 py-2 text-[14px]',
  lg: 'h-9 px-4 py-2 text-[14px]',
  icon: 'h-8 w-8'
}

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  disabled = false,
  children,
  ...props
}) {
  const resolvedVariant = buttonVariants[variant] || buttonVariants.default
  const resolvedSize = buttonSizes[size] || buttonSizes.default
  return (
    <button
      type={props.type || 'button'}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/30 focus-visible:ring-offset-2',
        'border',
        resolvedVariant,
        resolvedSize,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
