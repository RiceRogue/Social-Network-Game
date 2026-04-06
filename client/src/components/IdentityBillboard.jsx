import { Html } from '@react-three/drei'
import { useGameStore, getTitle } from '../store/gameStore'

const TIER_COLORS = {
  bronze:   '#CD7F32',
  silver:   '#C0C0C0',
  gold:     '#FFD700',
  platinum: '#E5E4E2',
  diamond:  '#B9F2FF',
}

/**
 * IdentityBillboard — always faces the camera (billboard), rendered via @react-three/drei's Html.
 * Sits above the character sprite in world space.
 *
 * Props:
 *   username    {string}  - displayed in cyan
 *   reputation  {number}  - determines statusTitle tier
 *   titleOverride {string|null} - dev override set via window.setTitle()
 *   yOffset     {number}  - vertical offset above sprite (default 1.6)
 */
export default function IdentityBillboard({
  username,
  reputation = 0,
  titleOverride = null,
  yOffset = 1.6,
}) {
  const titleData = getTitle(reputation)
  const displayTitle = titleOverride ?? titleData.label
  const tierColor = TIER_COLORS[titleData.tier] ?? '#FFD700'

  return (
    <Html
      position={[0, yOffset, 0]}
      center
      occlude={false}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div className="flex flex-col items-center gap-0.5" style={{ whiteSpace: 'nowrap' }}>
        {/* Status title — yellow with tier glow */}
        <span
          style={{
            color: tierColor,
            fontSize: '10px',
            fontWeight: 600,
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: '0.05em',
            textShadow: `0 0 8px ${tierColor}99, 0 0 16px ${tierColor}44`,
            textTransform: 'uppercase',
          }}
        >
          {displayTitle}
        </span>

        {/* Username — cyan */}
        <span
          style={{
            color: '#00FFFF',
            fontSize: '12px',
            fontWeight: 700,
            fontFamily: 'system-ui, sans-serif',
            textShadow: '0 0 8px rgba(0,255,255,0.8), 0 0 16px rgba(0,255,255,0.4)',
          }}
        >
          {username}
        </span>
      </div>
    </Html>
  )
}
