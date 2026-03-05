import React from 'react'

import { cn } from '../../lib/utils'

export function ButtonGroup({ className = '', children, ...props }) {
  const items = React.Children.toArray(children)
  const isSoloGroup = items.length <= 1

  return (
    <div className={cn('inline-flex', className)} {...props}>
      {items.map((child, index) => {
        if (!React.isValidElement(child)) {
          return child
        }
        const isFirst = index === 0
        const isLast = index === items.length - 1
        const nextClassName = cn(
          isSoloGroup ? 'rounded-md' : 'rounded-none',
          !isSoloGroup && isFirst ? 'rounded-l-md' : '',
          !isSoloGroup && isLast ? 'rounded-r-md' : '',
          !isSoloGroup && !isFirst ? '-ml-px' : '',
          child.props.className || ''
        )
        return React.cloneElement(child, { className: nextClassName })
      })}
    </div>
  )
}
