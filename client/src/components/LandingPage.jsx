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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold tracking-tight mb-2">
            <span className="text-cyan-400 glow-cyan">SOCIAL</span>
            <span className="text-white"> NETWORK</span>
          </h1>
          <p className="text-slate-500 text-sm tracking-widest uppercase">Identity Economy Hub</p>
        </div>

        <div className="bg-[#12131a] border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-1">Create Your Identity</h2>
          <p className="text-slate-500 text-sm mb-6">Choose your icon and enter the hub.</p>

          {/* Character Grid */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {HEAD_ICONS.map((icon) => (
              <button
                key={icon.id}
                onClick={() => setSelected(icon)}
                className={`
                  flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-150
                  ${selected?.id === icon.id
                    ? 'border-cyan-400 scale-105 shadow-[0_0_12px_rgba(0,255,255,0.25)]'
                    : 'border-slate-700 hover:border-slate-500'}
                `}
                style={{
                  background: selected?.id === icon.id ? `${icon.color}18` : 'rgba(30,32,42,0.4)',
                }}
              >
                {/* Black background tile with PNG */}
                <div
                  className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{
                    background: '#000',
                    boxShadow: selected?.id === icon.id
                      ? `0 0 0 2px ${icon.color}, 0 0 10px ${icon.color}66`
                      : `0 0 0 1px ${icon.color}33`,
                  }}
                >
                  <img
                    src={`/Social-Network-Game/assets/heads/CharacterIcons-${icon.id}.png`}
                    alt={icon.label}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: icon.color }}>{icon.label}</span>
              </button>
            ))}
          </div>

          {/* Selected preview */}
          {selected && (
            <div className="flex items-center gap-3 p-3 rounded-xl mb-4 border border-slate-700"
              style={{ background: `${selected.color}10` }}>
              <div
                className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
                style={{ background: '#000', boxShadow: `0 0 0 2px ${selected.color}` }}
              >
                <img
                  src={`/Social-Network-Game/assets/heads/${selected.id}.png`}
                  alt={selected.label}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: selected.color }}>{selected.label}</p>
                <p className="text-slate-500 text-xs">Ready to enter the hub</p>
              </div>
              <div
                className="ml-auto w-2 h-2 rounded-full shrink-0"
                style={{ background: selected.color, boxShadow: `0 0 6px ${selected.color}` }}
              />
            </div>
          )}

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

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

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
