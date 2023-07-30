import { useCallback, useContext, useLayoutEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'
import { type Theme } from '~/theme/Theme'

function getObjectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

type MediaQueryResult = {
  [key in keyof typeof Theme.media]: boolean
}
/**
 * Assumes theme.media entries are in the format: '@media <query>'
 * @returns {MediaQueryResult}
 */
export function useMediaQuery() {
  const theme = useContext(ThemeContext)

  const matchMediaQueries = useCallback(() => {
    return getObjectKeys(theme.media).reduce((acc, key) => {
      const mediaQuery = theme.media[key].split('@media ')[1]

      if (!mediaQuery)
        return {
          ...acc,
        }

      const matches = getMatches(mediaQuery)

      return { ...acc, [key]: matches }
    }, {} as MediaQueryResult)
  }, [theme.media])

  const [matches, setMatches] = useState<MediaQueryResult>(matchMediaQueries())

  function getMatches(query: string) {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  }

  useLayoutEffect(() => {
    const handleChange = () => {
      const queryResults = matchMediaQueries()
      setMatches(queryResults)
    }

    const windowBreakpoints = getObjectKeys(theme.media).map(key => {
      const mediaQuery = theme.media[key].split('@media ')[1]

      if (!mediaQuery) return window.matchMedia(theme.media[key])

      const windowBreakpoint = window.matchMedia(mediaQuery)

      return windowBreakpoint
    }, [])

    windowBreakpoints.forEach(match => {
      match.addEventListener('change', handleChange)
    })

    return () => {
      windowBreakpoints.forEach(match => {
        match.removeEventListener('change', handleChange)
      })
    }
  }, [matchMediaQueries, theme.media])

  return matches
}
