import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import CharacterSprite from './CharacterSprite'
import ChatBox from './ChatBox'
import { usePlayerMovement } from '../hooks/usePlayerMovement'
import { useSocket } from '../hooks/useSocket'
import { useGameStore } from '../store/gameStore'

// ── Helpers ───────────────────────────────────────────────────────────────────
function Box({ pos, size, color, roughness = 0.8, metalness = 0 }) {
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}

function Cylinder({ pos, args, color, roughness = 0.7 }) {
  return (
    <mesh position={pos} castShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  )
}

// ── Plaza Map — Club Penguin style 2.5D ───────────────────────────────────────
function PlazaMap() {
  return (
    <group>
      {/* ── Ground layers ── */}
      {/* Main plaza stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 14]} />
        <meshStandardMaterial color="#1c2235" roughness={0.95} />
      </mesh>

      {/* Center courtyard — lighter circle area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[3.5, 64]} />
        <meshStandardMaterial color="#232b40" roughness={0.9} />
      </mesh>

      {/* Courtyard ring accent */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[3.3, 3.5, 64]} />
        <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={0.3} transparent opacity={0.5} />
      </mesh>

      {/* Center fountain pedestal */}
      <Box pos={[0, 0.08, 0]} size={[0.8, 0.16, 0.8]} color="#2a334d" roughness={0.4} metalness={0.3} />
      <Cylinder pos={[0, 0.28, 0]} args={[0.25, 0.3, 0.24, 12]} color="#1a2235" roughness={0.3} metalness={0.5} />
      <Cylinder pos={[0, 0.46, 0]} args={[0.08, 0.1, 0.36, 8]} color="#0d1525" roughness={0.2} metalness={0.7} />
      {/* Fountain glow */}
      <pointLight position={[0, 0.7, 0]} intensity={1.2} color="#00eeff" distance={5} />

      {/* ── Floor tile grid ── */}
      {Array.from({ length: 7 }, (_, i) => i - 3).map((x) => (
        <mesh key={`v${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x * 1.6, 0.011, 0]}>
          <planeGeometry args={[0.02, 13]} />
          <meshBasicMaterial color="#252d42" transparent opacity={0.6} />
        </mesh>
      ))}
      {Array.from({ length: 5 }, (_, i) => i - 2).map((z) => (
        <mesh key={`h${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, z * 1.4]}>
          <planeGeometry args={[21, 0.02]} />
          <meshBasicMaterial color="#252d42" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* ── Path edges ── */}
      {/* Left edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10.8, 0.005, 0]}>
        <planeGeometry args={[0.4, 14]} />
        <meshStandardMaterial color="#141929" roughness={1} />
      </mesh>
      {/* Right edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10.8, 0.005, 0]}>
        <planeGeometry args={[0.4, 14]} />
        <meshStandardMaterial color="#141929" roughness={1} />
      </mesh>

      {/* ── Back wall ── */}
      <Box pos={[0, 1.0, -7.5]} size={[22, 2.0, 0.4]} color="#111827" roughness={0.9} />
      {/* Wall windows */}
      {[-6, -2, 2, 6].map((x, i) => (
        <group key={i} position={[x, 1.2, -7.3]}>
          <Box pos={[0, 0, 0]} size={[1.6, 1.0, 0.1]} color="#0d1525" />
          <Box pos={[0, 0, 0.06]} size={[1.4, 0.85, 0.05]} color="#0a1f3f" roughness={0.1} metalness={0.2} />
          <pointLight position={[0, 0, 0.3]} intensity={0.4} color="#4488ff" distance={3} />
        </group>
      ))}
      {/* Wall top trim */}
      <Box pos={[0, 2.1, -7.5]} size={[22, 0.15, 0.5]} color="#1a2235" roughness={0.6} metalness={0.4} />

      {/* ── Left building ── */}
      <Box pos={[-9.5, 1.2, -3]} size={[3, 2.4, 4]} color="#0f1724" roughness={0.9} />
      <Box pos={[-9.5, 2.45, -3]} size={[3.2, 0.1, 4.2]} color="#1a2540" roughness={0.5} metalness={0.3} />
      {/* Building sign glow strip */}
      <Box pos={[-9.5, 0.25, -1.0]} size={[3, 0.08, 0.05]} color="#00eeff" roughness={0.1} metalness={0.8} />
      <pointLight position={[-9.5, 0.4, -1.0]} intensity={0.6} color="#00eeff" distance={3} />
      {/* Door */}
      <Box pos={[-9.5, 0.5, -1.0]} size={[0.9, 1.0, 0.08]} color="#0a1520" roughness={0.3} metalness={0.1} />

      {/* ── Right building ── */}
      <Box pos={[9.5, 1.2, -3]} size={[3, 2.4, 4]} color="#0f1724" roughness={0.9} />
      <Box pos={[9.5, 2.45, -3]} size={[3.2, 0.1, 4.2]} color="#1a2540" roughness={0.5} metalness={0.3} />
      <Box pos={[9.5, 0.25, -1.0]} size={[3, 0.08, 0.05]} color="#ff6b00" roughness={0.1} metalness={0.8} />
      <pointLight position={[9.5, 0.4, -1.0]} intensity={0.6} color="#ff6b00" distance={3} />
      <Box pos={[9.5, 0.5, -1.0]} size={[0.9, 1.0, 0.08]} color="#0a1520" roughness={0.3} metalness={0.1} />

      {/* ── Lamp posts ── */}
      {[[-6.5, -2.5], [6.5, -2.5], [-6.5, 2.5], [6.5, 2.5]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Post */}
          <Cylinder pos={[0, 0.7, 0]} args={[0.06, 0.08, 1.4, 8]} color="#1a2235" roughness={0.4} />
          {/* Arm */}
          <Box pos={[0.2, 1.45, 0]} size={[0.4, 0.06, 0.06]} color="#1a2235" roughness={0.4} />
          {/* Lamp head */}
          <Box pos={[0.38, 1.38, 0]} size={[0.16, 0.14, 0.16]} color="#0d1525" roughness={0.2} metalness={0.6} />
          <pointLight position={[0.38, 1.5, 0]} intensity={0.8} color="#ffe4a0" distance={4} decay={2} />
        </group>
      ))}

      {/* ── Benches ── */}
      {[[-4.5, 0], [4.5, 0]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Box pos={[0, 0.28, 0]} size={[1.4, 0.1, 0.45]} color="#1e2d1e" roughness={0.8} />
          <Box pos={[0, 0.18, 0.15]} size={[1.4, 0.08, 0.08]} color="#162016" roughness={0.9} />
          <Box pos={[0, 0.18, -0.15]} size={[1.4, 0.08, 0.08]} color="#162016" roughness={0.9} />
        </group>
      ))}

      {/* ── Trees ── */}
      {[[-7.5, -1], [7.5, -1], [-7.5, 1.5], [7.5, 1.5]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Cylinder pos={[0, 0.35, 0]} args={[0.1, 0.14, 0.7, 6]} color="#2d1f0e" roughness={0.95} />
          <Cylinder pos={[0, 1.0, 0]} args={[0.6, 0.8, 0.8, 7]} color="#0d2b18" roughness={0.9} />
          <Cylinder pos={[0, 1.5, 0]} args={[0.45, 0.55, 0.7, 7]} color="#0e3320" roughness={0.9} />
          <Cylinder pos={[0, 1.95, 0]} args={[0.25, 0.35, 0.6, 7]} color="#10391f" roughness={0.9} />
        </group>
      ))}

      {/* ── Foreground floor strip (makes it feel grounded) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 5.5]}>
        <planeGeometry args={[22, 3]} />
        <meshStandardMaterial color="#161c2c" roughness={1} />
      </mesh>

      {/* ── Ambient particles ── */}
      <ParticleDust />
    </group>
  )
}

