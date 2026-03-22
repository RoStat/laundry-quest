// ============================================================
// MODE SELECTION SCREEN
// Choose between: Free Play, Daily Challenge, or Leaderboard
// ============================================================
import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { getDailyChallengeInfo, getTodayKey } from '../../lib/dailyChallenge'

export default function ModeSelect({ onFreePlay, onDaily, onLeaderboard, onProfile }) {
  const { user, profile, isAuthenticated, isAnonymous, signOut, linkToGoogle } = useAuth()
  const [dailyInfo, setDailyInfo] = useState(null)

  useEffect(() => {
    getDailyChallengeInfo(user?.id).then(setDailyInfo)
  }, [user])

  const todayLabel = (() => {
    const d = new Date()
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  })()

  return (
    <div className="screen-enter text-center px-5 py-6">
      {/* User greeting */}
      {isAuthenticated && (
        <div className="glass p-3 mb-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--neon-blue)] flex items-center justify-center text-sm">
                {isAnonymous ? '🎮' : '👤'}
              </div>
            )}
            <div className="text-left">
              <div className="text-sm font-semibold text-white/80">
                {isAnonymous ? 'Invité' : (profile?.username || 'Joueur')}
              </div>
              <div className="text-[0.6rem] text-white/30">
                Niveau {profile?.level || 1} — {profile?.total_score || 0} pts
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isAnonymous && (
              <button
                onClick={linkToGoogle}
                className="text-[0.6rem] text-[var(--neon-green)] underline cursor-pointer"
              >
                Créer un compte
              </button>
            )}
            <button
              onClick={signOut}
              className="text-[0.6rem] text-white/25 cursor-pointer hover:text-white/50"
            >
              Déco
            </button>
          </div>
        </div>
      )}

      <span className="text-6xl block my-3" style={{ animation: 'bounce 2s ease-in-out infinite' }}>
        🫧
      </span>

      <div className="max-w-md mx-auto space-y-3 mt-4">
        {/* Free Play */}
        <button
          onClick={onFreePlay}
          className="w-full font-bangers text-xl px-8 py-4 border-none rounded-2xl bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-orange)] text-white cursor-pointer tracking-wider shadow-[0_0_30px_rgba(255,0,110,0.3)] active:scale-95 hover:scale-105 transition-transform"
        >
          🧺 MODE LIBRE
          <span className="block text-[0.65rem] font-normal tracking-normal opacity-70 mt-0.5">
            Joue sans limite — progresse à ton rythme
          </span>
        </button>

        {/* Daily Challenge */}
        <button
          onClick={dailyInfo?.canPlay ? onDaily : undefined}
          disabled={dailyInfo && !dailyInfo.canPlay}
          className={`w-full font-bangers text-xl px-8 py-4 border-2 rounded-2xl cursor-pointer tracking-wider active:scale-95 hover:scale-105 transition-all
            ${dailyInfo?.canPlay
              ? 'border-[var(--neon-yellow)] text-[var(--neon-yellow)] glass shadow-[0_0_20px_rgba(255,210,0,0.15)]'
              : 'border-white/10 text-white/30 glass opacity-50 cursor-not-allowed hover:scale-100'
            }
          `}
        >
          📅 LESSIVE DU JOUR
          <span className="block text-[0.65rem] font-normal tracking-normal opacity-70 mt-0.5">
            {todayLabel}
          </span>
          {dailyInfo && (
            <span className="block text-[0.55rem] font-normal tracking-normal mt-1">
              {dailyInfo.canPlay
                ? `${dailyInfo.attemptsMax - dailyInfo.attemptsUsed} essai${dailyInfo.attemptsMax - dailyInfo.attemptsUsed > 1 ? 's' : ''} restant${dailyInfo.attemptsMax - dailyInfo.attemptsUsed > 1 ? 's' : ''}`
                : `Plus d'essais ! Meilleur : ${dailyInfo.bestScore} pts`
              }
              {dailyInfo.attemptsUsed > 0 && dailyInfo.canPlay
                ? ` — Record : ${dailyInfo.bestScore} pts`
                : ''
              }
            </span>
          )}
        </button>

        {/* Leaderboard placeholder */}
        <button
          onClick={onLeaderboard}
          className="w-full glass px-8 py-3 border-2 border-white/10 rounded-2xl cursor-pointer text-white/50 hover:border-[var(--neon-blue)] hover:text-[var(--neon-blue)] active:scale-95 transition-all"
        >
          <span className="font-bangers text-lg">🏆 Classement</span>
          <span className="block text-[0.6rem] font-normal opacity-50 mt-0.5">
            Bientôt disponible
          </span>
        </button>
      </div>

      {/* How to play */}
      <div className="mt-5 glass p-4 text-left max-w-md mx-auto">
        <h3 className="font-bangers text-[var(--neon-blue)] text-lg mb-2">📋 Comment jouer ?</h3>
        <div className="space-y-1.5 text-[0.7rem] text-white/55 leading-relaxed">
          <p>🧦 <strong className="text-white/80">Tri :</strong> Incline ou tape pour trier dans les bons paniers</p>
          <p>🧴 <strong className="text-white/80">Lavage :</strong> Choisis la lessive, frotte les taches</p>
          <p>☀️ <strong className="text-white/80">Séchage :</strong> Souffle dans le micro ou secoue</p>
          <p>👔 <strong className="text-white/80">Pliage :</strong> Reproduis les séquences</p>
          <p>🔥 <strong className="text-white/80">Repassage :</strong> Timing parfait !</p>
        </div>

        <div className="mt-3 pt-2 border-t border-white/10">
          <p className="text-[0.6rem] text-white/25">📱 Meilleur sur smartphone • 🎯 5 phases • ♾️ Niveaux infinis</p>
        </div>
      </div>
    </div>
  )
}
