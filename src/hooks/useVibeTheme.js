import { useEffect, useState } from 'react'

const VIBES = ['light', 'dark', 'vaporwave', 'forest']
const STORAGE_KEY = 'vibe-kanban:theme'
const DEFAULT_VIBE = 'light'

/**
 * Custom hook to manage theme vibes across the application.
 *
 * @returns {{
 *   currentVibe: string,
 *   cycleVibe: () => void,
 *   setVibeByName: (vibe: string) => void
 * }}
 */
export function useVibeTheme() {
  const [currentVibe, setCurrentVibe] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored && VIBES.includes(stored) ? stored : DEFAULT_VIBE
    } catch {
      return DEFAULT_VIBE
    }
  })

  // Apply the theme class to document.documentElement whenever it changes
  useEffect(() => {
    const root = document.documentElement

    // Remove all vibe classes
    VIBES.forEach((vibe) => {
      root.classList.remove(vibe)
    })

    // Add the current vibe class
    root.classList.add(currentVibe)

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, currentVibe)
    } catch {
      // Storage unavailable or full
    }
  }, [currentVibe])

  /**
   * Cycle through vibes in order: light → dark → vaporwave → forest → light
   */
  function cycleVibe() {
    setCurrentVibe((prev) => {
      const currentIndex = VIBES.indexOf(prev)
      const nextIndex = (currentIndex + 1) % VIBES.length
      return VIBES[nextIndex]
    })
  }

  /**
   * Set a specific vibe by name
   * @param {string} vibe - Must be one of: 'light', 'dark', 'vaporwave', 'forest'
   */
  function setVibeByName(vibe) {
    if (VIBES.includes(vibe)) {
      setCurrentVibe(vibe)
    } else {
      console.warn(`Invalid vibe: "${vibe}". Must be one of: ${VIBES.join(', ')}`)
    }
  }

  return {
    currentVibe,
    cycleVibe,
    setVibeByName,
  }
}
