import { useEffect, useState } from 'react'

const COLORS = {
  success: 'border-[var(--neon-green)] text-[var(--neon-green)] shadow-[0_0_20px_rgba(0,255,135,0.25)]',
  error: 'border-[var(--neon-pink)] text-[var(--neon-pink)] shadow-[0_0_20px_rgba(255,0,110,0.25)]',
  info: 'border-[var(--neon-blue)] text-[var(--neon-blue)] shadow-[0_0_20px_rgba(0,212,255,0.25)]',
  warning: 'border-[var(--neon-orange)] text-[var(--neon-orange)] shadow-[0_0_20px_rgba(251,86,7,0.25)]',
}

export default function Toast({ toast }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toast) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [toast])

  if (!toast) return null

  return (
    <div
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-[999]
        glass px-8 py-4 text-base font-bold
        text-center max-w-[90vw]
        border-2 rounded-2xl
        transition-all duration-300
        ${COLORS[toast.type] || COLORS.info}
        ${visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
      `}
    >
      {toast.message}
    </div>
  )
}
