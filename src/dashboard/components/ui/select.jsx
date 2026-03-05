import React from 'react'

import { cn } from '../../lib/utils'

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={cn(
        'w-full rounded-md border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-700',
        'px-2.5 py-2 text-[14px] text-zinc-900 dark:text-zinc-100',
        'focus:outline-none focus:ring-2 focus:ring-zinc-400/30 focus:border-indigo-400 dark:focus:border-indigo-500',
        'transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