function ParticleDust() {
  const meshRef = useRef()
  const count = 80
  const positions = useRef(
    Float32Array.from({ length: count * 3 }, (_, i) => {
      const axis = i % 3
      if (axis === 0) return (Math.random() - 0.5) * 20
      if (axis === 1) return Math.random() * 3
      return (Math.random() - 0.5) * 12
    })
  )

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const pos = meshRef.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      pos.setY(i, (positions.current[i * 3 + 1] + Math.sin(t * 0.3 + i * 0.7) * 0.15) % 3)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions.current} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#00eeff" size={0.035} transparent opacity={0.25} />
    </points>
  )
}

// ── Local player ──────────────────────────────────────────────────────────────
function LocalPlayer({ profile }) {
  const { sendMove } = useSocket()
  const posArr = useRef([0, 0, 0])
  const [pos, setPos] = useState([0, 0, 0])
  const [moveDir, setMoveDir] = useState(0)
  const titleOverride = useGameStore((s) => s._titleOverride)
  const reputation = useGameStore((s) => s.reputation)

  usePlayerMovement((newPos, dir) => {
    posArr.current = [newPos.x, 0, newPos.z]
    setPos([newPos.x, 0, newPos.z])
    setMoveDir(dir)
    sendMove([newPos.x, 0, newPos.z], dir)
  })

  return (
    <CharacterSprite
      position={pos}
      username={profile.username}
      headId={profile.headId}
      reputation={reputation}
      titleOverride={titleOverride}
      moveDir={moveDir}
    />
  )
}

