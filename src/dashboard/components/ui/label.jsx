import React from 'react'

import { cn } from '../../lib/utils'

export function Label({ className = '', ...props }) {
  return (
    <label
      className={cn('block text-zinc-500 dark:text-zinc-400', className)}
      {...props}
    />
  )
}
