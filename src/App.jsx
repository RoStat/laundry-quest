import { useCallback, useEffect, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { useAuth } from './lib/AuthContext'
import { EVENTS } from './data/clothes'
import { LAUNDRY_TIPS } from './data/tips'
import { getDailyClothes, saveDailyAttempt, getDailyChallengeInfo, getTodayKey } from './lib/dailyChallenge'
import { saveGameSession } from './lib/supabase'
import BubblesBackground from './components/ui/BubblesBackground'
import Toast from './components/ui/Toast'
import StatsBar from './components/ui/StatsBar'
import EventPopup from './components/ui/EventPopup'
import TipCard from './components/pedagogy/TipCard'
import LoginScreen from './components/auth/LoginScreen'
import ModeSelect from './components/game/ModeSelect'
import StartScreen from './components/game/StartScreen'
import SortingPhase from './components/game/SortingPhase'
import WashingPhase from './components/game/WashingPhase'
import DryingPhase from './components/game/DryingPhase'
import FoldingPhase from './components/game/FoldingPhase'
import IroningPhase from './components/game/IroningPhase'
import ResultsScreen from './components/game/ResultsScreen'

// ============================================================
// FUTURE FEATURES (prepared as architecture hooks)
// ============================================================
// TODO: Leaderboard screen with weekly/all-time rankings
// TODO: Battle Pass / Season system with themed clothes
// TODO: 1v1 duel mode (real-time via Supabase Realtime)
// TODO: TikTok share card generator (html-to-image + Web Share API)
// TODO: Weekly challenges ("Lave 50 délicats cette semaine")
// TODO: Cosmetic shop (machine skins, special detergents)
// TODO: Achievement system with badges
// TODO: Encyclopedia/Codex screen for fabrics & symbols
// TODO: Push notifications for daily challenges
// ============================================================

export default function App() {
  const { state, dispatch, toast } = useGameState()
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  // App-level navigation: 'auth' | 'menu' | 'game'
  const [screen, setScreen] = useState('auth')
  // Game mode: 'free' | 'daily'
  const [gameMode, setGameMode] = useState('free')
  // Track if auth was skipped (for skip-without-account flow)
  const [authSkipped, setAuthSkipped] = useState(false)

  // Once auth resolves, go to menu
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated || authSkipped) {
        setScreen('menu')
      }
    }
  }, [authLoading, isAuthenticated, authSkipped])

  // Random event trigger (35% chance between phases)
  const triggerEvent = useCallback(() => {
    if (Math.random() > 0.35) return
    const evt = EVENTS[Math.floor(Math.random() * EVENTS.length)]
    dispatch({ type: 'ADD_EVENT' })
    dispatch({ type: 'SHOW_EVENT', payload: evt })

    if (evt.scoreMod) dispatch({ type: 'ADD_SCORE', payload: evt.scoreMod })
    if (evt.lifeMod) dispatch({ type: 'LOSE_LIFE' })
    if (evt.comboMod) dispatch({ type: 'SET_COMBO', payload: state.combo * evt.comboMod })
    if (evt.icon === '🧦') dispatch({ type: 'LOSE_SOCK' })
  }, [dispatch, state.combo])

  // Show random tip between phases (20% chance)
  const maybeTip = useCallback(() => {
    if (Math.random() > 0.2) return
    const tip = LAUNDRY_TIPS[Math.floor(Math.random() * LAUNDRY_TIPS.length)]
    dispatch({ type: 'SHOW_TIP', payload: tip })
  }, [dispatch])

  // ---- MODE HANDLERS ----
  const handleFreePlay = useCallback(() => {
    setGameMode('free')
    setScreen('game')
    dispatch({ type: 'RESET' })
    dispatch({ type: 'SET_PHASE', payload: 'start' })
  }, [dispatch])

  const handleDailyPlay = useCallback(() => {
    setGameMode('daily')
    setScreen('game')
    dispatch({ type: 'RESET' })
    dispatch({ type: 'SET_PHASE', payload: 'sort' }) // Skip start screen, go straight to sorting
  }, [dispatch])

  const handleBackToMenu = useCallback(() => {
    setScreen('menu')
    dispatch({ type: 'RESET' })
    dispatch({ type: 'SET_PHASE', payload: 'start' })
  }, [dispatch])

  // ---- PHASE TRANSITIONS ----
  const handleStart = useCallback(() => {
    dispatch({ type: 'RESET' })
    dispatch({ type: 'SET_PHASE', payload: 'sort' })
  }, [dispatch])

  const handleSortComplete = useCallback(() => {
    triggerEvent()
    maybeTip()
    setTimeout(() => dispatch({ type: 'SET_PHASE', payload: 'wash' }), 500)
  }, [dispatch, triggerEvent, maybeTip])

  const handleWashComplete = useCallback(() => {
    triggerEvent()
    maybeTip()
    setTimeout(() => dispatch({ type: 'SET_PHASE', payload: 'dry' }), 500)
  }, [dispatch, triggerEvent, maybeTip])

  const handleDryComplete = useCallback(() => {
    triggerEvent()
    maybeTip()
    setTimeout(() => dispatch({ type: 'SET_PHASE', payload: 'fold' }), 500)
  }, [dispatch, triggerEvent, maybeTip])

  const handleFoldComplete = useCallback(() => {
    triggerEvent()
    setTimeout(() => dispatch({ type: 'SET_PHASE', payload: 'iron' }), 500)
  }, [dispatch, triggerEvent])

  const handleIronComplete = useCallback(() => {
    triggerEvent()
    setTimeout(async () => {
      dispatch({ type: 'SET_PHASE', payload: 'results' })

      // Save to Supabase if authenticated
      if (user) {
        const grade = computeGrade(state.score)
        if (gameMode === 'daily') {
          await saveDailyAttempt(user.id, state.score, grade, {
            sortCorrect: state.sortCorrect,
            sortWrong: state.sortWrong,
            stainScore: state.stainScore,
            dryPercent: state.dryPercent,
            foldScore: state.foldScore,
            ironScore: state.ironScore,
            maxCombo: state.maxCombo,
          })
        } else {
          await saveGameSession(user.id, {
            score: state.score,
            grade,
            level: state.level,
            sortCorrect: state.sortCorrect,
            sortWrong: state.sortWrong,
            stainScore: state.stainScore,
            dryPercent: state.dryPercent,
            foldScore: state.foldScore,
            ironScore: state.ironScore,
            maxCombo: state.maxCombo,
          })
        }
      }
    }, 500)
  }, [dispatch, triggerEvent, user, gameMode, state])

  // Replay handler
  const handleReplay = useCallback(() => {
    if (gameMode === 'daily') {
      // Check if can still play today
      getDailyChallengeInfo(user?.id).then(info => {
        if (info.canPlay) {
          dispatch({ type: 'RESET' })
          dispatch({ type: 'SET_PHASE', payload: 'sort' })
        } else {
          toast('Plus d\'essais aujourd\'hui ! Reviens demain 📅', 'warning')
          setTimeout(() => handleBackToMenu(), 1500)
        }
      })
    } else {
      // Free play: level progression
      const maxScore = 2000
      const pct = (state.score / maxScore) * 100
      const nextLevel = pct >= 40 ? state.level + 1 : state.level
      dispatch({ type: 'RESET', payload: { level: nextLevel } })
      dispatch({ type: 'SET_PHASE', payload: 'start' })
    }
  }, [dispatch, state.level, state.score, gameMode, user, toast, handleBackToMenu])

  // Check game over
  useEffect(() => {
    if (state.lives <= 0 && state.phase !== 'results' && state.phase !== 'start') {
      toast('💀 Plus de vies ! Game Over...', 'error')
      setTimeout(() => dispatch({ type: 'SET_PHASE', payload: 'results' }), 1500)
    }
  }, [state.lives, state.phase, dispatch, toast])

  return (
    <div className="min-h-dvh">
      <BubblesBackground />

      {/* Toast */}
      <Toast toast={state.toast} />

      {/* Event popup */}
      <EventPopup
        event={state.eventPopup}
        onClose={() => dispatch({ type: 'HIDE_EVENT' })}
      />

      {/* Tip card */}
      <TipCard
        tip={state.tipCard}
        onClose={() => dispatch({ type: 'HIDE_TIP' })}
      />

      {/* Header */}
      <div className="relative z-10 text-center pt-4 px-4">
        <h1
          className="font-bangers neon-gradient text-[clamp(2rem,6vw,3.5rem)] tracking-wider leading-none cursor-pointer"
          style={{ animation: 'pulse 3s ease-in-out infinite' }}
          onClick={screen === 'game' ? handleBackToMenu : undefined}
        >
          🧺 Laundry Simulator 2026
        </h1>
        {screen === 'auth' && (
          <p className="text-xs text-white/30 mt-1 italic">Le simulateur de lessive le plus addictif au monde*</p>
        )}
        {screen === 'game' && gameMode === 'daily' && (
          <p className="text-xs text-[var(--neon-yellow)] mt-1 font-semibold">📅 Lessive du Jour</p>
        )}
      </div>

      {/* Stats bar — only during gameplay */}
      {screen === 'game' && state.phase !== 'start' && state.phase !== 'results' && (
        <StatsBar
          score={state.score}
          level={gameMode === 'daily' ? '📅' : state.level}
          lives={state.lives}
          combo={state.combo}
        />
      )}

      {/* Content area */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-8">

        {/* AUTH SCREEN */}
        {screen === 'auth' && (
          <LoginScreen onSkip={() => setAuthSkipped(true)} />
        )}

        {/* MODE SELECT SCREEN */}
        {screen === 'menu' && (
          <ModeSelect
            onFreePlay={handleFreePlay}
            onDaily={handleDailyPlay}
            onLeaderboard={() => toast('Classement bientôt disponible ! 🏆', 'info')}
            onProfile={() => {}}
          />
        )}

        {/* GAME SCREEN */}
        {screen === 'game' && (
          <>
            {state.phase === 'start' && (
              <StartScreen onStart={handleStart} />
            )}

            {state.phase === 'sort' && (
              <SortingPhase
                level={gameMode === 'daily' ? 3 : state.level}
                dispatch={dispatch}
                toast={toast}
                onComplete={handleSortComplete}
              />
            )}

            {state.phase === 'wash' && (
              <WashingPhase
                level={gameMode === 'daily' ? 3 : state.level}
                dispatch={dispatch}
                toast={toast}
                onComplete={handleWashComplete}
              />
            )}

            {state.phase === 'dry' && (
              <DryingPhase
                level={gameMode === 'daily' ? 3 : state.level}
                dispatch={dispatch}
                toast={toast}
                onComplete={handleDryComplete}
              />
            )}

            {state.phase === 'fold' && (
              <FoldingPhase
                level={gameMode === 'daily' ? 3 : state.level}
                dispatch={dispatch}
                toast={toast}
                onComplete={handleFoldComplete}
              />
            )}

            {state.phase === 'iron' && (
              <IroningPhase
                level={gameMode === 'daily' ? 3 : state.level}
                dispatch={dispatch}
                toast={toast}
                onComplete={handleIronComplete}
              />
            )}

            {state.phase === 'results' && (
              <ResultsScreen
                state={state}
                gameMode={gameMode}
                onReplay={handleReplay}
                onMenu={handleBackToMenu}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Helper to compute grade from score
function computeGrade(score) {
  const maxScore = 2000
  const pct = Math.min(100, (score / maxScore) * 100)
  if (pct >= 90) return 'S+'
  if (pct >= 75) return 'A'
  if (pct >= 60) return 'B'
  if (pct >= 40) return 'C'
  if (pct >= 20) return 'D'
  return 'F'
}
