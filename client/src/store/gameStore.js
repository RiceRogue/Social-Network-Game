import { create } from 'zustand'

const HEAD_ICONS = [
  { id: 'Belle',   label: 'Belle',   color: '#FFD700' },
  { id: 'Chris',   label: 'Chris',   color: '#6B8EFF' },
  { id: 'Cookie',  label: 'Cookie',  color: '#C4944A' },
  { id: 'Del',     label: 'Del',     color: '#FF69D6' },
  { id: 'Flora',   label: 'Flora',   color: '#B39DDB' },
  { id: 'Kap',     label: 'Kap',     color: '#6B5CFF' },
  { id: 'Luna',    label: 'Luna',    color: '#1A1A6E' },
  { id: 'Owen',    label: 'Owen',    color: '#29A8E0' },
  { id: 'Sunny',   label: 'Sunny',   color: '#F5A623' },
  { id: 'Xavier',  label: 'Xavier',  color: '#32A84A' },
]

const REPUTATION_TITLES = [
  { threshold: 0,    label: 'Newcomer',          tier: 'bronze' },
  { threshold: 100,  label: 'The Rising Signal',  tier: 'silver' },
  { threshold: 500,  label: 'The Heavy Ego',      tier: 'gold' },
  { threshold: 1000, label: 'The Selfless Anchor', tier: 'platinum' },
  { threshold: 2500, label: 'The Gravity Well',   tier: 'diamond' },
]

function getTitle(rep) {
  let title = REPUTATION_TITLES[0]
  for (const t of REPUTATION_TITLES) {
    if (rep >= t.threshold) title = t
  }
  return title
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('social-network-profile')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const saved = loadFromStorage()

export const useGameStore = create((set, get) => ({
  // Profile
  profile: saved,
  headIcons: HEAD_ICONS,
  reputationTitles: REPUTATION_TITLES,

  setProfile: (profile) => {
    localStorage.setItem('social-network-profile', JSON.stringify(profile))
    set({ profile })
  },

  clearProfile: () => {
    localStorage.removeItem('social-network-profile')
    set({ profile: null })
  },

  // Reputation / title system
  reputation: saved?.reputation ?? 0,
  get statusTitle() {
    return getTitle(get().reputation).label
  },

  setReputation: (rep) => {
    set({ reputation: rep })
    const profile = get().profile
    if (profile) {
      const updated = { ...profile, reputation: rep }
      localStorage.setItem('social-network-profile', JSON.stringify(updated))
      set({ profile: updated })
    }
  },

  // Expose via console for testing
  _setTitle: (label) => {
    console.log(`%c[Identity] Status title overridden → "${label}"`, 'color:#FFD700')
    set({ _titleOverride: label })
  },
  _titleOverride: null,

  // Players in hub (from socket)
  otherPlayers: {},
  setOtherPlayers: (players) => set({ otherPlayers: players }),
  updateOtherPlayer: (id, data) =>
    set((s) => ({ otherPlayers: { ...s.otherPlayers, [id]: data } })),
  removeOtherPlayer: (id) =>
    set((s) => {
      const next = { ...s.otherPlayers }
      delete next[id]
      return { otherPlayers: next }
    }),

  // Chat
  messages: [],
  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages.slice(-99), msg] })),

  // Matchmaking
  inQueue: false,
  matchFound: false,
  setInQueue: (v) => set({ inQueue: v }),
  setMatchFound: (v) => set({ matchFound: v }),
}))

// Expose to browser console for reputation testing
if (typeof window !== 'undefined') {
  window.setReputation = (n) => useGameStore.getState().setReputation(n)
  window.setTitle = (label) => useGameStore.getState()._setTitle(label)
  console.log('%c[Social Network] Dev tools: window.setReputation(500) | window.setTitle("The Heavy Ego")', 'color:#00FFFF')
}

export { HEAD_ICONS, REPUTATION_TITLES, getTitle }