function RemotePlayer({ player }) {
  const pos = player.position ?? [
    (Math.random() - 0.5) * 8, 0, (Math.random() - 0.5) * 4,
  ]
  return (
    <CharacterSprite
      position={pos}
      username={player.username}
      headId={player.headId}
      reputation={player.reputation ?? 0}
      moveDir={player.direction ?? 0}
    />
  )
}

// ── HUD ───────────────────────────────────────────────────────────────────────
function NetworkHUD({ profile, onLogout }) {
  const reputation = useGameStore((s) => s.reputation)
  return (
    <div className="absolute top-5 left-5 z-20 flex items-center gap-3">
      <div className="bg-black/70 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5">
        <p className="text-cyan-400 font-bold text-sm tracking-wide">{profile.username}</p>
        <p className="text-yellow-400 text-xs tracking-widest">REP {reputation}</p>
      </div>
      <button onClick={onLogout} className="text-xs text-slate-700 hover:text-red-400 transition-colors">
        ✕ leave
      </button>
    </div>
  )
}

function ControlsHint() {
  return (
    <div className="absolute bottom-5 right-5 z-20 text-slate-800 text-xs text-right space-y-1">
      <p>WASD / arrows to move</p>
      <p>click to walk</p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HubWorld() {
  const profile = useGameStore((s) => s.profile)
  const clearProfile = useGameStore((s) => s.clearProfile)
  const otherPlayers = useGameStore((s) => s.otherPlayers)

  return (
    <div className="w-full h-full relative bg-[#070810]">
      <NetworkHUD profile={profile} onLogout={clearProfile} />
      <ChatBox />
      <ControlsHint />

      <Canvas shadows>
        <OrthographicCamera makeDefault position={[0, 12, 10]} zoom={72} near={0.1} far={200} />

        {/* Global lighting */}
        <ambientLight intensity={0.25} color="#0a0e1a" />
        <directionalLight
          position={[8, 16, 8]}
          intensity={0.7}
          color="#c8d8ff"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <hemisphereLight skyColor="#0a1830" groundColor="#050810" intensity={0.4} />

        <Suspense fallback={null}>
          <PlazaMap />
          <LocalPlayer profile={profile} />
          {Object.values(otherPlayers).map((player) => (
            <RemotePlayer key={player.id} player={player} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  )
}
