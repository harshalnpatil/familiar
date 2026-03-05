import React, { createContext, useContext, useMemo, useState } from 'react'

import { cn } from '../../lib/utils'

const AccordionContext = createContext(null)
const AccordionItemContext = createContext(null)

export function Accordion({
  type = 'single',
  collapsible = false,
  value,
  defaultValue,
  onValueChange,
  className = '',
  children,
  ...props
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || null)
  const resolvedValue = value !== undefined ? value : internalValue
  const handleValueChange = (nextValue) => {
    if (value === undefined) {
      setInternalValue(nextValue)
    }
    if (typeof onValueChange === 'function') {
      onValueChange(nextValue)
    }
  }
  const contextValue = useMemo(
    () => ({
      type,
      collapsible,
      value: resolvedValue,
      onValueChange: handleValueChange
    }),
    [type, collapsible, resolvedValue]
  )

  return (
    <div className={cn('space-y-2', className)} {...props}>
      <AccordionContext.Provider value={contextValue}>{children}</AccordionContext.Provider>
    </div>
  )
}

export function AccordionItem({ value, className = '', children, ...props }) {
  const contextValue = useMemo(() => ({ value }), [value])
  return (
    <AccordionItemContext.Provider value={contextValue}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

export function AccordionTrigger({ className = '', children, ...props }) {
  const accordion = useContext(AccordionContext)
  const item = useContext(AccordionItemContext)
  if (!accordion || !item) {
    return null
  }
  const isOpen = accordion.value === item.value
  const toggle = () => {
    if (accordion.type !== 'single') {
      return
    }
    if (isOpen) {
      if (accordion.collapsible) {
        accordion.onValueChange(null)
      }
      return
    }
    accordion.onValueChange(item.value)
  }

  return (
    <button
      type="button"
      data-state={isOpen ? 'open' : 'closed'}
      aria-expanded={isOpen}
      onClick={toggle}
      className={cn(
        'flex w-full items-center justify-between gap-2 text-left',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <svg
        viewBox="0 0 24 24"
        data-state={isOpen ? 'open' : 'closed'}
        className="h-4 w-4 text-zinc-400 transition-transform data-[state=open]:rotate-180"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  )
}

export function AccordionContent({ className = '', children, ...props }) {
  const accordion = useContext(AccordionContext)
  const item = useContext(AccordionItemContext)
  if (!accordion || !item) {
    return null
  }
  const isOpen = accordion.value === item.value
  return (
    <div
      data-state={isOpen ? 'open' : 'closed'}
      className={cn(isOpen ? 'mt-2' : 'hidden', className)}
      {...props}
    >
      {children}
    </div>
  )
}
