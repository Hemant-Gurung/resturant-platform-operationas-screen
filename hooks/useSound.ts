'use client'

import { useCallback, useRef } from 'react'

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const play = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext()
    }
    const ctx = ctxRef.current

    const tone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + start)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration)
    }

    // Rising three-note chime
    tone(880, 0, 0.25)
    tone(1100, 0.2, 0.25)
    tone(1320, 0.4, 0.4)
  }, [])

  return { play }
}
