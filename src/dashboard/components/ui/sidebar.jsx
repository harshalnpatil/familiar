import React from 'react'

import { cn } from '../../lib/utils'
import dashboardShellTheme from '../dashboard/dashboardShellTheme.cjs'

const {
  dashboardSidebarClassName,
  dashboardSidebarMenuButtonClassName
} = dashboardShellTheme

export function Sidebar({ className = '', ...props }) {
  return (
    <aside
      className={cn(
        dashboardSidebarClassName,
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
        dashboardSidebarMenuButtonClassName,
        className
      )}
      {...props}
    />
  )
}
