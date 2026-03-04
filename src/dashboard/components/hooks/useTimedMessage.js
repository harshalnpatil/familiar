import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimedMessage(initialValue = '') {
  const [value, setValue] = useState(initialValue)
  const timeoutRef = useRef(null)

  const setMessage = useCallback((next) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setValue(next || '')
    if (next) {
      timeoutRef.current = setTimeout(() => {
        setValue('')
        timeoutRef.current = null
      }, 4500)
    }
  }, [])

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  return [value, setMessage]
}
