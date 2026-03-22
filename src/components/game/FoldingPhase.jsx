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
  const [showing, setShowing] = useState(false)
  const [activeArrow, setActiveArrow] = useState(null)
  const [foldItems] = useState(() =>
    [...CLOTHES].sort(() => Math.random() - 0.5).slice(0, 5)
  )

  useEffect(() => {
    dispatch({ type: 'SET_FOLD_TOTAL', payload: maxRounds })
    startRound(0)
  }, [])

  const startRound = useCallback((r) => {
    if (r >= maxRounds) {
      setRunning(false)
      toast('Pliage terminé ! 👔', 'info')
      setTimeout(onComplete, 1200)
      return
    }

    const len = 3 + Math.floor(r / 2) + Math.floor(level / 2)
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4))
    setSequence(seq)
    setPlayerSeq([])
    setShowing(true)
    setRound(r)

    // Show sequence with animation
    let idx = 0
    const showInterval = setInterval(() => {
      setActiveArrow(null)
      if (idx >= seq.length) {
        clearInterval(showInterval)
        setTimeout(() => {
          setShowing(false)
          setActiveArrow(null)
        }, 300)
        return
      }
      setActiveArrow(seq[idx])
      vibrateTap()
      idx++
    }, 600)

    return () => clearInterval(showInterval)
  }, [level, maxRounds, dispatch, toast, onComplete])

  const handleArrowClick = (dirIndex) => {
    if (showing) return

    const expected = sequence[playerSeq.length]
    setActiveArrow(dirIndex)
    setTimeout(() => setActiveArrow(null), 150)

    if (dirIndex === expected) {
      const newPlayerSeq = [...playerSeq, dirIndex]
      setPlayerSeq(newPlayerSeq)
      dispatch({ type: 'ADD_SCORE', payload: 15 })
      vibrateTap()

      if (newPlayerSeq.length === sequence.length) {
        // Round complete !
        dispatch({ type: 'FOLD_SUCCESS' })
        dispatch({ type: 'INCREMENT_COMBO' })
        vibrateSuccess()
        toast(`✅ Pliage parfait ! Round ${round + 1}/${maxRounds}`, 'success')
        setTimeout(() => startRound(round + 1), 800)
      }
    } else {
      // Wrong
      dispatch({ type: 'RESET_COMBO' })
      dispatch({ type: 'ADD_SCORE', payload: -20 })
      vibrateError()
      toast('❌ Mauvais pli !', 'error')
      setTimeout(() => startRound(round + 1), 800)
    }
  }

  // Tap rapidly on clothes for bonus (speed folding)
  const [tapCounts, setTapCounts] = useState({})
  const handleTapFold = (idx) => {
    if (showing) return
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
    setRunning(false)
    toast('⏰ Temps écoulé !', 'warning')
    setTimeout(onComplete, 1000)
  }, [onComplete, toast])

  return (
    <div className="screen-enter">
      <div className="text-center mb-1">
        <h2 className="font-bangers text-2xl text-[var(--neon-blue)]">👔 Phase 4 — Pliage Express</h2>
        <p className="text-xs text-white/40 mt-1">
          {showing ? '👀 Mémorise la séquence...' : '🎯 Reproduis la séquence !'}
        </p>
      </div>

      <TimerBar duration={duration} running={running} onEnd={handleTimeUp} />

      {/* Fold items display */}
      <div className="flex justify-center gap-3 flex-wrap mb-4">
        {foldItems.map((item, i) => (
          <button
            key={i}
            onClick={() => handleTapFold(i)}
            className="glass w-16 h-16 flex flex-col items-center justify-center text-2xl cursor-pointer active:scale-90 transition-transform relative"
          >
            {item.emoji}
            {tapCounts[i] > 0 && (
              <span className="font-pixel text-[0.4rem] text-[var(--neon-yellow)] absolute bottom-1">
                {tapCounts[i]}/5
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Round indicator */}
      <div className="text-center mb-3">
        <span className="font-pixel text-xs text-[var(--neon-yellow)]">
          Round {round + 1} / {maxRounds}
        </span>
        <span className="text-xs text-white/30 ml-2">
          ({sequence.length} plis)
        </span>
      </div>

      {/* Sequence display (during showing) */}
      {showing && (
        <div className="flex justify-center gap-2 mb-4">
          {sequence.map((dir, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all
                ${activeArrow === dir && i === sequence.findIndex((d, idx) => d === dir && idx >= (playerSeq.length || 0))
                  ? 'bg-[rgba(0,255,135,0.15)] border-2 border-[var(--neon-green)] scale-110'
                  : 'bg-[var(--accent)] border border-white/10'
                }
              `}
            >
              {FOLD_DIRS[dir].emoji}
            </div>
          ))}
        </div>
      )}

      {/* Player progress (during input) */}
      {!showing && (
        <div className="flex justify-center gap-2 mb-4">
          {sequence.map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                ${i < playerSeq.length
                  ? 'bg-[rgba(0,255,135,0.15)] border-2 border-[var(--neon-green)]'
                  : 'bg-[var(--accent)] border border-white/10'
                }
              `}
            >
              {i < playerSeq.length ? FOLD_DIRS[playerSeq[i]].emoji : '?'}
            </div>
          ))}
        </div>
      )}

      {/* Arrow buttons */}
      <div className="flex justify-center gap-3">
        {FOLD_DIRS.map((dir, i) => (
          <button
            key={i}
            onClick={() => handleArrowClick(i)}
            disabled={showing}
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl cursor-pointer transition-all active:scale-90
              ${activeArrow === i ? 'bg-[rgba(0,255,135,0.12)] border-2 border-[var(--neon-green)] scale-110' : 'glass border-2 border-white/10'}
              ${showing ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--neon-yellow)]'}
            `}
          >
            {dir.emoji}
          </button>
        ))}
      </div>

      <div className="text-center mt-3 text-[0.65rem] text-white/25">
        ⚡ Tape 5x sur un vêtement pour un speed fold bonus !
      </div>
    </div>
  )
}
