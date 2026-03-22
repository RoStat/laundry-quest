import { useMemo, useState, useEffect } from 'react'
import { QUIZ_QUESTIONS, LAUNDRY_TIPS } from '../../data/tips'

// ============================================================
// FUTURE: Share to TikTok/Instagram template
// TODO: Canvas-based screenshot generator for share cards
// TODO: Animated share card with grade + stats
// ============================================================

export default function ResultsScreen({ state, gameMode = 'free', onReplay, onMenu }) {
  const [revealedCards, setRevealedCards] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState(null)

  const { grade, color, comment } = useMemo(() => {
    const maxScore = 2000
    const pct = Math.min(100, (state.score / maxScore) * 100)

    if (pct >= 90) return { grade: 'S+', color: 'from-yellow-400 to-orange-500', comment: '🏆 MAÎTRE de la lessive ! Tes vêtements te vénèrent.' }
    if (pct >= 75) return { grade: 'A', color: 'from-[var(--neon-green)] to-green-600', comment: '👏 Excellent ! Ta mère serait fière.' }
    if (pct >= 60) return { grade: 'B', color: 'from-[var(--neon-blue)] to-blue-600', comment: '👍 Pas mal ! Quelques chaussettes ont survécu.' }
    if (pct >= 40) return { grade: 'C', color: 'from-[var(--neon-yellow)] to-yellow-600', comment: '😅 Moyen... tes vêtements ont vécu des choses.' }
    if (pct >= 20) return { grade: 'D', color: 'from-[var(--neon-orange)] to-red-600', comment: '😬 Aïe... essaie le pressing la prochaine fois ?' }
    return { grade: 'F', color: 'from-[var(--neon-pink)] to-red-800', comment: '💀 Tes vêtements ont porté plainte. RIP.' }
  }, [state.score])

  const results = useMemo(() => [
    { icon: '🎯', label: 'Score final', value: state.score, color: 'var(--neon-yellow)' },
    { icon: '🧦', label: 'Tri correct', value: `${state.sortCorrect}/${state.sortTotal}`, color: 'var(--neon-green)' },
    { icon: '💥', label: 'Taches éliminées', value: state.stainScore, color: 'var(--neon-blue)' },
    { icon: '☀️', label: 'Séchage', value: `${state.dryPercent}%`, color: 'var(--neon-orange)' },
    { icon: '👔', label: 'Pliages', value: `${state.foldScore}/${state.foldTotal}`, color: 'var(--neon-pink)' },
    { icon: '🔥', label: 'Repassage', value: `${state.ironScore}/${state.ironTotal}`, color: 'var(--neon-yellow)' },
    { icon: '⚡', label: 'Max Combo', value: `x${state.maxCombo}`, color: 'var(--neon-blue)' },
    { icon: '🧦', label: 'Chaussettes perdues', value: state.sockLost, color: 'var(--neon-pink)' },
    { icon: '🎲', label: 'Événements', value: state.events, color: 'var(--neon-orange)' },
  ], [state])

  // Stagger reveal
  useEffect(() => {
    const timer = setInterval(() => {
      setRevealedCards(prev => {
        if (prev >= results.length) {
          clearInterval(timer)
          return prev
        }
        return prev + 1
      })
    }, 120)
    return () => clearInterval(timer)
  }, [results.length])

  // Random quiz after results
  const quiz = useMemo(() =>
    QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)]
  , [])

  // Random tip
  const tip = useMemo(() =>
    LAUNDRY_TIPS[Math.floor(Math.random() * LAUNDRY_TIPS.length)]
  , [])

  return (
    <div className="screen-enter text-center px-4 py-6">
      <h2 className="font-bangers text-3xl text-[var(--neon-yellow)] mb-2">
        {gameMode === 'daily' ? '📅 Lessive du Jour — Terminée !' : '🏆 Lessive Terminée !'}
      </h2>

      {/* Grade */}
      <div
        className={`font-bangers text-7xl my-3 bg-gradient-to-br ${color} bg-clip-text text-transparent leading-none`}
      >
        {grade}
      </div>
      <p className="text-sm text-white/50 mb-5">{comment}</p>

      {/* Results grid */}
      <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto mb-6">
        {results.map((r, i) => (
          <div
            key={i}
            className="glass p-3 transition-all duration-300"
            style={{
              opacity: i < revealedCards ? 1 : 0,
              transform: i < revealedCards ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <span className="text-xl">{r.icon}</span>
            <div className="text-[0.55rem] text-white/40 mt-1">{r.label}</div>
            <div className="font-pixel text-xs mt-0.5" style={{ color: r.color }}>{r.value}</div>
          </div>
        ))}
      </div>

      {/* Tip card */}
      <div className="glass p-4 max-w-md mx-auto mb-4 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">💡</span>
          <span className="font-semibold text-sm text-[var(--neon-blue)]">Le savais-tu ?</span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">{tip.text}</p>
      </div>

      {/* Mini quiz */}
      {!showQuiz ? (
        <button
          onClick={() => setShowQuiz(true)}
          className="glass px-6 py-2.5 text-sm cursor-pointer border-2 border-[var(--neon-green)] text-[var(--neon-green)] mb-4 active:scale-95 transition-transform"
        >
          🧠 Quiz bonus (+50 pts) !
        </button>
      ) : (
        <div className="glass p-4 max-w-md mx-auto mb-4 text-left">
          <p className="text-sm font-semibold mb-3">{quiz.question}</p>
          <div className="space-y-2">
            {quiz.answers.map((ans, i) => (
              <button
                key={i}
                onClick={() => setQuizAnswer(i)}
                disabled={quizAnswer !== null}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all cursor-pointer
                  ${quizAnswer === null ? 'glass hover:border-[var(--neon-blue)]' : ''}
                  ${quizAnswer !== null && i === quiz.correct ? 'bg-[rgba(0,255,135,0.15)] border-2 border-[var(--neon-green)]' : ''}
                  ${quizAnswer === i && i !== quiz.correct ? 'bg-[rgba(255,0,110,0.15)] border-2 border-[var(--neon-pink)]' : ''}
                  ${quizAnswer !== null && i !== quiz.correct && quizAnswer !== i ? 'opacity-40' : ''}
                `}
              >
                {ans}
              </button>
            ))}
          </div>
          {quizAnswer !== null && (
            <p className="text-xs text-white/50 mt-3 leading-relaxed">
              {quizAnswer === quiz.correct ? '✅ Correct ! +50 pts' : '❌ Raté !'} — {quiz.explanation}
            </p>
          )}
        </div>
      )}

      {/* Share placeholder */}
      {/* TODO: Generate share image with html-to-image */}
      {/* TODO: Web Share API integration for TikTok/Instagram */}
      <div className="glass p-3 max-w-md mx-auto mb-4 opacity-40 text-center">
        <p className="text-xs text-white/40">📱 Partage ton score (bientôt disponible !)</p>
      </div>

      {/* Level info (free play only) */}
      {gameMode === 'free' && (() => {
        const maxScore = 2000
        const pct = (state.score / maxScore) * 100
        const willLevelUp = pct >= 40
        return (
          <div className="glass p-3 max-w-md mx-auto mb-4 text-center">
            <p className="text-xs text-white/50">
              {willLevelUp
                ? `🎉 Niveau ${state.level + 1} débloqué ! Les lessives deviennent plus corsées...`
                : `😤 Niveau ${state.level} — Pas assez bien pour passer au suivant ! Réessaie !`
              }
            </p>
          </div>
        )
      })()}

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onReplay}
          className="px-10 py-3.5 border-none rounded-full bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-orange)] text-white font-bangers text-xl cursor-pointer tracking-wider shadow-[0_0_30px_rgba(255,0,110,0.3)] active:scale-95 hover:scale-105 transition-transform"
        >
          {gameMode === 'daily' ? '📅 RÉESSAYER (lessive du jour)' : '🔄 RELANCER UNE LESSIVE !'}
        </button>

        {onMenu && (
          <button
            onClick={onMenu}
            className="text-sm text-white/30 cursor-pointer hover:text-white/60 transition-colors underline"
          >
            ← Retour au menu
          </button>
        )}
      </div>
    </div>
  )
}
