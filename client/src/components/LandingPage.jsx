import { useState } from 'react'
import { useGameStore, HEAD_ICONS } from '../store/gameStore'

const BASE = import.meta.env.BASE_URL

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
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl flex flex-col gap-8">

        {/* Header */}
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold tracking-tight mb-4 text-white">
            social network
          </h1>
          <p className="text-slate-500 text-xs tracking-[0.35em] uppercase">Identity Economy</p>
        </div>

        {/* Character select card */}
        <div className="bg-[#12131a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-b border-slate-800">
            <h2 className="text-white font-semibold text-base mb-1">Choose your identity</h2>
            <p className="text-slate-500 text-xs">Select a character to represent you in the network.</p>
          </div>

          <div className="px-8 py-6">
            {/* Grid */}
            <div className="grid grid-cols-5 gap-3">
              {HEAD_ICONS.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => setSelected(icon)}
                  className={`
                    flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all duration-150
                    ${selected?.id === icon.id
                      ? 'border-cyan-400 scale-105 shadow-[0_0_14px_rgba(0,255,255,0.2)]'
                      : 'border-slate-800 hover:border-slate-600'}
                  `}
                  style={{ background: selected?.id === icon.id ? `${icon.color}18` : '#0d0e14' }}
                >
                  <div
                    className="w-12 h-12 rounded-lg overflow-hidden"
                    style={{
                      background: '#000',
                      boxShadow: selected?.id === icon.id
                        ? `0 0 0 2px ${icon.color}`
                        : `0 0 0 1px ${icon.color}33`,
                    }}
                  >
                    <img
                      src={`${BASE}assets/heads/CharacterIcons-${icon.id}.png`}
                      alt={icon.label}
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  </div>
                  <span className="text-white text-[10px] font-medium tracking-wide">
                    {icon.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected preview */}
          {selected && (
            <div className="mx-8 mb-6">
              <div
                className="flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-800"
                style={{ background: `${selected.color}0d` }}
              >
                <div
                  className="w-11 h-11 rounded-lg overflow-hidden shrink-0"
                  style={{ background: '#000', boxShadow: `0 0 0 2px ${selected.color}` }}
                >
                  <img
                    src={`${BASE}assets/heads/CharacterIcons-${selected.id}.png`}
                    alt={selected.label}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{selected.label}</p>
                  <p className="text-slate-500 text-xs">Ready to join the network</p>
                </div>
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: selected.color, boxShadow: `0 0 6px ${selected.color}` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Username card */}
        <div className="bg-[#12131a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-b border-slate-800">
            <h2 className="text-white font-semibold text-base mb-1">Set your username</h2>
            <p className="text-slate-500 text-xs">This is how others will see you.</p>
          </div>

          <div className="px-8 py-6 flex flex-col gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full bg-[#0d0e14] border border-slate-800 rounded-xl px-4 py-3 text-white text-sm
                         placeholder-slate-700 focus:outline-none focus:border-cyan-600 transition-colors"
            />

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={!selected || !username.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200
                         bg-cyan-500 hover:bg-cyan-400 text-black disabled:opacity-20 disabled:cursor-not-allowed
                         hover:shadow-[0_0_20px_rgba(0,255,255,0.35)]"
            >
              Enter the network →
            </button>
          </div>
        </div>

        <p className="text-center text-slate-800 text-xs px-4">
          Saved locally. No account required.
        </p>

      </div>
    </div>
  )
}
