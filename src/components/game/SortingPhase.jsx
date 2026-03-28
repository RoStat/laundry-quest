import { useState, useEffect, useCallback, useMemo } from 'react'
import TimerBar from '../ui/TimerBar'
import { CATEGORIES, evaluateSort, getClothesForLevel } from '../../data/clothes'
import { vibrate, vibrateSuccess, vibrateError, vibrateTap, useTiltDetection } from '../../hooks/useDeviceInteractions'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Snarky messages for totally wrong answers
const WRONG_MESSAGES = [
  'Tu tries du linge ou tu lances des dés ? 🎲',
  'Même le chat trie mieux que ça ! 🐱',
  'RIP ce vêtement. Tu lui dois des excuses. 💀',
  'Ton linge va porter plainte... 📋',
  'Non. Juste... non. 🫠',
  'Aïe, tes vêtements pleurent. 😭',
  'C\'est pas un panier poubelle ça ! 🗑️',
  'Erreur fatale. Le détergent est choqué. 🧴',
]

export default function SortingPhase({ level, dispatch, toast, onComplete }) {
  const itemCount = 8 + level * 2
  const duration = 30 + level * 5

  const queue = useMemo(() => {
    const pool = getClothesForLevel(level)
    const items = []
    for (let i = 0; i < itemCount; i++) {
      items.push(pool[Math.floor(Math.random() * pool.length)])
    }
    return items
  }, [itemCount, level])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [basketCounts, setBasketCounts] = useState({ blanc: 0, couleur: 0, sombre: 0, delicat: 0 })
  const [feedback, setFeedback] = useState(null) // { basketId, result: 'perfect'|'accepted'|'wrong' }
  const [running, setRunning] = useState(true)
  const [highlightBasket, setHighlightBasket] = useState(null)
  const [partialMessage, setPartialMessage] = useState(null)

  const currentItem = currentIndex < queue.length ? queue[currentIndex] : null

  useEffect(() => {
    dispatch({ type: 'SET_SORT_TOTAL', payload: queue.length })
  }, [queue.length, dispatch])

  const sortIntoBasket = useCallback((basketId) => {
    if (!currentItem || !running) return

    const evaluation = evaluateSort(currentItem, basketId)

    if (evaluation.result === 'perfect') {
      // Perfect sort — full points
      dispatch({ type: 'SORT_CORRECT' })
      dispatch({ type: 'INCREMENT_COMBO' })
      dispatch({ type: 'ADD_SCORE', payload: evaluation.score })
      vibrateSuccess()
      setFeedback({ basketId, result: 'perfect' })
      setBasketCounts(prev => ({ ...prev, [basketId]: prev[basketId] + 1 }))
      toast(`+${evaluation.score} pts ! 🎯`, 'success')

      // Show tip occasionally
      if (Math.random() < 0.3 && evaluation.tip) {
        setTimeout(() => dispatch({
          type: 'SHOW_TIP',
          payload: { title: currentItem.name, text: evaluation.tip }
        }), 500)
      }
    } else if (evaluation.result === 'accepted') {
      // Acceptable but not ideal — partial points + educational message
      dispatch({ type: 'SORT_CORRECT' }) // Still counts as correct
      // Don't break combo but don't increment either
      dispatch({ type: 'ADD_SCORE', payload: evaluation.score })
      vibrateTap()
      setFeedback({ basketId, result: 'accepted' })
      setBasketCounts(prev => ({ ...prev, [basketId]: prev[basketId] + 1 }))
      toast(`~${evaluation.score} pts — Acceptable ! 🤔`, 'warning')

      // Always show the reason for partial credit
      if (evaluation.reason) {
        setPartialMessage(evaluation.reason)
        setTimeout(() => setPartialMessage(null), 3000)
      }
    } else {
      // Totally wrong — harsh penalty
      dispatch({ type: 'SORT_WRONG' })
      dispatch({ type: 'RESET_COMBO' })
      dispatch({ type: 'ADD_SCORE', payload: evaluation.score })
      vibrateError()
      setFeedback({ basketId, result: 'wrong' })
      const correctCat = CATEGORIES.find(c => c.id === currentItem.cat)
      const snark = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]
      toast(`${snark} C'est du ${correctCat?.name} !`, 'error')
    }

    setTimeout(() => setFeedback(null), 500)
    setCurrentIndex(prev => prev + 1)
  }, [currentItem, running, dispatch, toast])

  // Tilt to sort (mobile) — maps 4 tilt zones
  const handleTilt = useCallback((direction) => {
    if (!currentItem || !running) return
    // Map 4 tilt directions to 4 baskets
    const tiltMap = {
      left: 'blanc',
      right: 'couleur',
      up: 'delicat',
      down: 'sombre',
    }
    if (tiltMap[direction]) {
      setHighlightBasket(tiltMap[direction])
      setTimeout(() => {
        setHighlightBasket(null)
        // Auto-sort on sustained tilt
        sortIntoBasket(tiltMap[direction])
      }, 400)
    }
  }, [currentItem, running, sortIntoBasket])

  useTiltDetection(handleTilt)

  // Check if done
  useEffect(() => {
    if (currentIndex >= queue.length && running) {
      setRunning(false)
      toast('Tri terminé ! ✅', 'info')
      setTimeout(onComplete, 1200)
    }
  }, [currentIndex, queue.length, running, onComplete, toast])

  const handleTimeUp = useCallback(() => {
    setRunning(false)
    toast('⏰ Temps écoulé !', 'warning')
    setTimeout(onComplete, 1000)
  }, [onComplete, toast])

  // Determine if current item is a multi-cat item (show indicator)
  const isMultiCat = currentItem?.acceptedCats?.length > 0

  return (
    <div className="screen-enter phase-fill">
      <div className="text-center mb-1">
        <h2 className="font-bangers text-2xl text-[var(--neon-blue)]">🧦 Le Grand Tri</h2>
        <p className="text-xs text-white/40 mt-1">Tape sur le bon panier ou incline ton tél !</p>
      </div>

      <TimerBar duration={duration} running={running} onEnd={handleTimeUp} />

      {/* Partial credit message */}
      {partialMessage && (
        <div className="glass border border-[var(--neon-yellow)] rounded-xl px-4 py-2 mb-2 text-center" style={{ animation: 'bounce 0.5s' }}>
          <p className="text-xs text-[var(--neon-yellow)]">💡 {partialMessage}</p>
        </div>
      )}

      {/* Conveyor belt */}
      <div className="glass p-5 mb-4 min-h-[120px] flex items-center justify-center relative overflow-hidden">
        {/* Conveyor animation */}
        <div
          className="absolute bottom-0 left-0 w-[200%] h-1.5"
          style={{
            background: 'repeating-linear-gradient(90deg, #444 0px, #444 20px, #666 20px, #666 40px)',
            animation: 'conveyorMove 1s linear infinite',
          }}
        />

        {currentItem ? (
          <div className="text-center" style={{ animation: 'bounce 1.5s ease-in-out infinite' }}>
            <div className="relative inline-block">
              <span className="text-6xl block">{currentItem.emoji}</span>
              {currentItem.color && (
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white/40 shadow-lg"
                  style={{ background: currentItem.color }}
                />
              )}
            </div>
            <span className="text-xs bg-black/50 px-3 py-1 rounded-full mt-1 inline-block">
              {currentItem.name}
            </span>
            {isMultiCat && (
              <span className="text-[0.6rem] block text-[var(--neon-yellow)] mt-1" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                ⚠️ Attention, pièce piège !
              </span>
            )}
            <span className="text-[0.6rem] block text-white/30 mt-1">
              {currentIndex + 1} / {queue.length}
            </span>
          </div>
        ) : (
          <div className="text-white/30 text-sm">✅ Tout est trié !</div>
        )}
      </div>

      {/* Baskets */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => sortIntoBasket(cat.id)}
            className={`glass p-4 text-center min-h-[100px] transition-all duration-200 cursor-pointer border-2 active:scale-95
              ${feedback?.basketId === cat.id && feedback.result === 'perfect' ? 'border-[var(--neon-green)] bg-[rgba(0,255,135,0.1)]' : ''}
              ${feedback?.basketId === cat.id && feedback.result === 'accepted' ? 'border-[var(--neon-yellow)] bg-[rgba(255,210,0,0.1)]' : ''}
              ${feedback?.basketId === cat.id && feedback.result === 'wrong' ? 'border-[var(--neon-pink)] bg-[rgba(255,0,110,0.1)]' : ''}
              ${!feedback || feedback.basketId !== cat.id ? 'border-transparent hover:border-[var(--neon-blue)]' : ''}
              ${highlightBasket === cat.id ? 'border-[var(--neon-yellow)] scale-105' : ''}
            `}
            style={feedback?.basketId === cat.id && feedback.result === 'wrong' ? { animation: 'shake 0.4s' } : {}}
          >
            <span className="text-3xl block">{cat.icon}</span>
            <div className="text-sm font-semibold text-white/80 mt-1">{cat.name}</div>
            <div className="font-pixel text-xs text-[var(--neon-yellow)] mt-1">
              {basketCounts[cat.id]}
            </div>
          </button>
        ))}
      </div>

      {/* Tilt direction compass — always visible */}
      <div className="relative mt-3 mx-auto w-[180px] h-[100px]">
        {/* Up = Délicats */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
          <span className="text-[0.6rem] text-white/30 block">⬆️ Incliner avant</span>
          <span className="text-[0.55rem] text-[var(--neon-blue)]/50">🦢 Délicats</span>
        </div>
        {/* Down = Sombres */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className="text-[0.55rem] text-[var(--neon-blue)]/50">⬛ Sombres</span>
          <span className="text-[0.6rem] text-white/30 block">⬇️ Incliner arrière</span>
        </div>
        {/* Left = Blancs */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-center">
          <span className="text-[0.6rem] text-white/30">⬅️</span>
          <span className="text-[0.55rem] text-[var(--neon-blue)]/50 block">⬜ Blancs</span>
        </div>
        {/* Right = Couleurs */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 text-center">
          <span className="text-[0.6rem] text-white/30">➡️</span>
          <span className="text-[0.55rem] text-[var(--neon-blue)]/50 block">🌈 Couleurs</span>
        </div>
        {/* Center phone icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg opacity-20">
          📱
        </div>
      </div>
    </div>
  )
}
