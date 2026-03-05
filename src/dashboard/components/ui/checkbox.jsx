import React from 'react'

import { cn } from '../../lib/utils'

export function Checkbox({ className = '', ...props }) {
  return (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900',
        'accent-indigo-600 dark:accent-indigo-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40 focus-visible:ring-offset-1',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}
