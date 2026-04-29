'use client'

import { useEffect, useState } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  function toggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  return { isFullscreen, toggle }
}
