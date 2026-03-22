import { useEffect, useState } from 'react'

const COLORS = {
  success: 'border-[var(--neon-green)] text-[var(--neon-green)]',
  error: 'border-[var(--neon-pink)] text-[var(--neon-pink)]',
  info: 'border-[var(--neon-blue)] text-[var(--neon-blue)]',
  warning: 'border-[var(--neon-orange)] text-[var(--neon-orange)]',
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
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[999] glass px-6 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${COLORS[toast.type] || COLORS.info} ${visible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'}`}
    >
      {toast.message}
    </div>
  )
}
