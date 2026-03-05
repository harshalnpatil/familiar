import React from 'react'

import { cn } from '../../lib/utils'

export function Sidebar({ className = '', ...props }) {
  return (
    <aside
      className={cn(
        'w-[190px] h-full flex-none bg-zinc-50/90 dark:bg-zinc-900/60 border-r border-zinc-200 dark:border-zinc-800 flex flex-col',
        className
      )}
      {...props}
    />
  )
}

export function SidebarHeader({ className = '', ...props }) {
  return <div className={cn('px-4 pt-3 pb-4 flex items-center gap-2', className)} {...props} />
}

export function SidebarContent({ className = '', ...props }) {
  return <div className={cn('flex-1 min-h-0 px-2 overflow-y-auto', className)} {...props} />
}

export function SidebarFooter({ className = '', ...props }) {
  return <div className={cn('px-3 pb-3 mt-auto', className)} {...props} />
}

export function SidebarMenu({ className = '', ...props }) {
  return <div className={cn('space-y-1', className)} {...props} />
}

export function SidebarMenuItem({ className = '', ...props }) {
  return <div className={className} {...props} />
}

export function SidebarMenuButton({ isActive = false, className = '', ...props }) {
  return (
    <button
      data-active={isActive ? 'true' : 'false'}
      className={cn(
        'w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[14px] font-medium text-zinc-500 dark:text-zinc-400 transition-colors',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200',
        'data-[active=true]:bg-white data-[active=true]:text-zinc-900 data-[active=true]:border data-[active=true]:border-zinc-200/60 data-[active=true]:shadow-sm',
        'dark:data-[active=true]:bg-zinc-800 dark:data-[active=true]:text-zinc-100 dark:data-[active=true]:border-zinc-700/60',
        className
      )}
      {...props}
    />
  )
}
