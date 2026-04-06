import { useState } from 'react'
import { useGameStore, HEAD_ICONS } from '../store/gameStore'

export default function LandingPage() {
  const { setProfile } = useGameStore()
  const [selected, setSelected] = useState(null)
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  function handleCreate() {
    if (!selected) return setError('Pick a character first!')
    if (!username.trim()) return setError('Enter a username!')
    if (username.trim().length < 2) return setError('Username must be at least 2 characters.')
    if (username.trim().length > 20) return setError('Username too long (max 20 chars).')
    setError('')
    setProfile({ headId: selected.id, username: username.trim(), reputation: 0 })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold tracking-tight mb-2">
            <span className="text-cyan-400 glow-cyan">SOCIAL</span>
            <span className="text-white"> NETWORK</span>
          </h1>
          <p className="text-slate-500 text-sm tracking-widest uppercase">Identity Economy Hub</p>
        </div>

        {/* Card */}
        <div className="bg-[#12131a] border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-1">Create Your Identity</h2>
          <p className="text-slate-500 text-sm mb-6">Choose your avatar and enter the hub.</p>

          {/* Character Grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {HEAD_ICONS.map((icon) => (
              <button
                key={icon.id}
                onClick={() => setSelected(icon)}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200
                  ${selected?.id === icon.id
                    ? 'border-cyan-400 bg-cyan-400/10 scale-105'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'}
                `}
              >
                {/* Avatar: uses head icon image if available, else colored circle */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl relative overflow-hidden"
                  style={{ background: `${icon.color}22`, border: `2px solid ${icon.color}66` }}
                >
                  {/* Drop CharacterIcons/[id].png into public/assets/ to use real sprites */}
                  <img
                    src={`/assets/heads/${icon.id}.png`}
                    alt={icon.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <span
                    className="absolute inset-0 items-center justify-center text-2xl"
                    style={{ display: 'none' }}
                  >{icon.emoji}</span>
                </div>
                <span className="text-xs text-slate-400 truncate w-full text-center">{icon.label}</span>
                {selected?.id === icon.id && (
                  <span className="text-cyan-400 text-[10px]">selected</span>
                )}
              </button>
            ))}
          </div>

          {/* Selected preview */}
          {selected && (
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg mb-4 border border-slate-700">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ background: `${selected.color}22`, border: `2px solid ${selected.color}` }}
              >
                {selected.emoji}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{selected.label}</p>
                <p className="text-slate-500 text-xs">Ready to enter the hub</p>
              </div>
            </div>
          )}

          {/* Username Input */}
          <div className="mb-4">
            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600
                         focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          {/* Enter button */}
          <button
            onClick={handleCreate}
            disabled={!selected || !username.trim()}
            className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200
                       bg-cyan-500 hover:bg-cyan-400 text-black disabled:opacity-30 disabled:cursor-not-allowed
                       hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]"
          >
            Enter the Hub →
          </button>
        </div>

        <p className="text-center text-slate-700 text-xs mt-4">
          Your identity is saved locally. No account required.
        </p>
      </div>
    </div>
  )
}
