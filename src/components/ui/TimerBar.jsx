import { useEffect, useState, useRef } from 'react'

export default function TimerBar({ duration, running, onEnd }) {
  const [pct, setPct] = useState(100)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!running) {
      setPct(100)
      return
    }
    startRef.current = Date.now()

    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000
      const remaining = Math.max(0, ((duration - elapsed) / duration) * 100)
      setPct(remaining)

      if (remaining <= 0) {
        onEnd?.()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [duration, running, onEnd])

  return (
    <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
      <div
        className="h-full rounded-full transition-none"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, var(--neon-green), var(--neon-yellow), var(--neon-orange), var(--neon-pink))`,
        }}
      />
    </div>
  )
}
