import { useState, useRef, useEffect, useCallback } from 'react'
import TimerBar from '../ui/TimerBar'
import { vibrate, vibrateSuccess, vibrateError, useSwipeDetection } from '../../hooks/useDeviceInteractions'

export default function IroningPhase({ level, dispatch, toast, onComplete }) {
  const duration = 20 + level * 2
  const [running, setRunning] = useState(true)
  const [hits, setHits] = useState(0)
  const total = 5
  const [cursorPos, setCursorPos] = useState(0)
  const [zone, setZone] = useState({ left: 30, width: 25 })
  const speed = useRef(2 + level * 0.5)
  const rafRef = useRef(null)
  const trackRef = useRef(null)
  const completedRef = useRef(false)
  const cursorPosRef = useRef(0)
  const hitsRef = useRef(0)

  // Place green zone randomly
  const placeZone = useCallback(() => {
    const w = Math.max(12, 25 - level * 2)
    const left = 5 + Math.random() * (90 - w)
    setZone({ left, width: w })
  }, [level])

  // Animate cursor
  useEffect(() => {
    if (!running) return

    let pos = 0
    let dir = 1

    const animate = () => {
      pos += dir * speed.current
      if (pos >= 100 || pos <= 0) dir *= -1
      cursorPosRef.current = pos
      setCursorPos(pos)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [running])

  useEffect(() => {
    placeZone()
  }, [placeZone])

  const handleClick = useCallback(() => {
    if (!running || completedRef.current) return

    const pos = cursorPosRef.current
    if (pos >= zone.left && pos <= zone.left + zone.width) {
      // HIT
      const newHits = hitsRef.current + 1
      hitsRef.current = newHits
      setHits(newHits)
      dispatch({ type: 'IRON_HIT' })
      dispatch({ type: 'ADD_SCORE', payload: 30 })
      dispatch({ type: 'INCREMENT_COMBO' })
      vibrateSuccess()
      toast(`🔥 Repassé ! +30`, 'success')

      if (newHits >= total) {
        completedRef.current = true
        setRunning(false)
        toast('👔 Repassage parfait !', 'success')
        setTimeout(onComplete, 1000)
        return
      }

      placeZone()
      speed.current += 0.4
    } else {
      // MISS
      dispatch({ type: 'ADD_SCORE', payload: -15 })
      dispatch({ type: 'RESET_COMBO' })
      vibrateError()
      toast('😬 Raté !', 'error')
    }
  }, [running, zone, dispatch, toast, placeZone, onComplete, total])

  // Swipe detection for mobile
  const handleSwipe = useCallback((direction) => {
    if (direction === 'left' || direction === 'right') {
      handleClick()
    }
  }, [handleClick])

  useSwipeDetection(trackRef, handleSwipe)

  const handleTimeUp = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setRunning(false)
    toast('⏰ Temps écoulé !', 'warning')
    setTimeout(onComplete, 1000)
  }, [onComplete, toast])

  return (
    <div className="screen-enter">
      <div className="text-center mb-1">
        <h2 className="font-bangers text-2xl text-[var(--neon-blue)]">🔥 Phase 5 — Repassage Express</h2>
        <p className="text-xs text-white/40 mt-1">Tape ou swipe quand le curseur est dans la zone verte !</p>
      </div>

      <TimerBar duration={duration} running={running} onEnd={handleTimeUp} />

      {/* Iron track */}
      <div className="glass p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl">👔</span>
          <span className="font-pixel text-sm text-[var(--neon-yellow)]">{hits} / {total}</span>
          <span className="text-4xl">✨</span>
        </div>

        <div
          ref={trackRef}
          onClick={handleClick}
          className="w-full max-w-[400px] h-[60px] bg-[var(--accent)] rounded-xl mx-auto relative overflow-hidden cursor-pointer active:brightness-110"
          style={{ touchAction: 'none' }}
        >
          {/* Green zone */}
          <div
            className="absolute top-0 h-full rounded-lg border-2 border-[var(--neon-green)] bg-[rgba(0,255,135,0.12)]"
            style={{ left: `${zone.left}%`, width: `${zone.width}%` }}
          />

          {/* Cursor */}
          <div
            className="absolute top-0 w-1 h-full rounded-full shadow-[0_0_10px_var(--neon-yellow)]"
            style={{
              left: `${cursorPos}%`,
              background: 'var(--neon-yellow)',
            }}
          />

          {/* Iron emoji following cursor */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-2xl pointer-events-none"
            style={{ left: `${cursorPos}%` }}
          >
            ♨️
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${i < hits ? 'bg-[var(--neon-green)] scale-110' : 'bg-white/10'}`}
            />
          ))}
        </div>

        <div className="text-[0.65rem] text-white/25 mt-3">
          📱 Swipe gauche/droite pour repasser sur mobile !
        </div>
      </div>
    </div>
  )
}
