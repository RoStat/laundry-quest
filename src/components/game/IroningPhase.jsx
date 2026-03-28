import { useState, useRef, useEffect, useCallback } from 'react'
import TimerBar from '../ui/TimerBar'
import { vibrate, vibrateSuccess, vibrateError, useSwipeDetection } from '../../hooks/useDeviceInteractions'

const GARMENTS = [
  { emoji: '👔', name: 'Chemise' },
  { emoji: '👕', name: 'T-shirt' },
  { emoji: '👖', name: 'Pantalon' },
  { emoji: '👗', name: 'Robe' },
  { emoji: '🩳', name: 'Short' },
]

export default function IroningPhase({ level, dispatch, toast, onComplete }) {
  const duration = 25 + level * 2
  const [running, setRunning] = useState(true)
  const total = 5
  const [currentGarment, setCurrentGarment] = useState(0)
  const [garments] = useState(() =>
    [...GARMENTS].sort(() => Math.random() - 0.5).slice(0, total)
  )

  // Iron track state
  const [cursorPos, setCursorPos] = useState(0)
  const [zone, setZone] = useState({ left: 30, width: 25 })
  const speed = useRef(1.8 + level * 0.4)
  const rafRef = useRef(null)
  const trackRef = useRef(null)
  const completedRef = useRef(false)
  const cursorPosRef = useRef(0)

  // Wrinkle progress for current garment (0-100)
  const [ironProgress, setIronProgress] = useState(0)
  const hitsForGarment = useRef(0)
  const hitsNeeded = 3 // hits needed per garment

  // Place green zone randomly
  const placeZone = useCallback(() => {
    const w = Math.max(15, 28 - level * 2)
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
      // HIT — progress on current garment
      hitsForGarment.current += 1
      const progress = Math.min(100, Math.round((hitsForGarment.current / hitsNeeded) * 100))
      setIronProgress(progress)

      dispatch({ type: 'ADD_SCORE', payload: 20 })
      dispatch({ type: 'INCREMENT_COMBO' })
      vibrateSuccess()

      if (hitsForGarment.current >= hitsNeeded) {
        // Garment fully ironed
        dispatch({ type: 'IRON_HIT' })
        const nextGarment = currentGarment + 1
        toast(`✨ ${garments[currentGarment].name} repassé(e) !`, 'success')

        if (nextGarment >= total) {
          // All done!
          completedRef.current = true
          setRunning(false)
          toast('👔 Repassage parfait !', 'success')
          setTimeout(onComplete, 1000)
          return
        }

        // Next garment
        setTimeout(() => {
          setCurrentGarment(nextGarment)
          setIronProgress(0)
          hitsForGarment.current = 0
          placeZone()
          speed.current += 0.3
        }, 400)
      } else {
        placeZone()
        toast(`🔥 Bon coup ! ${hitsForGarment.current}/${hitsNeeded}`, 'info')
      }
    } else {
      // MISS
      dispatch({ type: 'ADD_SCORE', payload: -10 })
      dispatch({ type: 'RESET_COMBO' })
      vibrateError()
      toast('😬 Raté ! Vise la zone verte', 'error')
    }
  }, [running, zone, dispatch, toast, placeZone, onComplete, total, currentGarment, garments, hitsNeeded])

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

  const garment = garments[currentGarment] || garments[0]

  return (
    <div className="screen-enter phase-fill">
      <div className="text-center mb-1">
        <h2 className="font-bangers text-2xl text-[var(--neon-blue)]">🔥 Repassage Express</h2>
        <p className="text-xs text-white/40 mt-1">Tape quand le fer est dans la zone verte !</p>
      </div>

      <TimerBar duration={duration} running={running} onEnd={handleTimeUp} />

      {/* Garment progress dots */}
      <div className="flex justify-center gap-2 mb-3">
        {garments.map((g, i) => (
          <div
            key={i}
            className={`flex flex-col items-center transition-all duration-300
              ${i < currentGarment ? 'opacity-40 scale-90' : ''}
              ${i === currentGarment ? 'scale-110' : ''}
              ${i > currentGarment ? 'opacity-25' : ''}
            `}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                ${i < currentGarment ? 'bg-[rgba(0,255,135,0.15)] border-2 border-[var(--neon-green)]' : ''}
                ${i === currentGarment ? 'bg-[rgba(0,212,255,0.15)] border-2 border-[var(--neon-blue)] shadow-[0_0_10px_rgba(0,212,255,0.3)]' : ''}
                ${i > currentGarment ? 'bg-[var(--accent)] border border-white/10' : ''}
              `}
            >
              {i < currentGarment ? '✓' : g.emoji}
            </div>
          </div>
        ))}
      </div>

      {/* Current garment display with wrinkle indicator */}
      <div className="glass p-4 text-center flex-1 flex flex-col">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="relative">
            <span
              className="text-5xl block transition-all duration-500"
              style={{
                filter: `blur(${Math.max(0, (100 - ironProgress) / 40)}px)`,
                transform: `scaleY(${0.9 + ironProgress * 0.001})`,
              }}
            >
              {garment.emoji}
            </span>
            {/* Wrinkle lines that fade as you iron */}
            {ironProgress < 100 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: (100 - ironProgress) / 100 }}
              >
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-white/20 rounded-full"
                    style={{
                      width: '60%',
                      height: '2px',
                      top: `${25 + i * 25}%`,
                      left: '20%',
                      transform: `rotate(${-5 + i * 5}deg)`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-white/80">{garment.name}</p>
            <p className="text-xs text-white/40">{hitsForGarment.current}/{hitsNeeded} coups</p>
          </div>
        </div>

        {/* Iron progress bar for current garment */}
        <div className="w-full max-w-[300px] mx-auto mb-4">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${ironProgress}%`,
                background: ironProgress >= 100
                  ? 'var(--neon-green)'
                  : 'linear-gradient(90deg, var(--neon-orange), var(--neon-yellow))',
              }}
            />
          </div>
        </div>

        {/* THE IRON TRACK — main interaction */}
        <div
          ref={trackRef}
          onClick={handleClick}
          className="w-full h-[70px] bg-[var(--accent)] rounded-2xl mx-auto relative overflow-hidden cursor-pointer active:brightness-110 border-2 border-white/10"
          style={{ touchAction: 'none' }}
        >
          {/* Ironing board pattern */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full w-[1px] bg-white/20"
                style={{ left: `${i * 5}%` }}
              />
            ))}
          </div>

          {/* Green target zone */}
          <div
            className="absolute top-0 h-full rounded-xl border-2 border-[var(--neon-green)]"
            style={{
              left: `${zone.left}%`,
              width: `${zone.width}%`,
              background: 'rgba(0,255,135,0.12)',
              boxShadow: '0 0 15px rgba(0,255,135,0.15)',
            }}
          >
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[var(--neon-green)]/60 font-semibold">
              ICI
            </span>
          </div>

          {/* Cursor line */}
          <div
            className="absolute top-0 w-[3px] h-full rounded-full"
            style={{
              left: `${cursorPos}%`,
              background: 'var(--neon-yellow)',
              boxShadow: '0 0 12px var(--neon-yellow), 0 0 24px rgba(255,190,11,0.3)',
            }}
          />

          {/* Iron emoji following cursor */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-3xl pointer-events-none drop-shadow-lg"
            style={{ left: `${cursorPos}%` }}
          >
            ♨️
          </div>
        </div>

        <p className="text-[0.65rem] text-white/25 mt-3">
          📱 Tape ou swipe quand le fer ♨️ est dans la zone verte !
        </p>
      </div>
    </div>
  )
}
