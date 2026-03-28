import { useEffect, useRef } from 'react'

const PHASES = [
  { id: 'sort', label: 'Tri', icon: '🧦', number: 1 },
  { id: 'wash', label: 'Lavage', icon: '🧴', number: 2 },
  { id: 'dry', label: 'Séchage', icon: '☀️', number: 3 },
  { id: 'fold', label: 'Pliage', icon: '👔', number: 4 },
  { id: 'iron', label: 'Repassage', icon: '🔥', number: 5 },
]

export default function PhaseProgress({ currentPhase }) {
  const activeRef = useRef(null)

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [currentPhase])

  const currentIndex = PHASES.findIndex(p => p.id === currentPhase)
  if (currentIndex < 0) return null

  return (
    <div className="relative z-10 w-full px-2 py-2">
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-white/10 -translate-y-1/2 z-0" />
        {/* Filled connector line */}
        <div
          className="absolute top-1/2 left-[10%] h-[2px] -translate-y-1/2 z-0 transition-all duration-700 ease-out"
          style={{
            width: `${(currentIndex / (PHASES.length - 1)) * 80}%`,
            background: 'linear-gradient(90deg, var(--neon-green), var(--neon-blue))',
            boxShadow: '0 0 8px rgba(0,255,135,0.4)',
          }}
        />

        {PHASES.map((phase, i) => {
          const isDone = i < currentIndex
          const isCurrent = i === currentIndex
          const isFuture = i > currentIndex

          return (
            <div
              key={phase.id}
              ref={isCurrent ? activeRef : null}
              className="relative z-10 flex flex-col items-center"
              style={{ flex: '1 1 0' }}
            >
              {/* Circle */}
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-base
                  transition-all duration-500 ease-out
                  ${isDone ? 'bg-[rgba(0,255,135,0.2)] border-2 border-[var(--neon-green)] scale-90' : ''}
                  ${isCurrent ? 'border-2 border-[var(--neon-blue)] scale-110 shadow-[0_0_12px_rgba(0,212,255,0.5)]' : ''}
                  ${isFuture ? 'bg-[var(--accent)] border-2 border-white/10 opacity-40 scale-85' : ''}
                `}
                style={isCurrent ? {
                  background: 'rgba(0,212,255,0.15)',
                  animation: 'pulse 2.5s ease-in-out infinite',
                } : {}}
              >
                {isDone ? '✓' : phase.icon}
              </div>

              {/* Label */}
              <span
                className={`
                  text-[0.55rem] mt-1 font-semibold tracking-wide whitespace-nowrap
                  transition-all duration-300
                  ${isDone ? 'text-[var(--neon-green)]/60' : ''}
                  ${isCurrent ? 'text-[var(--neon-blue)]' : ''}
                  ${isFuture ? 'text-white/20' : ''}
                `}
              >
                {phase.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
