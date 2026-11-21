import { useSearchParams } from 'react-router-dom'

/**
 * État gardé dans l'adresse (?type=..., ?onglet=...), pour qu'un lien ou une redirection
 * ouvre directement la bonne vue. La valeur par défaut n'apparaît pas dans l'adresse.
 */
export const useParamState = <T extends string>(name: string, fallback: T) => {
  const [params, setParams] = useSearchParams()
  const value = (params.get(name) as T | null) ?? fallback

  const setValue = (next: T) => {
    const nextParams = new URLSearchParams(params)
    if (next === fallback) nextParams.delete(name)
    else nextParams.set(name, next)
    setParams(nextParams, { replace: true })
  }

  return [value, setValue] as const
}
