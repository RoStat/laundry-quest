export default function StatsBar({ score, level, lives, combo }) {
  return (
    <div className="relative z-10 flex justify-center gap-3 px-4 py-2 flex-wrap">
      <StatBox label="Score" value={score} color="var(--neon-yellow)" />
      <StatBox label="Niveau" value={level} color="var(--neon-green)" />
      <StatBox label="Vies" value={lives > 0 ? '❤️'.repeat(lives) : '💀'} color="var(--neon-pink)" isEmoji />
      <StatBox label="Combo" value={`x${combo}`} color="var(--neon-blue)" />
    </div>
  )
}

function StatBox({ label, value, color, isEmoji }) {
  return (
    <div className="glass px-4 py-2 text-center min-w-[80px]">
      <div className="text-[0.6rem] uppercase tracking-widest text-white/40">{label}</div>
      <div
        className={isEmoji ? 'text-sm mt-0.5' : 'font-pixel text-base mt-0.5'}
        style={isEmoji ? {} : { color }}
      >
        {value}
      </div>
    </div>
  )
}
