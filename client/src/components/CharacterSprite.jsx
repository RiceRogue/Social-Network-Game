import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import IdentityBillboard from './IdentityBillboard'
import HeadIcon from './HeadIcon'
import { HEAD_ICONS } from '../store/gameStore'

/**
 * CharacterSprite — 2.5D character rendered as a white icon card in 3D space.
 *
 * The head icon PNGs (white bg, bold shape) are displayed as HTML image elements
 * positioned in world space via @react-three/drei's <Html>. This preserves the
 * original icon aesthetic without needing transparent PNGs.
 *
 * Phase 3: Social Heartbeat — vertical bob + breathing scale via Math.sin()
 * Phase 2: Head-turn skew via CSS transform on movement direction
 */
export default function CharacterSprite({
  position = [0, 0, 0],
  username = 'Player',
  headId = 'blank',
  reputation = 0,
  titleOverride = null,
  moveDir = 0, // -1 left, 0 neutral, +1 right
}) {
  const groupRef = useRef()
  const bobRef = useRef(0)
  const skewRef = useRef(0)
  const scaleRef = useRef(1)
  const iconRef = useRef(null)

  const iconData = HEAD_ICONS.find(h => h.id === headId) ?? HEAD_ICONS[0]

  // ─── Phase 3: Social Heartbeat ────────────────────────────────────────────
  const BOB_FREQ = 1.4
  const BOB_AMP  = 0.055
  const BREATH_FREQ = 1.2
  const BREATH_AMP  = 0.035

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Vertical bob — group Y offset
    if (groupRef.current) {
      groupRef.current.position.set(
        position[0],
        position[1] + Math.sin(t * BOB_FREQ * Math.PI * 2) * BOB_AMP,
        position[2]
      )
    }

    // Breathing + head skew — applied via CSS on the Html element
    const breathScale = 1 + Math.sin(t * BREATH_FREQ * Math.PI * 2) * BREATH_AMP
    scaleRef.current = breathScale

    // Lerp skew toward movement direction
    const targetSkew = moveDir * 18 // degrees
    skewRef.current = skewRef.current + (targetSkew - skewRef.current) * 0.12

    if (iconRef.current) {
      const skew = skewRef.current
      iconRef.current.style.transform = `scaleY(${breathScale}) skewX(${-skew * 0.4}deg) scaleX(${1 + moveDir * 0.08})`
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <Html center occlude={false} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {/* Head icon — inline SVG, no files needed */}
          <div
            ref={iconRef}
            style={{
              transformOrigin: 'bottom center',
              boxShadow: `0 0 0 2px ${iconData.color}88, 0 4px 16px rgba(0,0,0,0.5)`,
              borderRadius: 8,
            }}
          >
            <HeadIcon headId={headId} color={iconData.color} size={52} />
          </div>
        </div>
      </Html>

      {/* Phase 2: Identity Billboard — floats above character */}
      <IdentityBillboard
        username={username}
        reputation={reputation}
        titleOverride={titleOverride}
        yOffset={1.1}
      />
    </group>
  )
}
