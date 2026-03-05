import React from 'react'

import { cn } from '../../lib/utils'

export function Badge({ className = '', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 text-[12px] font-medium text-zinc-600 dark:text-zinc-300',
        className
      )}
      {...props}
    />
  )
}
