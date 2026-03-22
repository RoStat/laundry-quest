export default function EventPopup({ event, onClose }) {
  if (!event) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[998]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] glass border-2 border-[var(--neon-pink)] rounded-2xl p-8 text-center max-w-[380px] w-[90%] shadow-[0_0_60px_rgba(255,0,110,0.3)] animate-[bounce_0.3s_ease-out]">
        <span className="text-6xl block mb-3">{event.icon}</span>
        <h3 className="font-bangers text-xl text-[var(--neon-orange)] mb-2">{event.title}</h3>
        <p className="text-sm text-white/60 mb-5">{event.text}</p>
        <button
          onClick={onClose}
          className="px-8 py-2.5 border-none rounded-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-green)] text-white font-semibold text-sm cursor-pointer active:scale-95 transition-transform"
        >
          OK !
        </button>
      </div>
    </>
  )
}
