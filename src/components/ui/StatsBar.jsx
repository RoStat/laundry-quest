export default function StatsBar({ score, level, lives, combo }) {
  return (
    <div className="relative z-10 flex justify-center gap-2 px-3 py-1 flex-wrap">
      <StatBox label="Score" value={score} color="var(--neon-yellow)" />
      <StatBox label="Niv." value={level} color="var(--neon-green)" />
      <StatBox label="Vies" value={lives > 0 ? '❤️'.repeat(lives) : '💀'} color="var(--neon-pink)" isEmoji />
      <StatBox label="Combo" value={`x${combo}`} color="var(--neon-blue)" />
    </div>
  )
}

function StatBox({ label, value, color, isEmoji }) {
  return (
    <div className="glass px-3 py-1.5 text-center min-w-[70px]">
      <div className="text-[0.5rem] uppercase tracking-widest text-white/40">{label}</div>
      <div
        className={isEmoji ? 'text-sm' : 'font-pixel text-sm'}
        style={isEmoji ? {} : { color }}
      >
        {value}
      </div>
    </div>
  )
}
