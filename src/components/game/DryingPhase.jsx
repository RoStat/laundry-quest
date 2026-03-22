import { useState, useCallback, useRef, useEffect } from 'react'
import TimerBar from '../ui/TimerBar'
import { CLOTHES } from '../../data/clothes'
import {
  vibrate, vibrateSuccess, vibrateTap,
  useShakeDetection, useBlowDetection
} from '../../hooks/useDeviceInteractions'

export default function DryingPhase({ level, dispatch, toast, onComplete }) {
  const duration = 25 + level * 3
  const [running, setRunning] = useState(true)
  const [dryPercent, setDryPercent] = useState(0)
  const [items] = useState(() =>
    [...CLOTHES].sort(() => Math.random() - 0.5).slice(0, 6).map((c, i) => ({
      ...c, id: i, dryness: 0, position: 10 + (80 / 7) * (i + 0.5),
    }))
  )
  const [itemStates, setItemStates] = useState(items.map(() => ({ squeezed: 0, flipped: false })))
  const [micActive, setMicActive] = useState(false)
  const completedRef = useRef(false)

  const addDry = useCallback((amount) => {
    if (completedRef.current) return
    setDryPercent(prev => {
      const next = Math.min(100, prev + amount)
      dispatch({ type: 'SET_DRY_PERCENT', payload: next })
      if (next >= 100 && !completedRef.current) {
        completedRef.current = true
        dispatch({ type: 'ADD_SCORE', payload: 100 })
        toast('🎉 Tout est sec ! +100 pts', 'success')
        setRunning(false)
        setTimeout(onComplete, 1200)
      }
      return next
    })
  }, [dispatch, toast, onComplete])

  // Blow with microphone
  const handleBlow = useCallback((intensity) => {
    const amount = Math.floor(intensity / 15) + level
    addDry(amount)
    dispatch({ type: 'BLOW' })
    dispatch({ type: 'ADD_SCORE', payload: 10 })
    toast(`💨 Souffle ! +${amount}%`, 'info')
  }, [addDry, dispatch, toast, level])

  const { isListening, blowIntensity, startListening, stopListening } = useBlowDetection(handleBlow, micActive)

  // Shake to wring
  const handleShake = useCallback(() => {
    const amount = 2 + Math.floor(Math.random() * 4)
    addDry(amount)
    dispatch({ type: 'ADD_SCORE', payload: 8 })
    toast(`📳 Essorage ! +${amount}%`, 'success')
  }, [addDry, dispatch, toast])

  useShakeDetection(handleShake)

  // Manual blow button (fallback)
  const handleBlowBtn = () => {
    const amount = 3 + Math.floor(Math.random() * 6) + level
    addDry(amount)
    dispatch({ type: 'BLOW' })
    dispatch({ type: 'ADD_SCORE', payload: 10 })
    vibrate(30)
    toast(`💨 +${amount}% séchage`, 'info')
  }

  // Flip clothes
  const handleFlip = () => {
    const bonus = 2 + Math.floor(Math.random() * 4)
    addDry(bonus)
    dispatch({ type: 'FLIP' })
    dispatch({ type: 'ADD_SCORE', payload: 8 })
    vibrateTap()
    setItemStates(prev => prev.map(s => ({ ...s, flipped: !s.flipped })))
    toast(`🔄 Retourné ! +${bonus}%`, 'info')
  }

  // Squeeze individual item
  const handleSqueeze = (idx) => {
    setItemStates(prev => {
      const next = [...prev]
      if (next[idx].squeezed >= 3) return prev
      next[idx] = { ...next[idx], squeezed: next[idx].squeezed + 1 }
      return next
    })
    const bonus = 1 + Math.floor(Math.random() * 3)
    addDry(bonus)
    dispatch({ type: 'ADD_SCORE', payload: 5 })
    vibrateTap()
    toast(`🤏 Essoré ! +${bonus}%`, 'success')
  }

  const handleTimeUp = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setRunning(false)
    stopListening()
    toast('⏰ Séchage terminé !', 'warning')
    setTimeout(onComplete, 1000)
  }, [onComplete, toast, stopListening])

  // Toggle microphone
  const toggleMic = async () => {
    if (isListening) {
      stopListening()
      setMicActive(false)
    } else {
      setMicActive(true)
      await startListening()
    }
  }

  return (
    <div className="screen-enter">
      <div className="text-center mb-1">
        <h2 className="font-bangers text-2xl text-[var(--neon-blue)]">☀️ Phase 3 — Le Séchage</h2>
        <p className="text-xs text-white/40 mt-1">Souffle, secoue, ou tape pour sécher !</p>
      </div>

      <TimerBar duration={duration} running={running} onEnd={handleTimeUp} />

      {/* Clothesline */}
      <div className="glass p-5 mb-4 relative h-[200px] overflow-hidden">
        {/* Rope */}
        <div className="absolute top-[30px] left-[5%] right-[5%] h-[3px] bg-gray-500" />

        {/* Hanging items */}
        {items.map((item, i) => (
          <div
            key={item.id}
            className="absolute top-[33px] cursor-pointer transition-all active:scale-90"
            style={{
              left: `${item.position}%`,
              animation: 'swing 2s ease-in-out infinite',
              animationDelay: `${i * 0.3}s`,
              transform: itemStates[i]?.flipped ? 'scaleX(-1)' : 'none',
              filter: dryPercent > 70 ? 'brightness(1.2)' : 'none',
            }}
            onClick={() => handleSqueeze(i)}
          >
            <span className="text-4xl">{item.emoji}</span>
            {dryPercent < 60 && (
              <span className="absolute -bottom-2.5 left-1/2 text-[0.5rem]" style={{ animation: 'drip 1s ease-in infinite', animationDelay: `${i * 0.5}s` }}>
                💧
              </span>
            )}
            {itemStates[i]?.squeezed > 0 && (
              <span className="absolute -top-1 -right-1 font-pixel text-[0.4rem] text-[var(--neon-yellow)]">
                x{itemStates[i].squeezed}
              </span>
            )}
          </div>
        ))}

        {/* Wind effect overlay */}
        {blowIntensity > 30 && (
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: blowIntensity / 200 }}>
            <div className="absolute top-1/2 left-0 text-3xl" style={{ animation: 'conveyorMove 0.3s linear infinite' }}>
              💨💨💨💨💨
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 flex-wrap">
        <button
          onClick={handleBlowBtn}
          className="glass px-6 py-3 text-sm font-semibold cursor-pointer border-2 border-[var(--neon-blue)] text-[var(--neon-blue)] active:scale-95 transition-transform"
        >
          💨 Souffler
        </button>
        <button
          onClick={handleFlip}
          className="glass px-6 py-3 text-sm font-semibold cursor-pointer border-2 border-[var(--neon-yellow)] text-[var(--neon-yellow)] active:scale-95 transition-transform"
        >
          🔄 Retourner
        </button>
        <button
          onClick={toggleMic}
          className={`glass px-6 py-3 text-sm font-semibold cursor-pointer border-2 active:scale-95 transition-all
            ${isListening ? 'border-[var(--neon-green)] text-[var(--neon-green)] bg-[rgba(0,255,135,0.08)]' : 'border-[var(--neon-pink)] text-[var(--neon-pink)]'}
          `}
        >
          🎤 {isListening ? 'Micro ON' : 'Activer micro'}
        </button>
      </div>

      {/* Mic intensity indicator */}
      {isListening && (
        <div className="flex justify-center mt-2">
          <div className="flex gap-0.5 items-end h-6">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="w-2 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(4, (blowIntensity / 100) * (i + 1) * 10)}%`,
                  background: blowIntensity > 50 ? 'var(--neon-green)' : 'var(--neon-blue)',
                  opacity: i * 10 < blowIntensity ? 1 : 0.2,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dry progress */}
      <div className="mt-4 max-w-[300px] mx-auto">
        <div className="text-center text-xs text-white/40 mb-1">Séchage global</div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${dryPercent}%`,
              background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-yellow), var(--neon-orange))',
            }}
          />
        </div>
        <div className="text-center font-pixel text-xs text-[var(--neon-yellow)] mt-1">{dryPercent}%</div>
      </div>

      {/* Tips */}
      <div className="text-center mt-3 text-[0.65rem] text-white/25">
        📳 Secoue ton téléphone pour essorer · 🤏 Tape sur un vêtement pour l'essorer
      </div>
    </div>
  )
}
