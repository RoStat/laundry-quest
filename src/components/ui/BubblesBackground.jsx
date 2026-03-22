import { useMemo } from 'react'

export default function BubblesBackground() {
  const bubbles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size: 10 + Math.random() * 50,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 14,
      delay: Math.random() * 10,
    })), [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {bubbles.map(b => (
        <div
          key={b.id}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(0,212,255,0.04))',
            border: '1px solid rgba(255,255,255,0.06)',
            animation: `floatUp ${b.duration}s ${b.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  )
}
