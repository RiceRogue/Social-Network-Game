import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import IdentityBillboard from './IdentityBillboard'
import { HEAD_ICONS } from '../store/gameStore'

export default function CharacterSprite({
  position = [0, 0, 0],
  username = 'Player',
  headId = 'blank',
  reputation = 0,
  titleOverride = null,
  moveDir = 0,
}) {
  const groupRef = useRef()
  const iconRef = useRef(null)
  const skewRef = useRef(0)

  const iconData = HEAD_ICONS.find(h => h.id === headId) ?? HEAD_ICONS[0]

  const BOB_FREQ    = 1.4
  const BOB_AMP     = 0.055
  const BREATH_FREQ = 1.2
  const BREATH_AMP  = 0.035

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.position.set(
        position[0],
        position[1] + Math.sin(t * BOB_FREQ * Math.PI * 2) * BOB_AMP,
        position[2]
      )
    }

    const breathScale = 1 + Math.sin(t * BREATH_FREQ * Math.PI * 2) * BREATH_AMP
    const targetSkew = moveDir * 18
    skewRef.current += (targetSkew - skewRef.current) * 0.12

    if (iconRef.current) {
      iconRef.current.style.transform = `scaleY(${breathScale}) skewX(${-skewRef.current * 0.4}deg) scaleX(${1 + moveDir * 0.08})`
    }
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
