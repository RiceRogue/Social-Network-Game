import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import IdentityBillboard from './IdentityBillboard'
import { useGameStore, HEAD_ICONS } from '../store/gameStore'

/**
 * CharacterSprite — 2.5D billboard character using plane geometry.
 *
 * Asset setup:
 *   - Place CharacterIcons-Base.png in /public/assets/CharacterIcons-Base.png
 *   - Place head icons as /public/assets/heads/[id].png (belle.png, chris.png, etc.)
 *
 * Features:
 *   - Phase 2: IdentityBillboard (username/title) rendered above
 *   - Phase 3: Social Heartbeat — vertical bob + breathing scale via Math.sin()
 *   - Head-turn skew: skewX applied to head mesh based on movement direction
 */

// Fallback procedural texture when PNGs are not available
function makeColorTexture(color) {
  const canvas = document.createElement('canvas')
  canvas.width = 64; canvas.height = 64
  const ctx = canvas.getContext('2d')
  // Body
  ctx.fillStyle = '#888'
  ctx.fillRect(8, 24, 48, 40)
  // Head circle
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(32, 18, 16, 0, Math.PI * 2)
  ctx.fill()
  // Eyes
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(25, 16, 3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(39, 16, 3, 0, Math.PI * 2); ctx.fill()
  // Smile
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(32, 20, 8, 0, Math.PI); ctx.stroke()
  return new THREE.CanvasTexture(canvas)
}

export default function CharacterSprite({
  position = [0, 0, 0],
  username = 'Player',
  headId = 'belle',
  reputation = 0,
  titleOverride = null,
  isMoving = false,
  moveDir = 0, // -1 left, 0 neutral, 1 right
}) {
  const groupRef = useRef()
  const bodyRef = useRef()
  const headRef = useRef()

  const iconData = HEAD_ICONS.find(h => h.id === headId) ?? HEAD_ICONS[0]

  // Load textures — fall back gracefully if missing
  const bodyTex = useMemo(() => {
    const loader = new TextureLoader()
    // Try loading the real base sprite
    const tex = loader.load(
      '/assets/CharacterIcons-Base.png',
      undefined,
      undefined,
      () => { /* on error: texture stays default */ }
    )
    tex.magFilter = THREE.NearestFilter
    return tex
  }, [])

  const headTex = useMemo(() => {
    const loader = new TextureLoader()
    const fallback = makeColorTexture(iconData.color)
    const tex = loader.load(
      `/assets/heads/${headId}.png`,
      undefined,
      undefined,
      () => { tex.image = fallback.image; tex.needsUpdate = true }
    )
    tex.magFilter = THREE.NearestFilter
    return tex
  }, [headId, iconData.color])

  // ─── Phase 3: Social Heartbeat ───────────────────────────────────────────
  const IDLE = {
    bobFreq: 1.4,       // Hz of vertical bob
    bobAmp: 0.06,       // world units
    breathFreq: 1.2,    // Hz of scale breathing
    breathAmp: 0.04,    // scale delta
    breathBase: 1.0,
  }

  // ─── Phase 2 / Head-Turn Skew ────────────────────────────────────────────
  const SKEW_MAX = 0.25  // radians-ish of shear

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    // Vertical bob — applied to whole group
    groupRef.current.position.y =
      position[1] + Math.sin(t * IDLE.bobFreq * Math.PI * 2) * IDLE.bobAmp

    // Breathing stretch — applied to body scale.Y
    if (bodyRef.current) {
      const breathe = IDLE.breathBase + Math.sin(t * IDLE.breathFreq * Math.PI * 2) * IDLE.breathAmp
      bodyRef.current.scale.y = breathe
    }

    // Head skew based on movement direction
    if (headRef.current) {
      const targetSkew = moveDir * SKEW_MAX
      // Lerp toward target
      headRef.current.rotation.z = THREE.MathUtils.lerp(
        headRef.current.rotation.z,
        -targetSkew * 0.3,
        0.15
      )
      // X shear via matrix isn't trivial — use a slight scale.x skew trick
      const targetScaleX = 1 + moveDir * 0.12
      headRef.current.scale.x = THREE.MathUtils.lerp(headRef.current.scale.x, targetScaleX, 0.12)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Body sprite */}
      <mesh ref={bodyRef} position={[0, -0.1, 0]}>
        <planeGeometry args={[0.8, 1.0]} />
        <meshBasicMaterial map={bodyTex} transparent alphaTest={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Head sprite — positioned above body */}
      <mesh ref={headRef} position={[0, 0.65, 0.01]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial map={headTex} transparent alphaTest={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Phase 2: Identity Billboard */}
      <IdentityBillboard
        username={username}
        reputation={reputation}
        titleOverride={titleOverride}
        yOffset={1.4}
      />
    </group>
  )
}
