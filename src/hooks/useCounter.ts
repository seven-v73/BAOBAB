import { useState } from 'react'

/**
 * Hook personnalisé pour gérer un compteur
 */
export const useCounter = (initialValue: number = 0) => {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount((prev) => prev + 1)
  const decrement = () => setCount((prev) => prev - 1)
  const reset = () => setCount(initialValue)

  return { count, increment, decrement, reset }
}

