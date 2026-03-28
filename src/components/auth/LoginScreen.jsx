// ============================================================
// LOGIN SCREEN
// Shown when user needs to authenticate.
// Google + Apple + Anonymous (play without account).
// Full-screen centered layout for mobile.
// ============================================================
import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext'

export default function LoginScreen({ onSkip }) {
  const { signInWithGoogle, signInWithApple, signInAnonymously, isConfigured, loading } = useAuth()
  const [signingIn, setSigningIn] = useState(false)

  const handleGoogle = async () => {
    setSigningIn(true)
    await signInWithGoogle()
  }

  const handleApple = async () => {
    setSigningIn(true)
    await signInWithApple()
  }

  const handleAnonymous = async () => {
    setSigningIn(true)
    await signInAnonymously()
    setSigningIn(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4" style={{ animation: 'spin 1s linear infinite' }}>🫧</span>
          <p className="text-white/40 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-enter flex-1 flex flex-col items-center justify-between px-6 py-6">

      {/* Top spacer + icon */}
      <div className="flex-1 flex items-end justify-center pb-4">
        <span className="text-8xl block" style={{ animation: 'bounce 2s ease-in-out infinite' }}>
          🧺
        </span>
      </div>

      {/* Center: title + buttons */}
      <div className="w-full max-w-sm">
        <h2 className="font-bangers text-3xl text-[var(--neon-blue)] text-center mb-1">Connexion</h2>
        <p className="text-sm text-white/40 text-center mb-6">
          Connecte-toi pour sauvegarder tes scores !
        </p>

        <div className="space-y-3">
          {isConfigured ? (
            <>
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={signingIn}
                className="w-full glass px-6 py-4 text-base cursor-pointer border-2 border-white/20 hover:border-[var(--neon-blue)] active:scale-95 transition-all flex items-center justify-center gap-3 rounded-2xl disabled:opacity-40"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-white/80 font-semibold">Continuer avec Google</span>
              </button>

              {/* Apple */}
              <button
                onClick={handleApple}
                disabled={signingIn}
                className="w-full glass px-6 py-4 text-base cursor-pointer border-2 border-white/20 hover:border-[var(--neon-blue)] active:scale-95 transition-all flex items-center justify-center gap-3 rounded-2xl disabled:opacity-40"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-white/80 font-semibold">Continuer avec Apple</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-xs text-white/25">ou</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Anonymous */}
              <button
                onClick={handleAnonymous}
                disabled={signingIn}
                className="w-full glass px-6 py-3.5 text-base cursor-pointer border-2 border-white/10 hover:border-[var(--neon-yellow)] active:scale-95 transition-all rounded-2xl disabled:opacity-40"
              >
                <span className="text-white/60">🎮 Jouer en invité</span>
              </button>
              <p className="text-xs text-white/20 text-center">Tes scores ne seront pas sauvegardés</p>
            </>
          ) : (
            <div className="glass p-5 text-center rounded-2xl">
              <p className="text-sm text-white/40 leading-relaxed">
                🔧 Backend non configuré — mode local activé
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: skip link */}
      <div className="flex-1 flex items-end justify-center pt-6 pb-4">
        <button
          onClick={onSkip}
          className="text-sm text-white/30 underline cursor-pointer hover:text-white/50 transition-colors"
        >
          Jouer sans compte →
        </button>
      </div>
    </div>
  )
}
