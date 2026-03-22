import { useState, useCallback, useRef, useEffect } from 'react'
import TimerBar from '../ui/TimerBar'
import { SOAPS, TEMPS, CLOTHES, STAINS } from '../../data/clothes'
import { vibrate, vibrateSuccess, vibrateError, useScrubDetection } from '../../hooks/useDeviceInteractions'

export default function WashingPhase({ level, dispatch, toast, onComplete }) {
  const [subPhase, setSubPhase] = useState('choose') // choose | washing | stains | scrub
  const [selectedSoap, setSelectedSoap] = useState(null)
  const [selectedTemp, setSelectedTemp] = useState(null)
  const [washClothes] = useState(() => {
    const shuffled = [...CLOTHES].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 5)
  })
  const [waterLevel, setWaterLevel] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [running, setRunning] = useState(true)

  // Stain minigame state
  const [stainGrid, setStainGrid] = useState([])
  const [stainRound, setStainRound] = useState(0)
  const stainIntervalRef = useRef(null)

  // Scrub minigame state
  const [scrubProgress, setScrubProgress] = useState(0)
  const [scrubTarget, setScrubTarget] = useState(null)
  const scrubRef = useRef(null)

  const handleSelectSoap = (soap) => {
    setSelectedSoap(soap)
    dispatch({ type: 'SET_SOAP', payload: soap })
    vibrate(20)
  }

  const handleSelectTemp = (temp) => {
    setSelectedTemp(temp)
    dispatch({ type: 'SET_TEMP', payload: temp })
    vibrate(20)
  }

  const startWash = useCallback(() => {
    if (!selectedSoap) {
      setSelectedSoap(SOAPS[1])
      dispatch({ type: 'SET_SOAP', payload: SOAPS[1] })
    }
    if (!selectedTemp) {
      setSelectedTemp(TEMPS[1])
      dispatch({ type: 'SET_TEMP', payload: TEMPS[1] })
    }

    const soap = selectedSoap || SOAPS[1]
    const temp = selectedTemp || TEMPS[1]

    setSubPhase('washing')
    setSpinning(true)
    setWaterLevel(60)
    vibrate([50, 30, 50])

    // Check for delicate items at high temp
    const hasDelicate = washClothes.some(c => c.cat === 'delicat')
    if (hasDelicate && temp.val >= 60) {
      dispatch({ type: 'ADD_SCORE', payload: -100 })
      dispatch({ type: 'LOSE_LIFE' })
      dispatch({ type: 'SET_WASH_PENALTY', payload: true })
      toast(`⚠️ Délicats à ${temp.temp} ! Catastrophe !`, 'error')
    } else if (temp.val <= 40) {
      dispatch({ type: 'ADD_SCORE', payload: 50 })
      toast('Bonne température ! +50 pts ✨', 'success')
    }

    if (soap.id === 'nucleaire') {
      toast('☢️ Lessive nucléaire ! Les vêtements brillent...', 'warning')
      dispatch({ type: 'ADD_SCORE', payload: 30 })
    }

    // After washing animation → stain minigame
    setTimeout(() => {
      setSpinning(false)
      setWaterLevel(0)
      setSubPhase('stains')
      startStainGame()
    }, 3000)
  }, [selectedSoap, selectedTemp, washClothes, dispatch, toast])

  // ---- STAIN RUB MINIGAME ----
  const startStainGame = useCallback(() => {
    // Create grid with stains that need rubbing (scrubCount tracks how many rubs)
    const stainCount = 8 + level
    const grid = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      active: i < stainCount,
      popped: false,
      stain: i < stainCount ? STAINS[Math.floor(Math.random() * STAINS.length)] : '',
      scrubCount: 0, // needs 3 rubs to remove
    }))
    // Shuffle active stains randomly across grid
    const shuffled = grid.sort(() => Math.random() - 0.5).map((c, i) => ({ ...c, id: i }))
    setStainGrid(shuffled)
    setStainRound(0)
  }, [level])

  // Handle touch/mouse move over stain grid for rubbing
  const stainGridRef = useRef(null)
  const lastRubbedCell = useRef(null)

  const handleStainPointerMove = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches ? e.touches[0] : e
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!el) return
    const cellId = el.getAttribute('data-cell-id')
    if (cellId == null) return
    const id = parseInt(cellId)
    if (id === lastRubbedCell.current) return
    lastRubbedCell.current = id

    setStainGrid(prev => {
      const cell = prev.find(c => c.id === id)
      if (!cell || !cell.active || cell.popped) return prev
      const newCount = cell.scrubCount + 1
      if (newCount >= 3) {
        // Stain removed!
        dispatch({ type: 'ADD_STAIN_SCORE' })
        dispatch({ type: 'ADD_SCORE', payload: 20 })
        vibrate(30)
        toast('+20 — Tache frottée ! 💥', 'success')

        const updated = prev.map(c => c.id === id ? { ...c, active: false, popped: true, stain: '✨', scrubCount: newCount } : c)
        // Check if all stains done
        const remaining = updated.filter(c => c.active && !c.popped)
        if (remaining.length === 0) {
          setTimeout(() => {
            setSubPhase('scrub')
            setScrubProgress(0)
            setScrubTarget(STAINS[Math.floor(Math.random() * STAINS.length)])
          }, 800)
        }
        return updated
      }
      vibrate(10)
      return prev.map(c => c.id === id ? { ...c, scrubCount: newCount } : c)
    })
  }, [dispatch, toast])

  const handleStainPointerEnd = useCallback(() => {
    lastRubbedCell.current = null
  }, [])

  // ---- SCRUB MINIGAME ----
  const handleScrub = useCallback((count) => {
    setScrubProgress(prev => {
      const next = Math.min(100, prev + 5)
      if (next >= 100) {
        dispatch({ type: 'ADD_SCORE', payload: 50 })
        toast('🧽 Tache éliminée par frottement ! +50', 'success')
        setRunning(false)
        setTimeout(onComplete, 1000)
        return 100
      }
      return next
    })
  }, [dispatch, toast, onComplete])

  useScrubDetection(scrubRef, handleScrub)

  // Fallback: click/tap rapidly to scrub on desktop
  const handleScrubTap = () => {
    setScrubProgress(prev => {
      const next = Math.min(100, prev + 3)
      vibrate(15)
      if (next >= 100) {
        dispatch({ type: 'ADD_SCORE', payload: 50 })
        toast('🧽 Tache éliminée ! +50', 'success')
        setRunning(false)
        setTimeout(onComplete, 1000)
        return 100
      }
      return next
    })
  }

  const handleTimeUp = useCallback(() => {
    clearInterval(stainIntervalRef.current)
    setRunning(false)
    toast('⏰ Temps écoulé !', 'warning')
    setTimeout(onComplete, 1000)
  }, [onComplete, toast])

  useEffect(() => {
    return () => {
      if (stainIntervalRef.current) clearInterval(stainIntervalRef.current)
    }
  }, [])

  return (
    <div className="screen-enter">
      <div className="text-center mb-1">
        <h2 className="font-bangers text-2xl text-[var(--neon-blue)]">🧴 Phase 2 — Le Lavage</h2>
        <p className="text-xs text-white/40 mt-1">
          {subPhase === 'choose' && 'Choisis ta lessive et la température !'}
          {subPhase === 'washing' && 'Lavage en cours...'}
          {subPhase === 'stains' && 'Frotte les taches avec ton doigt !'}
          {subPhase === 'scrub' && '👆 Frotte l\'écran pour détacher !'}
        </p>
      </div>

      <TimerBar duration={40 + level * 5} running={running} onEnd={handleTimeUp} />

      {/* WASHING MACHINE */}
      <div className="flex justify-center mb-4">
        <div className="relative w-[240px] h-[280px] rounded-2xl bg-gradient-to-b from-gray-300 to-gray-500 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          {/* Top panel */}
          <div className="h-[70px] flex items-center justify-around px-3">
            <div
              className="w-11 h-11 rounded-full border-[3px] border-gray-500 cursor-pointer transition-transform hover:scale-110 active:animate-spin"
              style={{ background: 'conic-gradient(#e74c3c, #e67e22, #f1c40f, #2ecc71, #3498db, #9b59b6, #e74c3c)' }}
              onClick={() => { dispatch({ type: 'ADD_SCORE', payload: 5 }); vibrate(20) }}
            />
            <div className="bg-black text-[var(--neon-green)] font-pixel text-[0.5rem] px-2.5 py-1.5 rounded text-center leading-relaxed min-w-[90px]">
              {subPhase === 'choose' && 'PRÊT\n---'}
              {subPhase === 'washing' && `LAVAGE\n${(selectedTemp || TEMPS[1]).temp}`}
              {subPhase === 'stains' && 'DÉTACHAGE\n!!!'}
              {subPhase === 'scrub' && 'FROTTE !\n🧽'}
            </div>
            <div
              className="w-11 h-11 rounded-full border-[3px] border-gray-500 cursor-pointer transition-transform hover:scale-110 active:animate-spin"
              style={{ background: 'conic-gradient(#e74c3c, #e67e22, #f1c40f, #2ecc71, #3498db, #9b59b6, #e74c3c)' }}
              onClick={() => { dispatch({ type: 'ADD_SCORE', payload: 5 }); vibrate(20) }}
            />
          </div>

          {/* Door */}
          <div
            className={`w-[150px] h-[150px] rounded-full mx-auto border-[5px] border-gray-500 relative overflow-hidden ${spinning ? '' : ''}`}
            style={{
              background: 'radial-gradient(circle, rgba(0,180,255,0.15) 0%, rgba(0,80,140,0.3) 60%, #555 60%, #777 100%)',
              animation: spinning ? 'vibrate 0.15s infinite alternate' : 'none',
            }}
          >
            {/* Water */}
            <div
              className="absolute bottom-0 left-0 w-full transition-[height] duration-1000 rounded-b-full"
              style={{
                height: `${waterLevel}%`,
                background: 'linear-gradient(180deg, rgba(0,150,255,0.3), rgba(0,100,200,0.6))',
              }}
            />
            {/* Clothes inside */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl flex flex-wrap gap-0.5 justify-center w-[90px]"
              style={spinning ? { animation: 'spin 0.8s linear infinite' } : {}}
            >
              {washClothes.map((c, i) => <span key={i}>{c.emoji}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* CHOOSE PHASE */}
      {subPhase === 'choose' && (
        <div className="space-y-4">
          <div>
            <p className="text-center text-xs text-white/50 mb-2">🧴 Choisis ta lessive :</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {SOAPS.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSoap(s)}
                  className={`glass px-4 py-2.5 text-sm cursor-pointer transition-all active:scale-95
                    ${selectedSoap?.id === s.id ? 'border-[var(--neon-green)] bg-[rgba(0,255,135,0.08)] shadow-[0_0_12px_rgba(0,255,135,0.2)]' : 'hover:border-[var(--neon-blue)]'}
                  `}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-center text-xs text-white/50 mb-2">🌡️ Choisis la température :</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {TEMPS.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemp(t)}
                  className={`glass px-4 py-2.5 text-sm cursor-pointer transition-all text-center active:scale-95
                    ${selectedTemp?.id === t.id ? 'border-[var(--neon-yellow)] text-[var(--neon-yellow)] shadow-[0_0_12px_rgba(255,190,11,0.2)]' : 'text-white/60 hover:border-[var(--neon-blue)] hover:text-white'}
                  `}
                >
                  {t.icon} {t.label}
                  <span className="font-pixel text-[0.6rem] block mt-0.5">{t.temp}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startWash}
            disabled={!selectedSoap || !selectedTemp}
            className="block mx-auto px-10 py-3 border-none rounded-full bg-gradient-to-r from-[var(--neon-green)] to-green-600 text-white font-bangers text-xl cursor-pointer tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            LANCER LE LAVAGE !
          </button>
        </div>
      )}

      {/* STAIN RUB MINIGAME */}
      {subPhase === 'stains' && (
        <div className="glass p-4 text-center">
          <h3 className="font-bangers text-lg text-[var(--neon-orange)] mb-1">🧽 Frotte les taches !</h3>
          <p className="text-xs text-white/40 mb-3">Glisse ton doigt sur les taches pour les enlever !</p>
          <div
            ref={stainGridRef}
            className="grid grid-cols-5 gap-2 max-w-[320px] mx-auto select-none"
            style={{ touchAction: 'none' }}
            onTouchMove={handleStainPointerMove}
            onTouchEnd={handleStainPointerEnd}
            onMouseMove={(e) => e.buttons === 1 && handleStainPointerMove(e)}
            onMouseUp={handleStainPointerEnd}
          >
            {stainGrid.map(cell => (
              <div
                key={cell.id}
                data-cell-id={cell.id}
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl transition-all
                  ${cell.popped ? 'bg-[rgba(0,255,135,0.12)] border-2 border-[var(--neon-green)]' : ''}
                  ${cell.active && !cell.popped ? 'bg-[rgba(255,0,110,0.12)] border-2 border-[var(--neon-pink)]' : ''}
                  ${!cell.active && !cell.popped ? 'bg-[var(--accent)] border-2 border-white/10' : ''}
                `}
                style={cell.active && !cell.popped && cell.scrubCount > 0 ? { opacity: 1 - (cell.scrubCount * 0.25) } : {}}
              >
                <span className="pointer-events-none select-none">{cell.stain}</span>
              </div>
            ))}
          </div>
          <p className="text-[0.6rem] text-white/25 mt-2">Frotte 3x chaque tache pour l'enlever</p>
        </div>
      )}

      {/* SCRUB MINIGAME */}
      {subPhase === 'scrub' && (
        <div className="glass p-6 text-center">
          <h3 className="font-bangers text-lg text-[var(--neon-orange)] mb-1">🧽 Frotte pour détacher !</h3>
          <p className="text-xs text-white/40 mb-4">Frotte l'écran d'avant en arrière sur la tache !</p>

          <div
            ref={scrubRef}
            onClick={handleScrubTap}
            className="w-40 h-40 rounded-full mx-auto flex items-center justify-center text-5xl cursor-pointer relative bg-[var(--accent)] border-4 border-white/10 active:scale-95 transition-transform"
            style={{ touchAction: 'none' }}
          >
            {scrubTarget}
            {scrubProgress < 100 && (
              <div className="absolute inset-0 rounded-full border-4 border-[var(--neon-blue)] opacity-50" style={{ animation: 'scrubPulse 1s infinite' }} />
            )}
            {scrubProgress >= 100 && <span className="absolute text-6xl">✨</span>}
          </div>

          {/* Progress */}
          <div className="max-w-[200px] mx-auto mt-4">
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${scrubProgress}%`,
                  background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-green))',
                }}
              />
            </div>
            <p className="text-xs text-white/40 mt-1">{scrubProgress}%</p>
          </div>
        </div>
      )}
    </div>
  )
}
