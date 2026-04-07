import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import IdentityBillboard from './IdentityBillboard'
import { HEAD_ICONS } from '../store/gameStore'

/**
 * CharacterSprite
 *
 * Animations:
 * - Vertical bob: whole group Y oscillates via sin()
 * - Breathing: scaleY of icon via sin()
 * - Head-turn: when moving, skewX + scaleX shift to show direction
 *   When idle, a slow wandering sin() makes the head subtly look left/right
 */
export default function CharacterSprite({
  position = [0, 0, 0],
  username = 'Player',
  headId = 'Belle',
  reputation = 0,
  titleOverride = null,
  moveDir = 0,
}) {
  const groupRef = useRef()
  const iconRef  = useRef(null)
  const skewRef  = useRef(0)        // current skew degrees (lerped)
  const offsetRef = useRef(Math.random() * Math.PI * 2) // unique phase per character

  const iconData = HEAD_ICONS.find(h => h.id === headId) ?? HEAD_ICONS[0]

  const BOB_FREQ    = 1.3
  const BOB_AMP     = 0.05
  const BREATH_FREQ = 1.1
  const BREATH_AMP  = 0.03
  // Idle head wander — slow sin look-around when not moving
  const WANDER_FREQ = 0.22   // Hz, slow and natural
  const WANDER_AMP  = 12     // degrees max

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const phase = offsetRef.current

    // ── Vertical bob (whole group) ─────────────────────────────────────────
    if (groupRef.current) {
      groupRef.current.position.set(
        position[0],
        position[1] + Math.sin(t * BOB_FREQ * Math.PI * 2 + phase) * BOB_AMP,
        position[2]
      )
    }

    if (!iconRef.current) return

    // ── Breathing (scaleY) ────────────────────────────────────────────────
    const breathScale = 1 + Math.sin(t * BREATH_FREQ * Math.PI * 2 + phase) * BREATH_AMP

    // ── Head turn target ──────────────────────────────────────────────────
    // When moving: skew toward movement direction
    // When idle: wander slowly via sin(), unique phase per character
    let targetSkew
    if (moveDir !== 0) {
      targetSkew = moveDir * 20
    } else {
      targetSkew = Math.sin(t * WANDER_FREQ * Math.PI * 2 + phase) * WANDER_AMP
    }

    // Lerp toward target — faster when moving, slower when idle wandering
    const lerpSpeed = moveDir !== 0 ? 0.14 : 0.04
    skewRef.current += (targetSkew - skewRef.current) * lerpSpeed

    const skew = skewRef.current
    // scaleX slight squash/stretch in direction of look
    const scaleX = 1 + Math.abs(skew) * 0.004

    iconRef.current.style.transform =
      `scaleY(${breathScale}) scaleX(${moveDir !== 0 ? 1 + moveDir * 0.06 : scaleX}) skewX(${-skew * 0.35}deg)`
  })

  return (
    <group ref={groupRef} position={position}>
      <Html center occlude={false} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            ref={iconRef}
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              overflow: 'hidden',
              background: '#000',
              boxShadow: `0 0 0 2px ${iconData.color}88, 0 4px 16px rgba(0,0,0,0.6)`,
              transformOrigin: 'bottom center',
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/heads/CharacterIcons-${headId}.png`}
              alt={username}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              draggable={false}
            />
          </div>
        </div>
      </Html>

      <IdentityBillboard
        username={username}
        reputation={reputation}
        titleOverride={titleOverride}
        yOffset={1.1}
      />
    </group>
  )
}
