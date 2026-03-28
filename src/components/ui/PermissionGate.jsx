import { useState, useEffect, useCallback } from 'react'
import { requestMotionPermission, requestOrientationPermission } from '../../hooks/useDeviceInteractions'

/**
 * PermissionGate — shown once on first game start.
 * Requests gyroscope/accelerometer + microphone permissions upfront,
 * activates Wake Lock, and locks orientation to portrait.
 */
export default function PermissionGate({ onReady }) {
  const [step, setStep] = useState('intro') // intro | requesting | done
  const [permissions, setPermissions] = useState({
    motion: null,    // null | true | false
    orientation: null,
    mic: null,
  })

  // Lock screen orientation to portrait
  useEffect(() => {
    const lockPortrait = async () => {
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('portrait-primary')
        }
      } catch (e) {
        // Not supported or not in fullscreen — fallback via CSS
      }
    }
    lockPortrait()
  }, [])

  // Wake Lock — keep screen awake
  useEffect(() => {
    let wakeLock = null
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch (e) {
        // Not supported or denied
      }
    }
    requestWakeLock()

    // Re-acquire on visibility change
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      if (wakeLock) wakeLock.release()
    }
  }, [])

  const requestAll = useCallback(async () => {
    setStep('requesting')

    // 1. Motion (accelerometer/gyroscope)
    const motionOk = await requestMotionPermission()
    setPermissions(p => ({ ...p, motion: motionOk }))

    // 2. Orientation
    const orientOk = await requestOrientationPermission()
    setPermissions(p => ({ ...p, orientation: orientOk }))

    // 3. Microphone
    let micOk = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop()) // Release immediately
      micOk = true
    } catch (e) {
      micOk = false
    }
    setPermissions(p => ({ ...p, mic: micOk }))

    setStep('done')

    // Auto-continue after brief display
    setTimeout(() => onReady({ motion: motionOk, orientation: orientOk, mic: micOk }), 1200)
  }, [onReady])

  return (
    <div className="screen-enter flex flex-col items-center justify-center text-center px-6 py-8 min-h-[60vh]">
      {step === 'intro' && (
        <>
          <span className="text-7xl block mb-4" style={{ animation: 'bounce 2s ease-in-out infinite' }}>
            📱
          </span>
          <h2 className="font-bangers text-2xl text-[var(--neon-blue)] mb-2">
            Prépare ton smartphone !
          </h2>
          <p className="text-sm text-white/50 mb-6 max-w-xs leading-relaxed">
            Ce jeu utilise le <strong className="text-white/80">gyroscope</strong> pour trier le linge
            et le <strong className="text-white/80">micro</strong> pour souffler sur le linge.
            On va te demander les autorisations une bonne fois pour toutes !
          </p>

          <div className="glass p-4 mb-6 max-w-xs w-full text-left space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="text-sm font-semibold text-white/80">Gyroscope & Accéléromètre</p>
                <p className="text-xs text-white/40">Incliner pour trier, secouer pour essorer</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎤</span>
              <div>
                <p className="text-sm font-semibold text-white/80">Microphone</p>
                <p className="text-xs text-white/40">Souffler pour sécher le linge</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="text-sm font-semibold text-white/80">Écran toujours allumé</p>
                <p className="text-xs text-white/40">Pas de mise en veille pendant le jeu</p>
              </div>
            </div>
          </div>

          <button
            onClick={requestAll}
            className="font-bangers text-xl px-10 py-4 border-none rounded-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-green)] text-white cursor-pointer tracking-wider shadow-[0_0_25px_rgba(0,212,255,0.3)] active:scale-95 hover:scale-105 transition-transform"
          >
            AUTORISER ET JOUER !
          </button>

          <button
            onClick={() => onReady({ motion: false, orientation: false, mic: false })}
            className="mt-3 text-xs text-white/25 cursor-pointer hover:text-white/40 transition-colors"
          >
            Passer sans capteurs
          </button>
        </>
      )}

      {step === 'requesting' && (
        <>
          <span className="text-6xl block mb-4" style={{ animation: 'pulse 1s ease-in-out infinite' }}>
            ⏳
          </span>
          <p className="text-sm text-white/50">Accepte les autorisations qui s'affichent...</p>
        </>
      )}

      {step === 'done' && (
        <>
          <span className="text-6xl block mb-4">
            {permissions.motion && permissions.mic ? '✅' : '⚠️'}
          </span>
          <div className="space-y-2 mb-4">
            <PermLine label="Gyroscope" ok={permissions.motion} />
            <PermLine label="Orientation" ok={permissions.orientation} />
            <PermLine label="Microphone" ok={permissions.mic} />
          </div>
          <p className="text-xs text-white/30">C'est parti !</p>
        </>
      )}
    </div>
  )
}

function PermLine({ label, ok }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>{ok ? '✅' : '❌'}</span>
      <span className={ok ? 'text-[var(--neon-green)]' : 'text-white/40'}>{label}</span>
      <span className="text-xs text-white/20">{ok ? 'OK' : 'Non disponible'}</span>
    </div>
  )
}
