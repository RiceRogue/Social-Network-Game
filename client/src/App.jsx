import { useGameStore } from './store/gameStore'
import LandingPage from './components/LandingPage'
import HubWorld from './components/HubWorld'

export default function App() {
  const profile = useGameStore((s) => s.profile)
  return profile ? <HubWorld /> : <LandingPage />
}
