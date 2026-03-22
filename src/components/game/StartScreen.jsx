import { useState } from 'react'
import { requestMotionPermission, requestOrientationPermission } from '../../hooks/useDeviceInteractions'

export default function StartScreen({ onStart }) {
  const [permissionsGranted, setPermissionsGranted] = useState(false)

  const handleStart = async () => {
    // Request device permissions (needed for iOS)
    await requestMotionPermission()
    await requestOrientationPermission()
    setPermissionsGranted(true)
    onStart()
  }

  return (
    <div className="screen-enter text-center px-5 py-8">
      <span className="text-8xl block my-5" style={{ animation: 'bounce 2s ease-in-out infinite' }}>
        🫧
      </span>

      <button
        onClick={handleStart}
        className="font-bangers text-2xl px-12 py-4 border-none rounded-full bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-orange)] text-white cursor-pointer tracking-wider shadow-[0_0_30px_rgba(255,0,110,0.3)] active:scale-95 hover:scale-105 transition-transform"
      >
        LANCER UNE LESSIVE !
      </button>

      <div className="mt-6 glass p-5 text-left max-w-lg mx-auto">
        <h3 className="font-bangers text-[var(--neon-blue)] text-xl mb-3">📋 Comment jouer ?</h3>

        <div className="space-y-2.5 text-sm text-white/65 leading-relaxed">
          <p>🧦 <strong className="text-white/90">Phase 1 — Tri :</strong> Incline ton téléphone ou tape pour trier les vêtements dans les bons paniers !</p>
          <p>🧴 <strong className="text-white/90">Phase 2 — Lavage :</strong> Choisis la bonne lessive et température. Puis frotte l'écran pour détacher !</p>
          <p>☀️ <strong className="text-white/90">Phase 3 — Séchage :</strong> Souffle dans le micro ou secoue ton téléphone pour sécher le linge !</p>
          <p>👔 <strong className="text-white/90">Phase 4 — Pliage :</strong> Reproduis les séquences de plis au bon timing !</p>
          <p>🔥 <strong className="text-white/90">Phase 5 — Repassage :</strong> Swipe pour repasser ! Précision = méga combo !</p>
          <p>⚡ <strong className="text-white/90">Événements aléatoires :</strong> Chaussettes disparues, chat dans la machine, pièces cachées…</p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-xs text-white/30">📱 Pour la meilleure expérience, joue sur smartphone !</p>
          <p className="text-xs text-white/20 mt-1">*Aucun vêtement n'a été maltraité pendant le développement de ce jeu.</p>
        </div>
      </div>
    </div>
  )
}
