export default function TipCard({ tip, onClose }) {
  if (!tip) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[997]" onClick={onClose} />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[998] glass border-2 border-[var(--neon-blue)] rounded-2xl p-5 max-w-[360px] w-[90%] shadow-[0_0_30px_rgba(0,212,255,0.2)] screen-enter">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💡</span>
          <h4 className="font-bangers text-[var(--neon-blue)] text-base">{tip.title || 'Le savais-tu ?'}</h4>
        </div>
        <p className="text-xs text-white/65 leading-relaxed">{tip.text}</p>
        <button
          onClick={onClose}
          className="mt-3 px-5 py-1.5 text-xs rounded-full bg-[var(--accent)] text-white/60 cursor-pointer border border-white/10 active:scale-95 transition-transform"
        >
          Compris !
        </button>
      </div>
    </>
  )
}
