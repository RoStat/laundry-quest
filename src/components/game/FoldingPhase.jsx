import { useState, useCallback, useRef, useEffect } from 'react'
import TimerBar from '../ui/TimerBar'
import { CLOTHES, FOLD_DIRS } from '../../data/clothes'
import { vibrate, vibrateSuccess, vibrateError, vibrateTap } from '../../hooks/useDeviceInteractions'

export default function FoldingPhase({ level, dispatch, toast, onComplete }) {
  const duration = 30 + level * 3
  const [running, setRunning] = useState(true)
  const [round, setRound] = useState(0)
  const maxRounds = 5
  const [sequence, setSequence] = useState([])
  const [playerSeq, setPlayerSeq] = useState([])
  // 'idle' | 'showing' | 'showingItem' | 'input' | 'feedback'
  const [phase, setPhase] = useState('idle')
  const [showIndex, setShowIndex] = useState(-1) // which arrow is currently highlighted during demo
  const [foldItems] = useState(() =>
    [...CLOTHES].sort(() => Math.random() - 0.5).slice(0, 5)
  )
  const showTimerRef = useRef(null)
  const completedRef = useRef(false)

  useEffect(() => {
    dispatch({ type: 'SET_FOLD_TOTAL', payload: maxRounds })
    startRound(0)
    return () => { if (showTimerRef.current) clearTimeout(showTimerRef.current) }
  }, [])

  const startRound = useCallback((r) => {
    if (r >= maxRounds || completedRef.current) {
      completedRef.current = true
      setRunning(false)
      toast('Pliage terminé ! 👔', 'info')
      setTimeout(onComplete, 1200)
      return
    }

    const len = 3 + Math.floor(r / 2) + Math.floor(level / 2)
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4))
    setSequence(seq)
    setPlayerSeq([])
    setRound(r)
    setShowIndex(-1)
    setPhase('showing')

    // Show arrows ONE BY ONE with clear pauses
    let idx = 0
    const showNext = () => {
      if (idx >= seq.length) {
        // All shown — small pause then switch to input
        showTimerRef.current = setTimeout(() => {
          setShowIndex(-1)
          setPhase('input')
        }, 400)
        return
      }
      setShowIndex(idx)
      vibrateTap()
      idx++
      showTimerRef.current = setTimeout(() => {
        setShowIndex(-1) // brief blank between arrows
        showTimerRef.current = setTimeout(showNext, 200)
      }, 600)
    }

    // Small initial delay so the user sees "Mémorise..."
    showTimerRef.current = setTimeout(showNext, 500)
  }, [level, maxRounds, dispatch, toast, onComplete])

  const handleArrowClick = (dirIndex) => {
    if (phase !== 'input') return

    const expected = sequence[playerSeq.length]

    if (dirIndex === expected) {
      const newPlayerSeq = [...playerSeq, dirIndex]
      setPlayerSeq(newPlayerSeq)
      dispatch({ type: 'ADD_SCORE', payload: 15 })
      vibrateTap()

      if (newPlayerSeq.length === sequence.length) {
        // Round complete!
        setPhase('feedback')
        dispatch({ type: 'FOLD_SUCCESS' })
        dispatch({ type: 'INCREMENT_COMBO' })
        vibrateSuccess()
        toast(`✅ Pliage parfait ! ${round + 1}/${maxRounds}`, 'success')
        setTimeout(() => startRound(round + 1), 900)
      }
    } else {
      // Wrong
      setPhase('feedback')
      dispatch({ type: 'RESET_COMBO' })
      dispatch({ type: 'ADD_SCORE', payload: -20 })
      vibrateError()
      toast('❌ Mauvais pli !', 'error')
      setTimeout(() => startRound(round + 1), 900)
    }
  }

  // Skip button — move to next round with small penalty
  const handleSkip = () => {
    if (phase !== 'input' && phase !== 'showing') return
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    dispatch({ type: 'ADD_SCORE', payload: -10 })
    dispatch({ type: 'RESET_COMBO' })
    toast('⏭️ Pliage passé ! -10 pts', 'warning')
    setTimeout(() => startRound(round + 1), 500)
  }

  // Tap rapidly on clothes for bonus (speed folding)
  const [tapCounts, setTapCounts] = useState({})
  const handleTapFold = (idx) => {
    if (phase === 'showing') return
    setTapCounts(prev => {
      const count = (prev[idx] || 0) + 1
      if (count >= 5) {
        dispatch({ type: 'ADD_SCORE', payload: 10 })
        vibrate(30)
        toast('+10 — Speed fold ! ⚡', 'success')
        return { ...prev, [idx]: 0 }
      }
      vibrateTap()
      return { ...prev, [idx]: count }
    })
  }

  const handleTimeUp = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    setRunning(false)
    toast('⏰ Temps écoulé !', 'warning')
    setTimeout(onComplete, 1000)
  }, [onComplete, toast])

  return (
    <div className="screen-enter phase-fill">
      <div className="text-center mb-1">
        <h2 className="font-bangers text-2xl text-[var(--neon-blue)]">👔 Pliage Express</h2>
        <p className="text-xs text-white/40 mt-1">
          {phase === 'showing' ? '👀 Mémorise la séquence...' : phase === 'input' ? '🎯 Reproduis la séquence !' : ''}
        </p>
      </div>

      <TimerBar duration={duration} running={running} onEnd={handleTimeUp} />

      {/* Round indicator */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2">
          {Array.from({ length: maxRounds }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300
                ${i < round ? 'bg-[var(--neon-green)]' : ''}
                ${i === round ? 'bg-[var(--neon-blue)] scale-125 shadow-[0_0_8px_rgba(0,212,255,0.6)]' : ''}
                ${i > round ? 'bg-white/10' : ''}
              `}
            />
          ))}
        </div>
        <span className="text-xs text-white/30 ml-2">
          Round {round + 1}/{maxRounds} · {sequence.length} plis
        </span>
      </div>

      {/* === DEMO: Show ONE arrow at a time in a big central display === */}
      {phase === 'showing' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            className={`
              w-24 h-24 rounded-2xl flex items-center justify-center text-5xl
              transition-all duration-200
              ${showIndex >= 0
                ? 'bg-[rgba(0,212,255,0.15)] border-3 border-[var(--neon-blue)] scale-110 shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                : 'bg-[var(--accent)] border-2 border-white/10 scale-90 opacity-30'
              }
            `}
          >
            {showIndex >= 0 ? FOLD_DIRS[sequence[showIndex]].emoji : '?'}
          </div>

          {/* Small counter: "2 / 5" */}
          <p className="text-xs text-white/30 mt-3 font-pixel">
            {showIndex >= 0 ? `${showIndex + 1} / ${sequence.length}` : '...'}
          </p>

          {/* Sequence dots preview (small, just shows position) */}
          <div className="flex gap-1.5 mt-3">
            {sequence.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200
                  ${i < showIndex ? 'bg-[var(--neon-blue)]/40' : ''}
                  ${i === showIndex ? 'bg-[var(--neon-blue)] scale-125' : ''}
                  ${i > showIndex ? 'bg-white/10' : ''}
                `}
              />
            ))}
          </div>
        </div>
      )}

      {/* === INPUT: Player reproduces the sequence === */}
      {(phase === 'input' || phase === 'feedback') && (
        <div className="flex-1 flex flex-col">
          {/* Progress tracker — shows what the player has entered */}
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {sequence.map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                  transition-all duration-200
                  ${i < playerSeq.length
                    ? 'bg-[rgba(0,255,135,0.15)] border-2 border-[var(--neon-green)] scale-100'
                    : i === playerSeq.length
                      ? 'bg-[rgba(0,212,255,0.1)] border-2 border-[var(--neon-blue)] border-dashed'
                      : 'bg-[var(--accent)] border border-white/10'
                  }
                `}
              >
                {i < playerSeq.length ? FOLD_DIRS[playerSeq[i]].emoji : i === playerSeq.length ? '?' : '·'}
              </div>
            ))}
          </div>

          {/* Arrow buttons — big and touchable */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
              {/* Top: Up */}
              <div />
              <button
                onClick={() => handleArrowClick(0)}
                disabled={phase !== 'input'}
                className={`w-full aspect-square rounded-2xl flex items-center justify-center text-3xl cursor-pointer transition-all active:scale-90
                  glass border-2 border-white/10
                  ${phase === 'input' ? 'hover:border-[var(--neon-yellow)] hover:bg-[rgba(255,190,11,0.08)]' : 'opacity-40'}
                `}
              >
                ⬆️
              </button>
              <div />

              {/* Middle: Left, garment, Right */}
              <button
                onClick={() => handleArrowClick(2)}
                disabled={phase !== 'input'}
                className={`w-full aspect-square rounded-2xl flex items-center justify-center text-3xl cursor-pointer transition-all active:scale-90
                  glass border-2 border-white/10
                  ${phase === 'input' ? 'hover:border-[var(--neon-yellow)] hover:bg-[rgba(255,190,11,0.08)]' : 'opacity-40'}
                `}
              >
                ⬅️
              </button>
              <div className="w-full aspect-square rounded-2xl flex items-center justify-center text-4xl bg-[var(--accent)] border-2 border-white/5">
                {foldItems[round % foldItems.length]?.emoji || '👔'}
              </div>
              <button
                onClick={() => handleArrowClick(3)}
                disabled={phase !== 'input'}
                className={`w-full aspect-square rounded-2xl flex items-center justify-center text-3xl cursor-pointer transition-all active:scale-90
                  glass border-2 border-white/10
                  ${phase === 'input' ? 'hover:border-[var(--neon-yellow)] hover:bg-[rgba(255,190,11,0.08)]' : 'opacity-40'}
                `}
              >
                ➡️
              </button>

              {/* Bottom: Down */}
              <div />
              <button
                onClick={() => handleArrowClick(1)}
                disabled={phase !== 'input'}
                className={`w-full aspect-square rounded-2xl flex items-center justify-center text-3xl cursor-pointer transition-all active:scale-90
                  glass border-2 border-white/10
                  ${phase === 'input' ? 'hover:border-[var(--neon-yellow)] hover:bg-[rgba(255,190,11,0.08)]' : 'opacity-40'}
                `}
              >
                ⬇️
              </button>
              <div />
            </div>
          </div>
        </div>
      )}

      {/* Skip button */}
      {(phase === 'input' || phase === 'showing') && (
        <button
          onClick={handleSkip}
          className="mt-3 mx-auto block px-6 py-2 rounded-full text-xs text-white/40 border border-white/10 cursor-pointer hover:text-white/60 hover:border-white/20 transition-all active:scale-95"
        >
          ⏭️ Passer ce round (-10 pts)
        </button>
      )}

      {/* Speed fold hint */}
      <div className="text-center mt-2 text-[0.6rem] text-white/20">
        ⚡ Tape 5x sur le vêtement central pour un speed fold bonus !
      </div>
    </div>
  )
}
